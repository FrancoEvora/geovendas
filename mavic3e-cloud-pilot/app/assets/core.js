export const CFG = {
  supabaseUrl: 'https://qsdffayasuzsmngteika.supabase.co',
  publishableKey: 'sb_publishable_nMCXNDXMvU0EbMSSmnEfQg_0uE_lVOW',
  defaultRoom: '9df8e45d-e770-4ef7-a2f3-7c5ad7903e3a',
  pollMs: 700,
  cloudPollMs: 2600,
  defaultPath: 'm3e-t564btidzyvoq1jy',
  hlsJsVersion: '1.6.16'
};

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const qs = () => new URLSearchParams(location.search);
export const roomToken = () => qs().get('room') || CFG.defaultRoom;
export const operatorKey = () => qs().get('key') || sessionStorage.getItem('evora.cloud.operatorKey') || '';
export const playbackParam = () => qs().get('playback') || '';
export const randomId = (prefix = 'peer') => `${prefix}-${[...crypto.getRandomValues(new Uint8Array(10))].map(v => v.toString(16).padStart(2, '0')).join('')}`;
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

export function normalizePath(value = CFG.defaultPath) {
  return String(value || CFG.defaultPath).trim().replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9/_-]/g, '-') || CFG.defaultPath;
}

export function normalizeTunnel(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.origin;
  } catch {
    return '';
  }
}

export function buildPlayback(tunnel, path = CFG.defaultPath) {
  const base = normalizeTunnel(tunnel);
  if (!base) return '';
  return `${base}/${normalizePath(path)}/index.m3u8`;
}

export function buildPlayerPage(playback = '') {
  const normalized = normalizePlayback(playback);
  if (!normalized) return '';
  return normalized.replace(/\/index\.m3u8(?:\?.*)?$/i, '');
}

export function buildRtmp(ip, path = CFG.defaultPath) {
  const host = String(ip || '').trim().replace(/^rtmps?:\/\//i, '').replace(/\/+$/g, '');
  return host ? `rtmp://${host.includes(':') ? host : `${host}:1935`}/${normalizePath(path)}` : '';
}

export function normalizePlayback(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/\.m3u8($|\?)/i.test(raw)) return raw;
  const base = normalizeTunnel(raw);
  return base ? `${base}/${CFG.defaultPath}/index.m3u8` : raw;
}

export function viewerUrl({ room = roomToken(), playback = '' } = {}) {
  const url = new URL('/comprador', location.origin);
  if (room) url.searchParams.set('room', room);
  if (playback) url.searchParams.set('playback', playback);
  return url.toString();
}

export function pilotUrl({ room = roomToken(), rtmp = '', playback = '' } = {}) {
  const url = new URL('/pilot2', location.origin);
  if (room) url.searchParams.set('room', room);
  if (rtmp) url.searchParams.set('rtmp', rtmp);
  if (playback) url.searchParams.set('playback', playback);
  return url.toString();
}

export function operatorUrl({ room = roomToken() } = {}) {
  const url = new URL('/operador', location.origin);
  if (room) url.searchParams.set('room', room);
  return url.toString();
}

export function setPill(element, state, text) {
  if (!element) return;
  element.dataset.state = state || '';
  element.textContent = text;
}

export async function rpc(name, body) {
  const response = await fetch(`${CFG.supabaseUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: CFG.publishableKey,
      Authorization: `Bearer ${CFG.publishableKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });
  const text = await response.text();
  let data = text;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) throw new Error(data?.message || data?.hint || `Supabase ${response.status}`);
  return data;
}

export const getContext = token => rpc('spatial_pilot_public_context', { p_public_token: token });
export const getCloudContext = token => rpc('spatial_cloud_public_context', { p_public_token: token });
export const getCloudOperatorContext = (token, key) => rpc('spatial_cloud_operator_context', {
  p_public_token: token,
  p_operator_token: key
});
export const registerCloudGateway = (token, key, lanHost, tunnelUrl, gatewayVersion = '', metadata = {}) => rpc('spatial_cloud_register_gateway', {
  p_public_token: token,
  p_operator_token: key,
  p_lan_host: lanHost,
  p_tunnel_url: tunnelUrl,
  p_gateway_version: gatewayVersion,
  p_metadata: metadata
});
export const heartbeatCloudGateway = (token, key, gatewayStatus, receiving = false, metadata = {}) => rpc('spatial_cloud_gateway_heartbeat', {
  p_public_token: token,
  p_operator_token: key,
  p_gateway_status: gatewayStatus,
  p_stream_receiving: receiving,
  p_metadata: metadata
});
export const setCloudPilotStatus = (token, key, status) => rpc('spatial_cloud_set_pilot_status', {
  p_public_token: token,
  p_operator_token: key,
  p_pilot_status: status
});
export const setRoomStatus = (token, key, status) => rpc('spatial_pilot_set_status', {
  p_public_token: token,
  p_operator_token: key,
  p_status: status
});

