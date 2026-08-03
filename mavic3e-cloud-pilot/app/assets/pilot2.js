import {
  $, $$, CFG, copyText, getCloudOperatorContext, operatorKey, parseBridgeResult,
  pilotUrl, playbackParam, roomToken, setCloudPilotStatus, setPill, viewerUrl
} from './core.js';

const token = roomToken();
const Q = new URLSearchParams(location.search);
const bridge = () => window.djiBridge;
const state = {
  key: operatorKey(),
  keyValid: false,
  cloud: null,
  license: false,
  module: false,
  configured: false,
  live: false,
  refreshing: false
};

const E = {
  bridgePill: $('#bridgePill'), streamPill: $('#streamPill'), gatewayPill: $('#gatewayPill'),
  quickRtmp: $('#quickRtmp'), quickPlayback: $('#quickPlayback'), quickViewer: $('#quickViewer'), openQuickViewer: $('#openQuickViewer'),
  bridgeStatus: $('#bridgeStatus'), licenseStatus: $('#licenseStatus'), moduleStatus: $('#moduleStatus'), configStatus: $('#configStatus'), liveStatus: $('#liveStatus'), log: $('#bridgeLog'),
  appId: $('#appId'), appKey: $('#appKey'), appLicense: $('#appLicense'), remember: $('#rememberSession'),
  workspaceName: $('#workspaceName'), workspaceDescription: $('#workspaceDescription'), cloudRtmp: $('#cloudRtmp'), cloudPlayback: $('#cloudPlayback'),
  operatorKey: $('#pilotOperatorKey'), gatewayStatus: $('#gatewayStatus'), gatewayHeartbeat: $('#gatewayHeartbeat')
};

