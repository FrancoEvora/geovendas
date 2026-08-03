import {
  $, CFG, SignalBus, attachHls, getCloudContext, normalizePlayback, placeMarker,
  playbackParam, randomId, roomToken, serverMarkers, setPill
} from './core.js';

const token = roomToken();
const viewerId = randomId('viewer');
const state = {
  started: false,
  playback: normalizePlayback(playbackParam()),
  loadedPlayback: '',
  live: false,
  labels: true,
  markers: [],
  telemetry: { heading: 0, gimbal: 0, battery: null, source: 'Pilot 2 / RTMP' },
  signal: null,
  lastStateAt: 0,
  cloud: null,
  loading: false
};

const E = {
  stage: $('#stage'), video: $('#video'), overlay: $('#overlay'), messageLayer: $('#messageLayer'),
  messageTitle: $('#messageTitle'), messageText: $('#messageText'), statusPill: $('#statusPill'),
  sceneName: $('#sceneName'), source: $('#source'), heading: $('#heading'), gimbal: $('#gimbal'), battery: $('#battery'),
  detail: $('#detail'), detailCategory: $('#detailCategory'), detailName: $('#detailName'),
  detailDescription: $('#detailDescription'), startBtn: $('#startBtn'), retryBtn: $('#retryBtn')
};

function showMessage(title, text, retry = false) {
  E.messageTitle.textContent = title;
  E.messageText.textContent = text;
  E.messageLayer.hidden = false;
  E.retryBtn.hidden = !retry;
}
function hideMessage() { E.messageLayer.hidden = true; }

function markerElement(marker, index) {
  const button = document.createElement('button');
  button.className = `marker ${marker.status || 'active'}`;
  button.innerHTML = `<span class="pin"><span>${String(index + 1).padStart(2, '0')}</span></span><span class="mlabel"><small></small><b></b></span>`;
  button.querySelector('small').textContent = marker.category || 'Referência';
  button.querySelector('b').textContent = marker.label;
  button.onclick = event => {
    event.stopPropagation();
    E.detailCategory.textContent = marker.category || 'REFERÊNCIA';
    E.detailName.textContent = marker.label;
    E.detailDescription.textContent = marker.description || 'Informação identificada na apresentação ao vivo.';
    E.detail.hidden = false;
  };
  placeMarker(button, marker, E.video, E.stage);
  return button;
}

function renderMarkers() {
  E.overlay.replaceChildren();
  if (!state.labels) return;
  state.markers.forEach((marker, index) => E.overlay.append(markerElement(marker, index)));
}

function renderTelemetry() {
  E.source.textContent = state.telemetry.source || 'Pilot 2 / RTMP';
  E.heading.textContent = `${Number(state.telemetry.heading) || 0}°`;
  E.gimbal.textContent = `${Number(state.telemetry.gimbal) || 0}°`;
  E.battery.textContent = state.telemetry.battery == null ? '—' : `${Number(state.telemetry.battery) || 0}%`;
}

async function loadStream({ force = false } = {}) {
  if (!state.started) return;
  if (!state.playback) {
    showMessage('Aguardando o gateway', 'O endereço seguro do vídeo ainda não foi publicado. Mantenha esta tela aberta.', false);
    return;
  }
  if (!force && state.loadedPlayback === state.playback && !E.video.paused) return;
  if (state.loading) return;
  state.loading = true;
  try {
    showMessage('Conectando à câmera', 'Recebendo a transmissão enviada pelo DJI Pilot 2…', false);
    state.loadedPlayback = state.playback;
    await attachHls(E.video, state.playback, {
      onState: (event, detail) => {
        if (event === 'manifest') setPill(E.statusPill, 'warn', 'Recebendo sinal');
        if (event === 'autoplay-blocked') showMessage('Toque para assistir', 'O Safari precisa de uma ação para iniciar o vídeo.', true);
        if (event === 'fatal') {
          setPill(E.statusPill, 'error', 'Falha no vídeo');
          showMessage('Transmissão interrompida', detail?.details || 'O gateway perdeu o sinal. Tente novamente.', true);
        }
      }
    });
  } catch (error) {
    state.loadedPlayback = '';
    setPill(E.statusPill, 'error', 'Sem vídeo');
    showMessage('Transmissão ainda indisponível', error.message, true);
  } finally {
    state.loading = false;
  }
}

function applyCloudState(payload) {
  if (!payload || payload.type !== 'cloud-state') return;
  state.lastStateAt = Date.now();
  state.live = Boolean(payload.live);
  if (payload.playback) {
    const next = normalizePlayback(payload.playback);
    if (next && next !== state.playback) {
      state.playback = next;
      if (state.started) loadStream({ force: true });
    }
  }
  if (Array.isArray(payload.markers)) state.markers = payload.markers;
  if (payload.telemetry) state.telemetry = payload.telemetry;
  if (payload.scene) E.sceneName.textContent = payload.scene;
  setPill(E.statusPill, state.live ? 'live' : 'ok', state.live ? 'AO VIVO' : 'Preparando');
  renderTelemetry();
  renderMarkers();
}