export class SignalBus {
  constructor({ token, key = '', id, role, target, onMessage, onState }) {
    Object.assign(this, { token, key, id, role, target, onMessage, onState });
    this.lastId = 0;
    this.running = false;
  }
  send(kind, payload = {}, recipient = '*') {
    return rpc('spatial_pilot_post_signal', {
      p_public_token: this.token,
      p_operator_token: this.key || null,
      p_sender_id: this.id,
      p_recipient_id: recipient,
      p_sender_role: this.role,
      p_kind: kind,
      p_payload: payload
    });
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.loop();
  }
  stop() {
    this.running = false;
    clearTimeout(this.timer);
  }
  async loop() {
    if (!this.running) return;
    try {
      const messages = await rpc('spatial_pilot_read_signals', {
        p_public_token: this.token,
        p_operator_token: this.key || null,
        p_recipient_id: this.target,
        p_recipient_role: this.role,
        p_after_id: this.lastId
      });
      for (const message of messages || []) {
        this.lastId = Math.max(this.lastId, Number(message.id) || 0);
        await this.onMessage?.(message);
      }
      this.onState?.('ok');
    } catch (error) {
      this.onState?.('error', error);
    } finally {
      if (this.running) this.timer = setTimeout(() => this.loop(), CFG.pollMs);
    }
  }
}

export function serverMarkers(context) {
  return (context?.markers || []).map((marker, index) => ({
    id: String(marker.id || index),
    label: marker.label || `Referência ${index + 1}`,
    category: marker.category || 'Referência',
    status: marker.status || 'active',
    description: marker.description || '',
    x: Number(marker.x_ratio ?? marker.x ?? 0.5),
    y: Number(marker.y_ratio ?? marker.y ?? 0.5)
  }));
}

export function loadMarkers(token, fallback = []) {
  try {
    const saved = JSON.parse(localStorage.getItem(`evora.cloud.markers.${token}`));
    return Array.isArray(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

export function saveMarkers(token, markers) {
  localStorage.setItem(`evora.cloud.markers.${token}`, JSON.stringify(markers));
}

export function contentRect(video, box) {
  const bounds = box.getBoundingClientRect();
  const sourceWidth = video?.videoWidth || 16;
  const sourceHeight = video?.videoHeight || 9;
  const sourceRatio = sourceWidth / sourceHeight;
  const boxRatio = bounds.width / bounds.height;
  let width = bounds.width;
  let height = bounds.height;
  let left = 0;
  let top = 0;
  if (boxRatio > sourceRatio) {
    width = bounds.height * sourceRatio;
    left = (bounds.width - width) / 2;
  } else {
    height = bounds.width / sourceRatio;
    top = (bounds.height - height) / 2;
  }
  return { bounds, width, height, left, top };
}

export function pointFromEvent(event, video, box) {
  const rect = contentRect(video, box);
  const x = (event.clientX - rect.bounds.left - rect.left) / rect.width;
  const y = (event.clientY - rect.bounds.top - rect.top) / rect.height;
  return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null;
}

export function placeMarker(element, marker, video, box) {
  const rect = contentRect(video, box);
  element.style.left = `${rect.left + rect.width * marker.x}px`;
  element.style.top = `${rect.top + rect.height * marker.y}px`;
}

export async function copyText(text) {
  if (!text) return;
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const input = document.createElement('textarea');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  document.execCommand('copy');
  input.remove();
}

export function parseBridgeResult(raw) {
  if (raw == null) return { code: -1, message: 'Sem retorno do DJI Pilot 2', data: null };
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return { code: 0, message: String(raw), data: raw }; }
}

const hlsInstances = new WeakMap();
export function destroyHls(video) {
  const previous = hlsInstances.get(video);
  if (previous?.destroy) previous.destroy();
  hlsInstances.delete(video);
  if (video) {
    video.pause?.();
    video.removeAttribute?.('src');
    video.load?.();
  }
}

export async function attachHls(video, source, { autoPlay = true, muted = true, lowLatency = true, onState } = {}) {
  if (!video) throw new Error('Player de vídeo não encontrado.');
  const url = normalizePlayback(source);
  if (!url) throw new Error('URL HLS ausente.');
  destroyHls(video);
  video.muted = muted;
  video.playsInline = true;

  const native = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  if (native) {
    video.src = url;
    video.load();
    onState?.('attached', 'native');
    if (autoPlay) await video.play().catch(error => onState?.('autoplay-blocked', error));
    return { type: 'native', destroy: () => destroyHls(video) };
  }

  if (window.Hls?.isSupported?.()) {
    const hls = new window.Hls({
      lowLatencyMode: lowLatency,
      liveSyncDurationCount: 2,
      liveMaxLatencyDurationCount: 5,
      maxLiveSyncPlaybackRate: 1.15,
      backBufferLength: 0,
      enableWorker: true
    });
    hlsInstances.set(video, hls);
    hls.on(window.Hls.Events.MEDIA_ATTACHED, () => onState?.('attached', 'hls.js'));
    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
      onState?.('manifest', 'hls.js');
      if (autoPlay) video.play().catch(error => onState?.('autoplay-blocked', error));
    });
    hls.on(window.Hls.Events.ERROR, (_event, data) => {
      onState?.(data?.fatal ? 'fatal' : 'warning', data);
      if (!data?.fatal) return;
      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
      else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
      else hls.destroy();
    });
    hls.loadSource(url);
    hls.attachMedia(video);
    return { type: 'hls.js', destroy: () => destroyHls(video) };
  }

  throw new Error('Este navegador não oferece HLS nativo nem Media Source Extensions. Use Safari no iPhone ou Chrome/Edge atualizado.');
}