function log(message, data) {
  const time = new Date().toLocaleTimeString('pt-BR');
  const suffix = data === undefined ? '' : `\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;
  E.log.textContent = `[${time}] ${message}${suffix}\n\n${E.log.textContent}`.slice(0, 15000);
}

function updateQuick() {
  const playback = E.quickPlayback.value.trim();
  const url = viewerUrl({ room: token });
  E.quickViewer.textContent = url;
  E.openQuickViewer.href = url;
  localStorage.setItem(`evora.cloud.quick.${token}`, JSON.stringify({ rtmp: E.quickRtmp.value.trim(), playback }));
}

function bridgeAvailable() {
  const present = Boolean(bridge());
  E.bridgeStatus.textContent = present ? 'Detectado' : 'Não detectado';
  setPill(E.bridgePill, present ? 'ok' : 'warn', present ? 'DJI Pilot 2 detectado' : 'Fora do Pilot 2');
  return present;
}

async function callBridge(method, ...args) {
  if (!bridgeAvailable()) throw new Error('Abra esta página dentro do DJI Pilot 2 → Open Platforms.');
  const fn = bridge()?.[method];
  if (typeof fn !== 'function') throw new Error(`JSBridge não oferece ${method} nesta versão do Pilot 2.`);
  const raw = await Promise.resolve(fn.apply(bridge(), args));
  const result = parseBridgeResult(raw);
  log(`${method} executado`, result);
  if (result.code !== 0 && result.data !== true) throw new Error(result.message || `${method} falhou`);
  return result;
}

function applyCloud(cloud) {
  if (!cloud) return;
  state.cloud = cloud;
  if (cloud.ingest_url) {
    E.quickRtmp.value = cloud.ingest_url;
    E.cloudRtmp.value = cloud.ingest_url;
  }
  if (cloud.playback_url) {
    E.quickPlayback.value = cloud.playback_url;
    E.cloudPlayback.value = cloud.playback_url;
  }
  updateQuick();

  const online = Boolean(cloud.gateway_online);
  const receiving = cloud.gateway_status === 'receiving';
  E.gatewayStatus.textContent = receiving ? 'Recebendo RTMP' : online ? 'Conectado' : 'Offline';
  E.gatewayHeartbeat.textContent = cloud.last_heartbeat_at ? new Date(cloud.last_heartbeat_at).toLocaleTimeString('pt-BR') : '—';
  setPill(E.gatewayPill, receiving ? 'live' : online ? 'ok' : 'warn', receiving ? 'Gateway recebendo' : online ? 'Gateway pronto' : 'Gateway offline');

  state.live = cloud.pilot_status === 'streaming';
  E.liveStatus.textContent = state.live ? 'Ativa' : cloud.pilot_status === 'error' ? 'Erro' : 'Parada';
  setPill(E.streamPill, state.live ? 'live' : cloud.pilot_status === 'error' ? 'error' : 'ok', state.live ? 'AO VIVO' : 'Parado');
}

async function validateOperatorKey() {
  const key = E.operatorKey.value.trim();
  if (!key) return alert('Cole a chave privada do operador.');
  try {
    const cloud = await getCloudOperatorContext(token, key);
    state.key = key;
    state.keyValid = true;
    sessionStorage.setItem('evora.cloud.operatorKey', key);
    applyCloud(cloud);
    await setCloudPilotStatus(token, key, state.live ? 'streaming' : 'ready');
    log('Sala segura validada e URLs carregadas.');
  } catch (error) {
    state.keyValid = false;
    alert(error.message);
    log('Falha na chave do operador', error.message);
  }
}

async function refreshCloud() {
  if (!state.keyValid || state.refreshing) return;
  state.refreshing = true;
  try {
    applyCloud(await getCloudOperatorContext(token, state.key));
  } catch (error) {
    console.error(error);
    setPill(E.gatewayPill, 'warn', 'Atualizando gateway…');
  } finally {
    state.refreshing = false;
  }
}

function rememberCredentials() {
  if (!E.remember.checked) {
    sessionStorage.removeItem('evora.dji.credentials');
    return;
  }
  sessionStorage.setItem('evora.dji.credentials', JSON.stringify({
    appId: E.appId.value.trim(), appKey: E.appKey.value, license: E.appLicense.value.trim()
  }));
}

async function verifyLicense() {
  const appId = E.appId.value.trim();
  const appKey = E.appKey.value;
  const license = E.appLicense.value.trim();
  if (!appId || !appKey || !license) return alert('Preencha App ID, App Key e App License.');
  try {
    const result = await callBridge('platformVerifyLicense', appId, appKey, license);
    state.license = result.data === true || result.code === 0;
    E.licenseStatus.textContent = state.license ? 'Verificada' : 'Rejeitada';
    rememberCredentials();
  } catch (error) {
    state.license = false;
    E.licenseStatus.textContent = 'Falhou';
    log('Falha na licença', error.message);
    alert(error.message);
  }
}

async function setWorkspace() {
  try {
    if (!state.license) throw new Error('Verifique a licença primeiro.');
    await callBridge('platformSetWorkspaceId', token);
    await callBridge('platformSetInformation', 'Évora Spatial', E.workspaceName.value.trim() || 'Mavic 3E', E.workspaceDescription.value.trim() || 'Apresentação ao vivo');
    log('Workspace definido com sucesso.');
  } catch (error) { log('Falha ao definir workspace', error.message); alert(error.message); }
}

async function syncPilotStatusFromBridge(raw) {
  const status = parseBridgeResult(raw);
  log('Status ao vivo recebido do Pilot 2', status);
  const data = status.data || status;
  state.live = Number(data.status) > 0;
  E.liveStatus.textContent = state.live ? 'Ativa' : 'Parada';
  setPill(E.streamPill, state.live ? 'live' : 'ok', state.live ? 'AO VIVO' : 'Pronto');
  if (state.keyValid) await setCloudPilotStatus(token, state.key, state.live ? 'streaming' : 'ready').catch(error => log('Falha ao sincronizar status', error.message));
}

async function loadModule() {
  try {
    if (!state.license) throw new Error('Verifique a licença primeiro.');
    window.evoraDjiLiveStatus = syncPilotStatusFromBridge;
    const params = JSON.stringify({ videoPublishType: 'video-by-manual', statusCallback: 'evoraDjiLiveStatus' });
    await callBridge('platformLoadComponent', 'liveshare', params);
    if (typeof bridge()?.liveshareSetStatusCallback === 'function') await callBridge('liveshareSetStatusCallback', 'evoraDjiLiveStatus');
    state.module = true;
    E.moduleStatus.textContent = 'Carregado';
  } catch (error) {
    state.module = false;
    E.moduleStatus.textContent = 'Falhou';
    log('Falha ao carregar liveshare', error.message);
    alert(error.message);
  }
}

async function configureLive() {
  const rtmp = E.cloudRtmp.value.trim();
  if (!rtmp.startsWith('rtmp://') && !rtmp.startsWith('rtmps://')) return alert('Informe uma URL RTMP válida.');
  try {
    if (!state.module) throw new Error('Carregue o módulo liveshare primeiro.');
    if (typeof bridge()?.liveshareSetVideoPublishType === 'function') await callBridge('liveshareSetVideoPublishType', 'video-by-manual');
    await callBridge('liveshareSetConfig', 2, JSON.stringify({ url: rtmp }));
    state.configured = true;
    E.configStatus.textContent = 'Configurado';
    E.quickRtmp.value = rtmp;
    E.quickPlayback.value = E.cloudPlayback.value.trim();
    updateQuick();
  } catch (error) {
    state.configured = false;
    E.configStatus.textContent = 'Falhou';
    log('Falha na configuração RTMP', error.message);
    alert(error.message);
  }
}

async function startLive() {
  try {
    if (!state.configured) throw new Error('Configure o RTMP primeiro.');
    await callBridge('liveshareStartLive');
    state.live = true;
    E.liveStatus.textContent = 'Ativa';
    setPill(E.streamPill, 'live', 'AO VIVO');
    if (state.keyValid) await setCloudPilotStatus(token, state.key, 'streaming');
  } catch (error) { log('Falha ao iniciar transmissão', error.message); alert(error.message); }
}

async function stopLive() {
  try {
    await callBridge('liveshareStopLive');
    state.live = false;
    E.liveStatus.textContent = 'Parada';
    setPill(E.streamPill, 'ok', 'Parada');
    if (state.keyValid) await setCloudPilotStatus(token, state.key, 'ready');
  } catch (error) { log('Falha ao parar transmissão', error.message); alert(error.message); }
}

async function getLiveStatus() {
  try {
    const result = await callBridge('liveshareGetStatus');
    await syncPilotStatusFromBridge(result);
  } catch (error) { log('Falha ao ler status', error.message); alert(error.message); }
}

function bind() {
  $$('[data-tab]').forEach(button => button.onclick = () => {
    $$('[data-tab]').forEach(item => item.classList.toggle('active', item === button));
    $('#quickTab').classList.toggle('hidden', button.dataset.tab !== 'quick');
    $('#cloudTab').classList.toggle('hidden', button.dataset.tab !== 'cloud');
  });
  E.quickRtmp.addEventListener('input', updateQuick);
  E.quickPlayback.addEventListener('input', updateQuick);
  $('#copyQuickRtmp').onclick = () => E.quickRtmp.value ? copyText(E.quickRtmp.value) : alert('O gateway ainda não informou a URL RTMP.');
  $('#copyQuickViewer').onclick = () => copyText(E.quickViewer.textContent);
  $('#validatePilotKey').onclick = validateOperatorKey;
  $('#refreshPilotCloud').onclick = refreshCloud;
  $('#verifyLicense').onclick = verifyLicense;
  $('#setWorkspace').onclick = setWorkspace;
  $('#loadLiveModule').onclick = loadModule;
  $('#configureLive').onclick = configureLive;
  $('#startLive').onclick = startLive;
  $('#stopLive').onclick = stopLive;
  $('#getLiveStatus').onclick = getLiveStatus;
  E.cloudRtmp.addEventListener('input', () => { E.quickRtmp.value = E.cloudRtmp.value; updateQuick(); });
  E.cloudPlayback.addEventListener('input', () => { E.quickPlayback.value = E.cloudPlayback.value; updateQuick(); });
}

async function init() {
  bind();
  bridgeAvailable();
  const savedQuick = JSON.parse(localStorage.getItem(`evora.cloud.quick.${token}`) || '{}');
  E.quickRtmp.value = Q.get('rtmp') || savedQuick.rtmp || '';
  E.quickPlayback.value = Q.get('playback') || playbackParam() || savedQuick.playback || '';
  E.cloudRtmp.value = E.quickRtmp.value;
  E.cloudPlayback.value = E.quickPlayback.value;
  E.operatorKey.value = state.key;
  const savedCredentials = JSON.parse(sessionStorage.getItem('evora.dji.credentials') || '{}');
  E.appId.value = savedCredentials.appId || '';
  E.appKey.value = savedCredentials.appKey || '';
  E.appLicense.value = savedCredentials.license || '';
  E.remember.checked = Boolean(savedCredentials.appId);
  updateQuick();
  setInterval(bridgeAvailable, 3000);
  setInterval(refreshCloud, CFG.cloudPollMs);
  log(`Página carregada. URL do módulo: ${pilotUrl({ room: token, rtmp: E.quickRtmp.value, playback: E.quickPlayback.value })}`);
  if (state.key) await validateOperatorKey();
}

init();