async function onSignal(message) {
  if (message.kind === 'ping') applyCloudState(message.payload);
}

function startSignal() {
  state.signal = new SignalBus({
    token,
    id: viewerId,
    role: 'viewer',
    target: viewerId,
    onMessage: onSignal,
    onState: status => {
      if (status === 'error' && !state.playback) setPill(E.statusPill, 'warn', 'Reconectando');
    }
  });
  state.signal.start();
  const announce = () => state.signal.send('viewer-ready', { type: 'cloud-viewer-ready', restart: false }, 'operator').catch(() => {});
  announce();
  setInterval(announce, 7000);
}

function applyPublicContext(context) {
  state.cloud = context;
  if (!state.markers.length) state.markers = serverMarkers(context);
  if (context?.scene?.name) E.sceneName.textContent = `${context.scene.name} · Mavic 3E`;
  if (context?.stream?.playback_url) {
    const next = normalizePlayback(context.stream.playback_url);
    if (next && next !== state.playback) {
      state.playback = next;
      if (state.started) loadStream({ force: true });
    }
  }

  const gatewayOnline = Boolean(context?.stream?.gateway_online);
  const receiving = context?.stream?.gateway_status === 'receiving';
  const pilotStreaming = context?.stream?.pilot_status === 'streaming';
  const roomLive = context?.room?.status === 'live';
  state.live = receiving || pilotStreaming || roomLive;

  if (!state.lastStateAt || Date.now() - state.lastStateAt > 12000) {
    if (state.live) setPill(E.statusPill, 'live', 'AO VIVO');
    else if (gatewayOnline) setPill(E.statusPill, 'ok', 'Gateway pronto');
    else setPill(E.statusPill, '', 'Aguardando');
  }

  if (!state.started) {
    if (state.playback && gatewayOnline) {
      E.messageTitle.textContent = state.live ? 'Transmissão disponível' : 'Gateway conectado';
      E.messageText.textContent = state.live
        ? 'Toque para assistir à câmera do Mavic 3E.'
        : 'Toque para preparar o player. O vídeo começará quando o Pilot 2 transmitir.';
    } else {
      E.messageTitle.textContent = 'Aguardando o operador';
      E.messageText.textContent = 'A câmera aparecerá assim que o gateway e o DJI Pilot 2 estiverem conectados.';
    }
  }
  renderMarkers();
}

async function refreshContext() {
  try {
    const context = await getCloudContext(token);
    applyPublicContext(context);
  } catch (error) {
    console.error(error);
    if (!state.playback) setPill(E.statusPill, 'warn', 'Reconectando');
  }
}

function bind() {
  E.startBtn.onclick = () => {
    state.started = true;
    loadStream({ force: true });
    state.signal?.send('viewer-ready', { type: 'cloud-viewer-ready', restart: true }, 'operator').catch(() => {});
  };
  E.retryBtn.onclick = () => { state.started = true; loadStream({ force: true }); };
  $('#reloadBtn').onclick = () => { state.started = true; loadStream({ force: true }); };
  $('#fullBtn').onclick = () => E.stage.requestFullscreen?.();
  $('#labelsBtn').onclick = event => {
    state.labels = !state.labels;
    event.currentTarget.textContent = state.labels ? '◎ Ocultar pontos' : '◎ Exibir pontos';
    renderMarkers();
  };
  E.stage.onclick = event => { if (!event.target.closest('.marker')) E.detail.hidden = true; };
  E.video.addEventListener('loadedmetadata', renderMarkers);
  E.video.addEventListener('playing', () => {
    hideMessage();
    setPill(E.statusPill, 'live', 'AO VIVO');
    renderMarkers();
  });
  E.video.addEventListener('waiting', () => setPill(E.statusPill, 'warn', 'Carregando'));
  E.video.addEventListener('stalled', () => setPill(E.statusPill, 'warn', 'Sinal instável'));
  E.video.addEventListener('error', () => {
    showMessage('Transmissão ainda indisponível', 'Confirme que o gateway está aberto e que o Pilot 2 iniciou o RTMP.', true);
    setPill(E.statusPill, 'error', 'Sem vídeo');
  });
  window.addEventListener('resize', renderMarkers);
  window.addEventListener('beforeunload', () => {
    state.signal?.send('leave', {}, 'operator').catch(() => {});
    state.signal?.stop();
  });
}

async function init() {
  bind();
  startSignal();
  await refreshContext();
  renderTelemetry();
  setInterval(refreshContext, CFG.cloudPollMs);
  if (state.playback) E.messageText.textContent = 'A transmissão foi configurada. Toque para iniciar no Safari.';
}

init();
