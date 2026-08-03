import { $, attachHls, getCloudContext, normalizePlayback, playbackParam, roomToken, setPill } from './core.js';

const token = roomToken();
const E = {
  checks: $('#checks'), summary: $('#summaryPill'), playback: $('#playbackInput'),
  preview: $('#preview'), videoResult: $('#videoResult')
};

function addCheck(name, state, detail) {
  const row = document.createElement('div');
  row.className = `diagitem ${state}`;
  row.innerHTML = `<i>${state === 'ok' ? '✓' : state === 'warn' ? '!' : '×'}</i><div><b></b><span></span></div>`;
  row.querySelector('b').textContent = name;
  row.querySelector('span').textContent = detail;
  E.checks.append(row);
}

async function run() {
  E.checks.replaceChildren();
  let failures = 0;
  if (window.isSecureContext) addCheck('HTTPS da plataforma', 'ok', 'Contexto seguro disponível.');
  else { failures++; addCheck('HTTPS da plataforma', 'error', 'A página precisa ser aberta por HTTPS.'); }

  if ('fetch' in window && 'URL' in window) addCheck('Navegador', 'ok', 'Recursos web essenciais disponíveis.');
  else { failures++; addCheck('Navegador', 'error', 'Atualize o navegador.'); }

  const nativeHls = E.preview.canPlayType('application/vnd.apple.mpegurl') || E.preview.canPlayType('application/x-mpegURL');
  const hlsJs = Boolean(window.Hls?.isSupported?.());
  addCheck('Player HLS', nativeHls || hlsJs ? 'ok' : 'warn', nativeHls ? 'HLS nativo detectado.' : hlsJs ? 'HLS.js disponível para Chrome/Edge.' : 'Use Safari no iPhone ou Chrome/Edge atualizado.');

  addCheck('DJI Pilot 2 JSBridge', window.djiBridge ? 'ok' : 'warn', window.djiBridge ? 'Página aberta dentro do Pilot 2.' : 'Normal fora do controle. Abra /pilot2 no Open Platforms para testar a Cloud API.');

  try {
    const context = await getCloudContext(token);
    addCheck('Sala Supabase', 'ok', `${context?.room?.name || 'Sala'} · status ${context?.room?.status || 'desconhecido'}.`);
    addCheck('Referências', 'ok', `${(context?.markers || []).length} pontos disponíveis.`);

    const stream = context?.stream;
    if (stream?.gateway_online) {
      const detail = stream.gateway_status === 'receiving' ? 'Gateway conectado e recebendo RTMP.' : 'Gateway conectado, aguardando o Pilot 2.';
      addCheck('Gateway sem cabo', stream.gateway_status === 'receiving' ? 'ok' : 'warn', detail);
    } else addCheck('Gateway sem cabo', 'warn', 'Gateway offline. Execute o pacote privado no notebook.');

    if (stream?.pilot_status === 'streaming') addCheck('Pilot 2', 'ok', 'O controle declarou a transmissão ativa.');
    else addCheck('Pilot 2', 'warn', `Estado: ${stream?.pilot_status || 'offline'}.`);

    if (stream?.playback_url) {
      E.playback.value = stream.playback_url;
      localStorage.setItem(`evora.cloud.lastPlayback.${token}`, stream.playback_url);
      addCheck('URL HLS publicada', 'ok', 'O endereço seguro foi recebido automaticamente pelo Supabase.');
    } else addCheck('URL HLS publicada', 'warn', 'O gateway ainda não publicou o túnel HTTPS.');
  } catch (error) {
    failures++;
    addCheck('Sala Supabase', 'error', error.message);
  }
  setPill(E.summary, failures ? 'error' : 'ok', failures ? `${failures} falha(s)` : 'Base aprovada');
}

async function testPlaylist() {
  const url = normalizePlayback(E.playback.value);
  if (!url) return alert('A URL HLS ainda não foi publicada.');
  E.videoResult.textContent = 'Consultando playlist…';
  try {
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache: 'no-store' });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!text.includes('#EXTM3U')) throw new Error('Resposta sem cabeçalho HLS.');
    E.videoResult.textContent = 'Playlist HLS válida e acessível.';
  } catch (error) {
    E.videoResult.textContent = `Falha: ${error.message}`;
  }
}

async function play() {
  const url = normalizePlayback(E.playback.value);
  if (!url) return alert('A URL HLS ainda não foi publicada.');
  E.videoResult.textContent = 'Abrindo o player…';
  try {
    await attachHls(E.preview, url, {
      onState: (event, detail) => {
        if (event === 'manifest') E.videoResult.textContent = 'Playlist carregada. Aguardando vídeo…';
        if (event === 'autoplay-blocked') E.videoResult.textContent = 'Clique no play do vídeo.';
        if (event === 'fatal') E.videoResult.textContent = `Falha HLS: ${detail?.details || 'erro fatal'}`;
      }
    });
  } catch (error) {
    E.videoResult.textContent = `Falha: ${error.message}`;
  }
}

$('#runBtn').onclick = run;
$('#fetchBtn').onclick = testPlaylist;
$('#playBtn').onclick = play;
E.preview.addEventListener('playing', () => { E.videoResult.textContent = 'Vídeo em reprodução.'; });
E.preview.addEventListener('waiting', () => { E.videoResult.textContent = 'Aguardando segmentos HLS…'; });
E.preview.addEventListener('error', () => { E.videoResult.textContent = 'Stream indisponível. Confirme RTMP, gateway e túnel.'; });
E.playback.value = normalizePlayback(playbackParam() || localStorage.getItem(`evora.cloud.lastPlayback.${token}`) || '');
E.playback.addEventListener('input', () => localStorage.setItem(`evora.cloud.lastPlayback.${token}`, E.playback.value.trim()));
run();
