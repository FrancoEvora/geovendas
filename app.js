const STORAGE_KEY = 'geovendas_casa_v25_points';
const DB_NAME = 'geovendas_casa_v25_media';
const DB_VERSION = 1;
const MEDIA_STORE = 'media';
const DUPLICATE_NORMALIZER = (value) => String(value || '').trim().toLocaleLowerCase('pt-BR');

const els = {
  cameraVideo: document.getElementById('cameraVideo'),
  menuToggle: document.getElementById('menuToggle'),
  menuDrawer: document.getElementById('menuDrawer'),
  closeMenu: document.getElementById('closeMenu'),
  panelToggle: document.getElementById('panelToggle'),
  panel: document.getElementById('panel'),
  closePanel: document.getElementById('closePanel'),
  activateBtn: document.getElementById('activateBtn'),
  activationCard: document.getElementById('activationCard'),
  activationStartBtn: document.getElementById('activationStartBtn'),
  showLocationsBtn: document.getElementById('showLocationsBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  clearBtn: document.getElementById('clearBtn'),
  gpsStatus: document.getElementById('gpsStatus'),
  accuracyStatus: document.getElementById('accuracyStatus'),
  headingStatus: document.getElementById('headingStatus'),
  countStatus: document.getElementById('countStatus'),
  headingValue: document.getElementById('headingValue'),
  compassNeedle: document.getElementById('compassNeedle'),
  floatingPointsLayer: document.getElementById('floatingPointsLayer'),
  pointName: document.getElementById('pointName'),
  markMode: document.getElementById('markMode'),
  pointDescription: document.getElementById('pointDescription'),
  mediaInput: document.getElementById('mediaInput'),
  mediaPreview: document.getElementById('mediaPreview'),
  savePointBtn: document.getElementById('savePointBtn'),
  refreshGpsBtn: document.getElementById('refreshGpsBtn'),
  pointList: document.getElementById('pointList'),
  toast: document.getElementById('toast'),
  currentPlaceCard: document.getElementById('currentPlaceCard'),
  currentPlaceName: document.getElementById('currentPlaceName'),
  currentPlaceMeta: document.getElementById('currentPlaceMeta'),
  currentPlaceInfoBtn: document.getElementById('currentPlaceInfoBtn'),
  confirmModal: document.getElementById('confirmModal'),
  confirmTitle: document.getElementById('confirmTitle'),
  confirmMessage: document.getElementById('confirmMessage'),
  confirmCancel: document.getElementById('confirmCancel'),
  confirmAccept: document.getElementById('confirmAccept'),
  detailsModal: document.getElementById('detailsModal'),
  closeDetails: document.getElementById('closeDetails'),
  detailsTitle: document.getElementById('detailsTitle'),
  detailsContent: document.getElementById('detailsContent'),
  viewerModal: document.getElementById('viewerModal'),
  closeViewer: document.getElementById('closeViewer'),
  viewerTitle: document.getElementById('viewerTitle'),
  viewerContent: document.getElementById('viewerContent'),
  aiStudioModal: document.getElementById('aiStudioModal'),
  closeAiStudio: document.getElementById('closeAiStudio'),
  aiStudioTitle: document.getElementById('aiStudioTitle'),
  aiUsePointPhotoBtn: document.getElementById('aiUsePointPhotoBtn'),
  aiCaptureCameraBtn: document.getElementById('aiCaptureCameraBtn'),
  aiLotPhotoInput: document.getElementById('aiLotPhotoInput'),
  aiLotPreview: document.getElementById('aiLotPreview'),
  aiFloors: document.getElementById('aiFloors'),
  aiTime: document.getElementById('aiTime'),
  aiGarden: document.getElementById('aiGarden'),
  aiPool: document.getElementById('aiPool'),
  aiWall: document.getElementById('aiWall'),
  aiGarage: document.getElementById('aiGarage'),
  aiNotes: document.getElementById('aiNotes'),
  aiBuildPromptBtn: document.getElementById('aiBuildPromptBtn'),
  aiGenerateBtn: document.getElementById('aiGenerateBtn'),
  aiPromptBox: document.getElementById('aiPromptBox'),
  aiResult: document.getElementById('aiResult'),
  aiCopyPromptBtn: document.getElementById('aiCopyPromptBtn'),
  aiSaveResultBtn: document.getElementById('aiSaveResultBtn'),
  aiShareResultBtn: document.getElementById('aiShareResultBtn'),
  simulatorScreen: document.getElementById('simulatorScreen'),
  simMenuBtn: document.getElementById('simMenuBtn'),
  simMenu: document.getElementById('simMenu'),
  closeSimulator: document.getElementById('closeSimulator'),
  simUseCameraBtn: document.getElementById('simUseCameraBtn'),
  simUsePhotoBtn: document.getElementById('simUsePhotoBtn'),
  simPhotoInput: document.getElementById('simPhotoInput'),
  simPhotoLayer: document.getElementById('simPhotoLayer'),
  simPhotoPreview: document.getElementById('simPhotoPreview'),
  simGalleryWrap: document.getElementById('simGalleryWrap'),
  simGallery: document.getElementById('simGallery'),
  simCompassNeedle: document.getElementById('simCompassNeedle'),
  simHeading: document.getElementById('simHeading'),
  simStage: document.getElementById('simStage'),
  simModelLabel: document.getElementById('simModelLabel'),
  simGuideMeta: document.getElementById('simGuideMeta'),
  simPointName: document.getElementById('simPointName'),
  simPointMeta: document.getElementById('simPointMeta'),
  simDetailsBtn: document.getElementById('simDetailsBtn'),
  simModelSelect: document.getElementById('simModelSelect'),
  modelCards: document.getElementById('modelCards'),
  simScaleBtn: document.getElementById('simScaleBtn'),
  simRotateBtn: document.getElementById('simRotateBtn'),
  simFrontBtn: document.getElementById('simFrontBtn'),
  simDepthBtn: document.getElementById('simDepthBtn'),
  simSetbackBtn: document.getElementById('simSetbackBtn'),
  simCenterBtn: document.getElementById('simCenterBtn'),
  simGpsBtn: document.getElementById('simGpsBtn'),
  simSaveBtn: document.getElementById('simSaveBtn'),
  simLotWidth: document.getElementById('simLotWidth'),
  simLotDepth: document.getElementById('simLotDepth'),
  simSetback: document.getElementById('simSetback')
};

const state = {
  db: null,
  cameraStream: null,
  watchId: null,
  activated: false,
  points: [],
  currentCoords: null,
  accuracy: null,
  heading: null,
  orientationListening: false,
  nearestPointId: null,
  draftMediaFiles: [],
  tempUrls: new Set(),
  confirmAction: null,
  aiStudio: {
    pointId: null,
    model: 'cleoni',
    lotPhotoDataUrl: '',
    resultDataUrl: '',
    prompt: '',
    busy: false
  },
  simulator: {
    active: false,
    pointId: null,
    menuOpen: false,
    model: 'conforto',
    x: 50,
    y: 44,
    scale: 1,
    rotation: 0,
    lotWidth: 12,
    lotDepth: 30,
    setback: 5,
    backgroundMode: 'camera',
    backgroundMediaId: null,
    backgroundUrl: '',
    customPhotoUrl: '',
    drag: null
  }
};

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function normalizeDegrees(v) { let n = Number(v) || 0; while (n < 0) n += 360; while (n >= 360) n -= 360; return n; }
function formatDistance(m) {
  if (!Number.isFinite(m)) return '—';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2).replace('.', ',')} km`;
}
function formatLatLng(value) { return Number(value).toFixed(6).replace('.', ','); }
function formatDate(value) {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => els.toast.classList.add('hidden'), 2600);
}
function savePoints() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.points));
}
function loadPoints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.points = raw ? JSON.parse(raw) : [];
  } catch {
    state.points = [];
  }
}
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function mediaStore(mode = 'readonly') {
  return state.db.transaction(MEDIA_STORE, mode).objectStore(MEDIA_STORE);
}
function putMedia(key, blob) {
  return new Promise((resolve, reject) => {
    const req = mediaStore('readwrite').put(blob, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
function getMedia(key) {
  return new Promise((resolve, reject) => {
    const req = mediaStore().get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
function deleteMedia(key) {
  return new Promise((resolve, reject) => {
    const req = mediaStore('readwrite').delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function resolveMediaUrl(media) {
  const blob = await getMedia(media.id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  state.tempUrls.add(url);
  return url;
}
function revokeTempUrls() {
  for (const url of state.tempUrls) URL.revokeObjectURL(url);
  state.tempUrls.clear();
}
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (n) => (n * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function bearingBetween(lat1, lon1, lat2, lon2) {
  const toRad = (n) => (n * Math.PI) / 180;
  const toDeg = (n) => (n * 180) / Math.PI;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const lambda1 = toRad(lon1);
  const lambda2 = toRad(lon2);
  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
  return normalizeDegrees(toDeg(Math.atan2(y, x)));
}
function signedAngleDifference(target, source) {
  let diff = normalizeDegrees(target) - normalizeDegrees(source);
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}
function offsetPosition(lat, lng, distanceMeters, bearingDegrees) {
  const R = 6378137;
  const brng = bearingDegrees * Math.PI / 180;
  const lat1 = lat * Math.PI / 180;
  const lon1 = lng * Math.PI / 180;
  const ang = distanceMeters / R;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(ang) + Math.cos(lat1) * Math.sin(ang) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(ang) * Math.cos(lat1), Math.cos(ang) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: lat2 * 180 / Math.PI, lng: lon2 * 180 / Math.PI };
}

async function init() {
  state.db = await openDb();
  loadPoints();
  bindEvents();
  updateStatus();
  renderPointList();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=3.0').catch(() => {});
  }
}

function bindEvents() {
  els.menuToggle.addEventListener('click', () => toggle(els.menuDrawer));
  els.closeMenu.addEventListener('click', () => hide(els.menuDrawer));
  els.panelToggle.addEventListener('click', () => toggle(els.panel));
  els.closePanel.addEventListener('click', () => hide(els.panel));
  els.activateBtn.addEventListener('click', activateApp);
  els.activationStartBtn.addEventListener('click', activateApp);
  els.showLocationsBtn.addEventListener('click', () => {
    hide(els.menuDrawer);
    show(els.panel);
    document.querySelector('.list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  els.refreshGpsBtn.addEventListener('click', refreshCurrentPosition);
  els.mediaInput.addEventListener('change', handleDraftMedia);
  els.savePointBtn.addEventListener('click', savePoint);
  els.pointList.addEventListener('click', handlePointListClick);
  els.exportBtn.addEventListener('click', exportJson);
  els.importInput.addEventListener('change', importJson);
  els.clearBtn.addEventListener('click', () => confirm('Limpar cadastros', 'Deseja remover todos os pontos cadastrados?', clearAllPoints));
  els.currentPlaceInfoBtn.addEventListener('click', () => {
    const point = state.points.find((p) => p.id === state.nearestPointId);
    if (point) openDetails(point);
  });
  els.closeDetails.addEventListener('click', () => hide(els.detailsModal));
  els.closeViewer.addEventListener('click', () => hide(els.viewerModal));
  els.closeAiStudio.addEventListener('click', () => hide(els.aiStudioModal));
  els.aiUsePointPhotoBtn.addEventListener('click', usePointPhotoForAi);
  els.aiCaptureCameraBtn.addEventListener('click', captureCameraForAi);
  els.aiLotPhotoInput.addEventListener('change', handleAiLotPhotoInput);
  document.querySelectorAll('.ai-model-card').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.ai-model-card').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      state.aiStudio.model = button.dataset.aiModel || 'cleoni';
      buildAiPrompt();
    });
  });
  [els.aiFloors, els.aiTime, els.aiGarden, els.aiPool, els.aiWall, els.aiGarage, els.aiNotes].forEach((el) => {
    el.addEventListener('input', buildAiPrompt);
    el.addEventListener('change', buildAiPrompt);
  });
  els.aiBuildPromptBtn.addEventListener('click', () => {
    buildAiPrompt();
    els.aiPromptBox.classList.toggle('hidden');
  });
  els.aiCopyPromptBtn.addEventListener('click', copyAiPrompt);
  els.aiGenerateBtn.addEventListener('click', generateAiImage);
  els.aiSaveResultBtn.addEventListener('click', saveAiResultToPoint);
  els.aiShareResultBtn.addEventListener('click', shareAiResult);
  els.confirmCancel.addEventListener('click', () => hide(els.confirmModal));
  els.confirmAccept.addEventListener('click', async () => {
    const fn = state.confirmAction;
    hide(els.confirmModal);
    state.confirmAction = null;
    if (fn) await fn();
  });
  document.querySelectorAll('[data-close="confirm"]').forEach((el) => el.addEventListener('click', () => hide(els.confirmModal)));
  document.querySelectorAll('[data-close="details"]').forEach((el) => el.addEventListener('click', () => hide(els.detailsModal)));
  document.querySelectorAll('[data-close="viewer"]').forEach((el) => el.addEventListener('click', () => hide(els.viewerModal)));
  document.querySelectorAll('[data-close="aiStudio"]').forEach((el) => el.addEventListener('click', () => hide(els.aiStudioModal)));
  els.detailsContent.addEventListener('click', handleDetailsClick);
  els.floatingPointsLayer?.addEventListener('click', handleFloatingPointClick);

  els.simMenuBtn.addEventListener('click', () => toggleSimMenu());
  els.closeSimulator.addEventListener('click', closeSimulator);
  els.simUseCameraBtn.addEventListener('click', useSimulatorCamera);
  els.simUsePhotoBtn.addEventListener('click', () => els.simPhotoInput.click());
  els.simPhotoInput.addEventListener('change', handleSimulatorPhotoPick);
  els.simGallery.addEventListener('click', handleSimulatorGalleryClick);
  els.modelCards.addEventListener('click', handleModelCardClick);
  els.simModelSelect.addEventListener('change', () => {
    state.simulator.model = els.simModelSelect.value;
    syncModelCards();
    renderSimulator();
  });
  [els.simLotWidth, els.simLotDepth, els.simSetback].forEach((input) => input.addEventListener('input', syncSimulatorInputs));
  els.simScaleBtn.addEventListener('click', () => { state.simulator.scale = clamp(state.simulator.scale + 0.08, 0.55, 1.65); renderSimulator(); });
  els.simRotateBtn.addEventListener('click', () => { state.simulator.rotation = normalizeDegrees(state.simulator.rotation + 8); renderSimulator(); });
  els.simFrontBtn.addEventListener('click', () => focusSimInput(els.simLotWidth, 'Ajuste a frente do lote.'));
  els.simDepthBtn.addEventListener('click', () => focusSimInput(els.simLotDepth, 'Ajuste a profundidade do lote.'));
  els.simSetbackBtn.addEventListener('click', () => focusSimInput(els.simSetback, 'Ajuste o recuo frontal.'));
  els.simCenterBtn.addEventListener('click', centerSimulator);
  els.simGpsBtn.addEventListener('click', useSimulatorGps);
  els.simSaveBtn.addEventListener('click', saveSimulation);
  els.simDetailsBtn.addEventListener('click', () => {
    const point = currentSimPoint();
    if (point) openDetails(point);
  });
  bindStageDrag();
}

function show(el) { el.classList.remove('hidden'); el.setAttribute('aria-hidden', 'false'); }
function hide(el) { el.classList.add('hidden'); el.setAttribute('aria-hidden', 'true'); }
function toggle(el) { el.classList.toggle('hidden'); el.setAttribute('aria-hidden', String(el.classList.contains('hidden'))); }
function toggleSimMenu(force) {
  const shouldShow = typeof force === 'boolean' ? force : els.simMenu.classList.contains('hidden');
  if (shouldShow) show(els.simMenu); else hide(els.simMenu);
  state.simulator.menuOpen = shouldShow;
}

async function activateApp() {
  try {
    await startOrientation();
    await startCamera();
    startLocation();
    state.activated = true;
    hide(els.activationCard);
    toast('Aplicativo ativado. Câmera, GPS e bússola em funcionamento.');
  } catch (error) {
    toast('Não foi possível ativar todos os recursos. Verifique permissões.');
    console.error(error);
  }
}
async function startCamera() {
  if (state.cameraStream) return;
  state.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
  els.cameraVideo.srcObject = state.cameraStream;
}
function startLocation() {
  if (!navigator.geolocation) throw new Error('Geolocation indisponível');
  if (state.watchId != null) return;
  state.watchId = navigator.geolocation.watchPosition(
    (position) => {
      state.currentCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
      state.accuracy = position.coords.accuracy;
      updateStatus();
      updateNearestPoint();
      renderFloatingPoints();
    },
    (error) => {
      console.error(error);
      updateStatus('erro');
    },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
  );
}
function refreshCurrentPosition() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((position) => {
    state.currentCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
    state.accuracy = position.coords.accuracy;
    updateStatus();
    updateNearestPoint();
    renderFloatingPoints();
    toast('Posição atualizada.');
  }, () => toast('Não foi possível atualizar o GPS.'), { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 });
}
async function startOrientation() {
  if (state.orientationListening) return true;

  const OrientationEvent = window.DeviceOrientationEvent;
  if (!OrientationEvent) {
    state.heading = null;
    updateStatus();
    return false;
  }

  try {
    if (typeof OrientationEvent.requestPermission === 'function') {
      const result = await OrientationEvent.requestPermission();
      if (result !== 'granted') {
        state.heading = null;
        updateStatus();
        return false;
      }
    }
  } catch (error) {
    console.warn('Falha ao solicitar permissão de orientação:', error);
    state.heading = null;
    updateStatus();
    return false;
  }

  const setHeading = (value) => {
    if (!Number.isFinite(value)) return;
    state.heading = normalizeDegrees(value);
    updateStatus();
    renderSimulatorCompass();
    renderFloatingPoints();
  };

  const listener = (event) => {
    let heading = null;
    if (typeof event.webkitCompassHeading === 'number') {
      heading = event.webkitCompassHeading;
    } else if (typeof event.alpha === 'number') {
      heading = 360 - event.alpha;
    }
    setHeading(heading);
  };

  window.addEventListener('deviceorientationabsolute', listener, true);
  window.addEventListener('deviceorientation', listener, true);
  state.orientationListening = true;
  updateStatus();
  return true;
}
function updateStatus(errorState) {
  els.gpsStatus.textContent = errorState === 'erro' ? 'erro' : state.currentCoords ? 'ativo' : 'aguardando';
  els.accuracyStatus.textContent = state.accuracy ? `±${Math.round(state.accuracy)} m` : '—';
  els.headingStatus.textContent = Number.isFinite(state.heading) ? `${Math.round(state.heading)}°` : state.orientationListening ? 'aguardando' : 'pendente';
  els.countStatus.textContent = String(state.points.length);
  els.headingValue.textContent = Number.isFinite(state.heading) ? `${Math.round(state.heading)}°` : '—';
  els.compassNeedle.style.transform = `rotate(${normalizeDegrees(Number.isFinite(state.heading) ? state.heading : 0)}deg)`;
}
function handleDraftMedia(event) {
  state.draftMediaFiles = Array.from(event.target.files || []);
  if (!state.draftMediaFiles.length) {
    els.mediaPreview.className = 'media-preview empty';
    els.mediaPreview.textContent = 'Nenhum arquivo selecionado.';
    return;
  }
  els.mediaPreview.className = 'media-preview';
  els.mediaPreview.innerHTML = state.draftMediaFiles.map((file) => `<div class="media-chip">${escapeHtml(file.name)}</div>`).join('');
}
function clearDraftForm() {
  els.pointName.value = '';
  els.pointDescription.value = '';
  els.markMode.value = 'current';
  els.mediaInput.value = '';
  state.draftMediaFiles = [];
  els.mediaPreview.className = 'media-preview empty';
  els.mediaPreview.textContent = 'Nenhum arquivo selecionado.';
}
async function savePoint() {
  const name = els.pointName.value.trim();
  const description = els.pointDescription.value.trim();
  if (!name) return toast('Informe o nome do local.');
  if (!state.currentCoords) return toast('Aguarde o GPS para cadastrar um ponto.');
  const duplicate = state.points.find((point) => DUPLICATE_NORMALIZER(point.name) === DUPLICATE_NORMALIZER(name));
  if (duplicate) return toast('Já existe um local com este nome.');
  const accuracy = Math.round(state.accuracy || 0);
  const markMode = els.markMode.value;
  const coords = markMode === 'direction'
    ? offsetPosition(state.currentCoords.lat, state.currentCoords.lng, 12, normalizeDegrees(state.heading))
    : { ...state.currentCoords };
  const point = {
    id: uid('point'),
    name,
    description,
    lat: coords.lat,
    lng: coords.lng,
    accuracy,
    createdAt: Date.now(),
    media: [],
    houseSimulation: null
  };
  for (const file of state.draftMediaFiles) {
    const mediaId = uid('media');
    await putMedia(mediaId, file);
    point.media.push({ id: mediaId, name: file.name, type: file.type.startsWith('video/') ? 'video' : 'image', mime: file.type });
  }
  state.points.unshift(point);
  savePoints();
  renderPointList();
  clearDraftForm();
  updateStatus();
  updateNearestPoint();
  renderFloatingPoints();
  toast('Cadastro realizado com sucesso.');
  hide(els.panel);
}
function renderPointList() {
  if (!state.points.length) {
    els.pointList.className = 'point-list empty';
    els.pointList.textContent = 'Nenhum ponto cadastrado ainda.';
    return;
  }
  els.pointList.className = 'point-list';
  els.pointList.innerHTML = state.points.map((point) => {
    const distance = state.currentCoords ? haversine(state.currentCoords.lat, state.currentCoords.lng, point.lat, point.lng) : null;
    return `
      <article class="point-item">
        <div>
          <h4>${escapeHtml(point.name)}</h4>
          <p>${escapeHtml(point.description || 'Sem descrição')} · ${formatDistance(distance)} · ${point.media.length} mídia(s)</p>
        </div>
        <div class="point-actions">
          <button class="mini-btn" data-action="details" data-id="${point.id}">Detalhes</button>
          <button class="mini-btn" data-action="simulate" data-id="${point.id}">Simular casa</button>
          <button class="mini-btn" data-action="delete" data-id="${point.id}">Excluir</button>
        </div>
      </article>
    `;
  }).join('');
}
function handlePointListClick(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const point = state.points.find((item) => item.id === btn.dataset.id);
  if (!point) return;
  if (btn.dataset.action === 'details') openDetails(point);
  if (btn.dataset.action === 'simulate') openAiStudio(point);
  if (btn.dataset.action === 'delete') confirm('Excluir local', `Deseja excluir "${point.name}"?`, () => deletePoint(point.id));
}
async function deletePoint(pointId) {
  const point = state.points.find((item) => item.id === pointId);
  if (!point) return;
  for (const media of point.media) await deleteMedia(media.id);
  state.points = state.points.filter((item) => item.id !== pointId);
  savePoints();
  renderPointList();
  updateStatus();
  updateNearestPoint();
  renderFloatingPoints();
  toast('Cadastro excluído.');
}
function confirm(title, message, onAccept) {
  els.confirmTitle.textContent = title;
  els.confirmMessage.textContent = message;
  state.confirmAction = onAccept;
  show(els.confirmModal);
}
async function clearAllPoints() {
  for (const point of state.points) {
    for (const media of point.media) await deleteMedia(media.id);
  }
  state.points = [];
  savePoints();
  renderPointList();
  updateStatus();
  updateNearestPoint();
  renderFloatingPoints();
  toast('Todos os cadastros foram removidos.');
}
function updateNearestPoint() {
  if (!state.currentCoords || !state.points.length) {
    state.nearestPointId = null;
    hide(els.currentPlaceCard);
    renderFloatingPoints();
    return;
  }
  let nearest = null;
  let min = Infinity;
  for (const point of state.points) {
    const d = haversine(state.currentCoords.lat, state.currentCoords.lng, point.lat, point.lng);
    if (d < min) { min = d; nearest = point; }
  }
  if (!nearest || min > 120) {
    state.nearestPointId = null;
    hide(els.currentPlaceCard);
    renderFloatingPoints();
    return;
  }
  state.nearestPointId = nearest.id;
  els.currentPlaceName.textContent = nearest.name;
  els.currentPlaceMeta.textContent = `${formatDistance(min)} do ponto · GPS ±${Math.round(state.accuracy || 0)} m`;
  show(els.currentPlaceCard);
  renderFloatingPoints();
}
function renderFloatingPoints() {
  if (!els.floatingPointsLayer) return;
  if (!state.currentCoords || !Number.isFinite(state.heading) || !state.points.length) {
    els.floatingPointsLayer.innerHTML = '';
    return;
  }

  const MAX_FLOATING_DISTANCE = 1800;
  const EDGE_LIMIT = 86;
  const items = state.points
    .filter((point) => point.id !== state.nearestPointId)
    .map((point) => {
      const distance = haversine(state.currentCoords.lat, state.currentCoords.lng, point.lat, point.lng);
      const bearing = bearingBetween(state.currentCoords.lat, state.currentCoords.lng, point.lat, point.lng);
      const rel = signedAngleDifference(bearing, state.heading);
      const isEdge = Math.abs(rel) > EDGE_LIMIT;
      return { point, distance, bearing, rel, isEdge };
    })
    .filter((item) => item.distance <= MAX_FLOATING_DISTANCE)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8);

  if (!items.length) {
    els.floatingPointsLayer.innerHTML = '';
    return;
  }

  let edgeLeftIndex = 0;
  let edgeRightIndex = 0;
  let centerIndex = 0;

  els.floatingPointsLayer.innerHTML = items.map((item) => {
    const distanceNorm = clamp(Math.log10(item.distance + 5) / Math.log10(MAX_FLOATING_DISTANCE + 5), 0, 1);
    const depthY = 54 - distanceNorm * 30;
    let x;
    let y;
    let align;
    let edgeClass = '';
    let arrow = '';

    if (item.isEdge) {
      const isLeft = item.rel < 0;
      const index = isLeft ? edgeLeftIndex++ : edgeRightIndex++;
      x = isLeft ? 5.2 : 94.8;
      y = clamp(27 + index * 8.5 + distanceNorm * 7, 22, 58);
      align = isLeft ? 'left edge-left' : 'right edge-right';
      edgeClass = ' is-edge';
      arrow = `<span class="floating-edge-arrow" aria-hidden="true">${isLeft ? '‹' : '›'}</span>`;
    } else {
      x = clamp(50 + (item.rel / EDGE_LIMIT) * 42, 8, 92);
      y = clamp(depthY + centerIndex * 2.8, 20, 56);
      centerIndex += 1;
      align = x < 24 ? 'left' : x > 76 ? 'right' : 'center';
    }

    return `
      <button class="floating-point ${align}${edgeClass}" type="button" data-point-id="${item.point.id}" style="left:${x}%; top:${y}%">
        <div class="floating-bubble">
          <div class="floating-title-row">
            ${arrow}
            <span class="floating-pin" aria-hidden="true">${pinSvg()}</span>
            <strong>${escapeHtml(item.point.name)}</strong>
          </div>
          <span class="floating-distance">${formatDistance(item.distance)} · ${Math.round(item.bearing)}°</span>
        </div>
        <span class="floating-stem" aria-hidden="true"></span>
      </button>
    `;
  }).join('');
}
function handleFloatingPointClick(event) {
  const btn = event.target.closest('[data-point-id]');
  if (!btn) return;
  const point = state.points.find((item) => item.id === btn.dataset.pointId);
  if (point) openDetails(point);
}
function pinSvg() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5c-3.59 0-6.5 2.91-6.5 6.5 0 4.8 6.5 12.5 6.5 12.5S18.5 13.8 18.5 9c0-3.59-2.91-6.5-6.5-6.5Zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor"/></svg>';
}
async function openDetails(point) {
  hide(els.panel);
  hide(els.menuDrawer);
  revokeTempUrls();
  els.detailsTitle.textContent = point.name;
  const distance = state.currentCoords ? haversine(state.currentCoords.lat, state.currentCoords.lng, point.lat, point.lng) : null;
  const mediaHtml = [];
  for (const media of point.media) {
    const url = await resolveMediaUrl(media);
    if (!url) continue;
    mediaHtml.push(`
      <button class="media-tile" type="button" data-media-id="${media.id}" data-media-type="${media.type}" data-point-id="${point.id}" data-media-name="${escapeAttr(media.name)}">
        ${media.type === 'video' ? `<video src="${url}" muted playsinline></video>` : `<img src="${url}" alt="${escapeAttr(media.name)}" />`}
        <span>${escapeHtml(media.name)}</span>
      </button>
    `);
  }
  els.detailsContent.innerHTML = `
    <div class="detail-block">
      <h4>Descrição</h4>
      <p>${escapeHtml(point.description || 'Sem descrição.')}</p>
    </div>
    <div class="data-grid">
      <div class="data-pill"><span>Distância atual</span><strong>${formatDistance(distance)}</strong></div>
      <div class="data-pill"><span>Criado em</span><strong>${formatDate(point.createdAt)}</strong></div>
      <div class="data-pill"><span>Coordenadas</span><strong>${formatLatLng(point.lat)}, ${formatLatLng(point.lng)}</strong></div>
      <div class="data-pill"><span>Mídias</span><strong>${point.media.length}</strong></div>
    </div>
    <div class="detail-block">
      <div class="action-row">
        <button class="cta-btn ghost" type="button" data-detail-action="route" data-point-id="${point.id}">Rota</button>
        <button class="cta-btn ghost" type="button" data-detail-action="simulate" data-point-id="${point.id}">Simular casa</button>
      </div>
      <div class="action-row">
        <button class="cta-btn ghost" type="button" data-detail-action="delete" data-point-id="${point.id}">Excluir</button>
      </div>
    </div>
    <div class="detail-block">
      <h4>Galeria</h4>
      ${mediaHtml.length ? `<div class="media-grid">${mediaHtml.join('')}</div>` : '<p>Sem mídias cadastradas.</p>'}
    </div>
  `;
  show(els.detailsModal);
  els.detailsContent.scrollTop = 0;
}
function handleDetailsClick(event) {
  const actionBtn = event.target.closest('[data-detail-action]');
  if (actionBtn) {
    const point = state.points.find((item) => item.id === actionBtn.dataset.pointId);
    if (!point) return;
    const action = actionBtn.dataset.detailAction;
    if (action === 'route') {
      const url = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${point.lat},${point.lng}&travelmode=driving`;
      window.open(url, '_blank');
    }
    if (action === 'simulate') openAiStudio(point);
    if (action === 'delete') confirm('Excluir local', `Deseja excluir "${point.name}"?`, async () => {
      hide(els.detailsModal);
      await deletePoint(point.id);
    });
    return;
  }
  const mediaTile = event.target.closest('[data-media-id]');
  if (!mediaTile) return;
  const point = state.points.find((item) => item.id === mediaTile.dataset.pointId);
  if (!point) return;
  const media = point.media.find((item) => item.id === mediaTile.dataset.mediaId);
  if (!media) return;
  openViewer(media);
}
async function openViewer(media) {
  revokeTempUrls();
  const url = await resolveMediaUrl(media);
  if (!url) return toast('Não foi possível abrir a mídia.');
  els.viewerTitle.textContent = media.name;
  els.viewerContent.innerHTML = media.type === 'video'
    ? `<video src="${url}" controls playsinline autoplay></video>`
    : `<img src="${url}" alt="${escapeAttr(media.name)}" />`;
  show(els.viewerModal);
}
async function exportJson() {
  const payload = [];
  for (const point of state.points) {
    const media = [];
    for (const item of point.media) {
      const blob = await getMedia(item.id);
      media.push({ ...item, dataUrl: blob ? await blobToDataUrl(blob) : null });
    }
    payload.push({ ...point, media });
  }
  const blob = new Blob([JSON.stringify({ exportedAt: Date.now(), points: payload }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `geovendas_casa_v2_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Exportação concluída.');
}
async function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const content = JSON.parse(await file.text());
    if (!Array.isArray(content.points)) throw new Error('Formato inválido.');
    await clearAllPoints();
    const imported = [];
    for (const point of content.points) {
      const restoredPoint = { ...point, media: [] };
      for (const media of point.media || []) {
        if (!media.dataUrl) continue;
        const blob = await (await fetch(media.dataUrl)).blob();
        await putMedia(media.id, blob);
        restoredPoint.media.push({ id: media.id, name: media.name, type: media.type, mime: media.mime });
      }
      imported.push(restoredPoint);
    }
    state.points = imported;
    savePoints();
    renderPointList();
    updateStatus();
    updateNearestPoint();
    renderFloatingPoints();
    toast('Importação concluída.');
  } catch (error) {
    console.error(error);
    toast('Falha ao importar o arquivo JSON.');
  } finally {
    event.target.value = '';
  }
}

function currentAiPoint() {
  return state.points.find((point) => point.id === state.aiStudio.pointId) || null;
}
async function openAiStudio(point) {
  hide(els.detailsModal);
  hide(els.panel);
  hide(els.menuDrawer);
  state.aiStudio.pointId = point.id;
  state.aiStudio.resultDataUrl = '';
  state.aiStudio.prompt = '';
  els.aiStudioTitle.textContent = `Simular casa no lote · ${point.name}`;
  els.aiResult.className = 'ai-result empty';
  els.aiResult.textContent = 'Escolha uma foto do lote e gere uma simulação visual para compartilhar.';
  els.aiPromptBox.classList.add('hidden');
  els.aiPromptBox.textContent = '';
  await usePointPhotoForAi({ silent: true });
  buildAiPrompt();
  show(els.aiStudioModal);
}
async function usePointPhotoForAi(options = {}) {
  const point = currentAiPoint();
  if (!point) return;
  const image = point.media.find((item) => item.type === 'image');
  if (!image) {
    if (!options.silent) toast('Este ponto ainda não tem foto. Escolha uma imagem do aparelho ou capture a câmera.');
    clearAiPreview();
    return;
  }
  const blob = await getMedia(image.id);
  if (!blob) {
    if (!options.silent) toast('Não foi possível carregar a foto cadastrada.');
    clearAiPreview();
    return;
  }
  const dataUrl = await blobToDataUrl(blob);
  setAiLotPhoto(dataUrl, image.name || 'Foto do lote');
}
function clearAiPreview() {
  state.aiStudio.lotPhotoDataUrl = '';
  els.aiLotPreview.className = 'ai-preview empty';
  els.aiLotPreview.textContent = 'Nenhuma foto do lote selecionada.';
}
function setAiLotPhoto(dataUrl, label = 'Foto do lote') {
  state.aiStudio.lotPhotoDataUrl = dataUrl;
  els.aiLotPreview.className = 'ai-preview';
  els.aiLotPreview.innerHTML = `<img src="${dataUrl}" alt="${escapeAttr(label)}" /><span>${escapeHtml(label)}</span>`;
  buildAiPrompt();
}
function captureCameraForAi() {
  if (!els.cameraVideo.videoWidth || !els.cameraVideo.videoHeight) {
    toast('A câmera ainda não está pronta.');
    return;
  }
  const canvas = document.createElement('canvas');
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / els.cameraVideo.videoWidth);
  canvas.width = Math.round(els.cameraVideo.videoWidth * scale);
  canvas.height = Math.round(els.cameraVideo.videoHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(els.cameraVideo, 0, 0, canvas.width, canvas.height);
  setAiLotPhoto(canvas.toDataURL('image/jpeg', 0.88), 'Foto capturada da câmera');
}
function handleAiLotPhotoInput(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setAiLotPhoto(reader.result, file.name);
  reader.onerror = () => toast('Não foi possível ler a foto escolhida.');
  reader.readAsDataURL(file);
  event.target.value = '';
}
function aiModelDescription(model) {
  const map = {
    cleoni: 'casa contemporânea de alto padrão inspirada na Casa Cleoni: dois pavimentos, volumetria moderna, fachada branca com volumes pretos, ripado/madeira natural, grandes panos de vidro, sacada com guarda-corpo de vidro, iluminação quente linear e garagem para dois carros',
    terrea: 'residência térrea moderna, elegante, fachada limpa, telhado embutido, garagem para dois carros, paisagismo frontal e iluminação acolhedora',
    premium: 'casa premium de alto padrão, arquitetura contemporânea, volumes sofisticados, vidros amplos, madeira, concreto claro, paisagismo refinado e iluminação cênica',
    resort: 'casa estilo resort urbano, arquitetura contemporânea com varanda, área de lazer, piscina discreta, paisagismo tropical e sensação de bem-estar'
  };
  return map[model] || map.cleoni;
}
function buildAiPrompt() {
  const point = currentAiPoint();
  if (!point) return '';
  const extras = [
    els.aiPool.checked ? 'incluir piscina discreta se houver espaço visual coerente' : 'não incluir piscina',
    els.aiWall.checked ? 'incluir muro discreto e elegante' : 'não fechar a fachada com muro alto',
    els.aiGarage.checked ? 'garagem para dois carros' : 'garagem simples integrada à fachada',
    `paisagismo ${els.aiGarden.value.toLowerCase()}`,
    `cena em ${els.aiTime.value.toLowerCase()}`,
    els.aiNotes.value.trim()
  ].filter(Boolean);
  const prompt = [
    `Use a foto do lote enviada como base principal e preserve a perspectiva, a rua, o horizonte, a iluminação e a escala geral da cena.`,
    `Implante no terreno uma ${aiModelDescription(state.aiStudio.model)}.`,
    `A casa deve parecer construída no próprio lote, com fundação, calçada, entrada, recuo frontal coerente, sombra e iluminação compatíveis com a foto original.`,
    `Evite aparência de colagem. Integre materiais, sombras, vegetação e profundidade de forma fotorrealista.`,
    `Dados do local: ${point.name}. ${point.description ? `Observação do lote: ${point.description}.` : ''}`,
    `Preferências: ${els.aiFloors.value}; ${extras.join('; ')}.`,
    `Imagem final vertical ou levemente vertical, alta qualidade, comercial, realista, pronta para apresentação ao cliente e compartilhamento com família.`,
    `Não adicione textos, logotipos, placas, marcas d'água ou pessoas.`
  ].join('\n');
  state.aiStudio.prompt = prompt;
  els.aiPromptBox.textContent = prompt;
  return prompt;
}
async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return await blobToDataUrl(blob);
}
async function generateAiImage() {
  const point = currentAiPoint();
  if (!point) return;
  const prompt = buildAiPrompt();
  if (!state.aiStudio.lotPhotoDataUrl) {
    toast('Escolha ou capture uma foto do lote antes de gerar.');
    return;
  }
  state.aiStudio.busy = true;
  els.aiGenerateBtn.disabled = true;
  els.aiGenerateBtn.textContent = 'Gerando...';
  els.aiResult.className = 'ai-result loading';
  els.aiResult.textContent = 'Gerando imagem. Isso pode levar até alguns minutos.';
  try {
    const houseReferenceDataUrl = state.aiStudio.model === 'cleoni'
      ? await imageUrlToDataUrl('./casa-cleoni-referencia.png')
      : '';
    const response = await fetch('/api/generate-house-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        lotImage: state.aiStudio.lotPhotoDataUrl,
        houseReference: houseReferenceDataUrl,
        pointName: point.name
      })
    });
    const data = await response.json();
    if (!response.ok || !data.image) {
      throw new Error(data.error || 'A API de geração ainda não está configurada.');
    }
    state.aiStudio.resultDataUrl = data.image;
    els.aiResult.className = 'ai-result';
    els.aiResult.innerHTML = `<img src="${data.image}" alt="Simulação gerada por IA" /><span>Imagem ilustrativa gerada por IA.</span>`;
    toast('Imagem gerada com sucesso.');
  } catch (error) {
    console.error(error);
    state.aiStudio.resultDataUrl = '';
    els.aiResult.className = 'ai-result empty';
    els.aiResult.innerHTML = `
      <strong>Geração automática indisponível.</strong>
      <p>${escapeHtml(error.message || 'Configure a API no Vercel para gerar imagens.')}</p>
      <p>O prompt profissional está pronto para copiar e usar em uma ferramenta de geração de imagem.</p>
    `;
    els.aiPromptBox.classList.remove('hidden');
    toast('API indisponível. Prompt pronto para copiar.');
  } finally {
    state.aiStudio.busy = false;
    els.aiGenerateBtn.disabled = false;
    els.aiGenerateBtn.textContent = 'Gerar imagem IA';
  }
}
async function copyAiPrompt() {
  const prompt = buildAiPrompt();
  try {
    await navigator.clipboard.writeText(prompt);
    toast('Prompt copiado.');
  } catch {
    toast('Não foi possível copiar automaticamente.');
  }
}
function dataUrlToBlob(dataUrl) {
  const [meta, data] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(meta)?.[1] || 'image/png';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
async function saveAiResultToPoint() {
  const point = currentAiPoint();
  if (!point) return;
  if (!state.aiStudio.resultDataUrl) {
    toast('Gere uma imagem antes de salvar no lote.');
    return;
  }
  const id = uid('media');
  const blob = dataUrlToBlob(state.aiStudio.resultDataUrl);
  await putMedia(id, blob);
  point.media.unshift({
    id,
    name: `Simulação IA - ${point.name}.png`,
    type: 'image',
    mime: blob.type,
    aiGenerated: true,
    createdAt: Date.now()
  });
  savePoints();
  renderPointList();
  toast('Simulação salva na galeria do lote.');
}
async function shareAiResult() {
  if (!state.aiStudio.resultDataUrl) {
    toast('Gere uma imagem antes de compartilhar.');
    return;
  }
  const point = currentAiPoint();
  const blob = dataUrlToBlob(state.aiStudio.resultDataUrl);
  const file = new File([blob], `simulacao-${(point?.name || 'lote').replace(/\s+/g, '-')}.png`, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: 'Simulação de casa no lote',
      text: `Simulação ilustrativa para ${point?.name || 'lote'}.`,
      files: [file]
    });
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}


function currentSimPoint() {
  return state.points.find((point) => point.id === state.simulator.pointId) || null;
}
async function openSimulator(point) {
  hide(els.detailsModal);
  hide(els.panel);
  hide(els.menuDrawer);
  state.simulator.active = true;
  state.simulator.pointId = point.id;
  state.simulator.menuOpen = false;
  show(els.simulatorScreen);
  hide(els.simMenu);
  revokeTempUrls();
  await prepareSimulator(point);
  renderSimulator();
  toast('Simulação aberta. Ajuste o lote e escolha o modelo desejado.');
}
function closeSimulator() {
  state.simulator.active = false;
  state.simulator.pointId = null;
  clearSimulatorCustomPhoto();
  useSimulatorCamera();
  hide(els.simulatorScreen);
  hide(els.simMenu);
  revokeTempUrls();
}
async function prepareSimulator(point) {
  const saved = point.houseSimulation || {};
  state.simulator.model = saved.model || 'conforto';
  state.simulator.x = Number.isFinite(saved.x) ? saved.x : 50;
  state.simulator.y = Number.isFinite(saved.y) ? saved.y : 44;
  state.simulator.scale = Number.isFinite(saved.scale) ? saved.scale : 1;
  state.simulator.rotation = Number.isFinite(saved.rotation) ? saved.rotation : 0;
  state.simulator.lotWidth = Number.isFinite(saved.lotWidth) ? saved.lotWidth : 12;
  state.simulator.lotDepth = Number.isFinite(saved.lotDepth) ? saved.lotDepth : 30;
  state.simulator.setback = Number.isFinite(saved.setback) ? saved.setback : 5;
  state.simulator.backgroundMediaId = saved.backgroundMediaId || null;
  els.simModelSelect.value = state.simulator.model;
  els.simLotWidth.value = state.simulator.lotWidth;
  els.simLotDepth.value = state.simulator.lotDepth;
  els.simSetback.value = state.simulator.setback;
  syncModelCards();
  await buildSimulatorGallery(point);
  if (state.simulator.backgroundMediaId) {
    const media = point.media.find((item) => item.id === state.simulator.backgroundMediaId && item.type === 'image');
    if (media) {
      const url = await resolveMediaUrl(media);
      if (url) applySimulatorBackground('gallery', url, media.id);
      else useSimulatorCamera();
    } else {
      useSimulatorCamera();
    }
  } else {
    useSimulatorCamera();
  }
  renderSimulatorCompass();
}
async function buildSimulatorGallery(point) {
  const images = point.media.filter((item) => item.type === 'image');
  if (!images.length) {
    hide(els.simGalleryWrap);
    els.simGallery.innerHTML = '';
    return;
  }
  const items = [];
  for (const image of images) {
    const url = await resolveMediaUrl(image);
    if (!url) continue;
    items.push(`<button class="sim-thumb" type="button" data-media-id="${image.id}"><img src="${url}" alt="${escapeAttr(image.name)}" /></button>`);
  }
  if (!items.length) {
    hide(els.simGalleryWrap);
    return;
  }
  els.simGallery.innerHTML = items.join('');
  show(els.simGalleryWrap);
}
function handleSimulatorGalleryClick(event) {
  const btn = event.target.closest('[data-media-id]');
  if (!btn) return;
  const point = currentSimPoint();
  if (!point) return;
  const media = point.media.find((item) => item.id === btn.dataset.mediaId);
  if (!media) return;
  resolveMediaUrl(media).then((url) => {
    if (!url) return;
    applySimulatorBackground('gallery', url, media.id);
  });
}
function clearSimulatorCustomPhoto() {
  if (state.simulator.customPhotoUrl) {
    URL.revokeObjectURL(state.simulator.customPhotoUrl);
    state.simulator.customPhotoUrl = '';
  }
}
function applySimulatorBackground(mode, url, mediaId = null) {
  state.simulator.backgroundMode = mode;
  state.simulator.backgroundMediaId = mediaId;
  state.simulator.backgroundUrl = url;
  els.simPhotoPreview.src = url;
  show(els.simPhotoLayer);
  els.simUseCameraBtn.classList.toggle('active-source', mode === 'camera');
  els.simUsePhotoBtn.classList.toggle('active-source', mode === 'device');
  els.simGallery.querySelectorAll('.sim-thumb').forEach((el) => el.classList.toggle('active', !!mediaId && el.dataset.mediaId === mediaId));
}
function useSimulatorCamera() {
  state.simulator.backgroundMode = 'camera';
  state.simulator.backgroundMediaId = null;
  state.simulator.backgroundUrl = '';
  hide(els.simPhotoLayer);
  els.simPhotoPreview.removeAttribute('src');
  els.simUseCameraBtn.classList.add('active-source');
  els.simUsePhotoBtn.classList.remove('active-source');
  els.simGallery.querySelectorAll('.sim-thumb').forEach((el) => el.classList.remove('active'));
}
function handleSimulatorPhotoPick(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  clearSimulatorCustomPhoto();
  const url = URL.createObjectURL(file);
  state.simulator.customPhotoUrl = url;
  applySimulatorBackground('device', url, null);
  event.target.value = '';
}
function syncModelCards() {
  els.modelCards.querySelectorAll('[data-model]').forEach((button) => {
    button.classList.toggle('active', button.dataset.model === state.simulator.model);
  });
}
function handleModelCardClick(event) {
  const btn = event.target.closest('[data-model]');
  if (!btn) return;
  state.simulator.model = btn.dataset.model;
  els.simModelSelect.value = state.simulator.model;
  syncModelCards();
  renderSimulator();
}
function syncSimulatorInputs() {
  state.simulator.lotWidth = clamp(Number(els.simLotWidth.value) || 12, 5, 60);
  state.simulator.lotDepth = clamp(Number(els.simLotDepth.value) || 30, 8, 100);
  state.simulator.setback = clamp(Number(els.simSetback.value) || 5, 0, 15);
  renderSimulator();
}
function focusSimInput(input, message) {
  show(els.simMenu);
  state.simulator.menuOpen = true;
  input.focus();
  input.select?.();
  toast(message);
}
function centerSimulator() {
  state.simulator.x = 50;
  state.simulator.y = 44;
  state.simulator.scale = 1;
  state.simulator.rotation = 0;
  renderSimulator();
}
function useSimulatorGps() {
  if (!Number.isFinite(state.heading)) {
    toast('Bússola ainda aguardando orientação do aparelho.');
    return;
  }
  state.simulator.rotation = normalizeDegrees(state.heading);
  renderSimulator();
}
function saveSimulation() {
  const point = currentSimPoint();
  if (!point) return;
  syncSimulatorInputs();
  point.houseSimulation = {
    model: state.simulator.model,
    x: state.simulator.x,
    y: state.simulator.y,
    scale: state.simulator.scale,
    rotation: state.simulator.rotation,
    lotWidth: state.simulator.lotWidth,
    lotDepth: state.simulator.lotDepth,
    setback: state.simulator.setback,
    backgroundMediaId: state.simulator.backgroundMode === 'gallery' ? state.simulator.backgroundMediaId : null
  };
  savePoints();
  toast('Simulação salva com sucesso.');
}
function bindStageDrag() {
  const down = (x, y) => {
    state.simulator.drag = { x, y, startX: state.simulator.x, startY: state.simulator.y };
  };
  const move = (x, y) => {
    if (!state.simulator.drag) return;
    const dx = x - state.simulator.drag.x;
    const dy = y - state.simulator.drag.y;
    state.simulator.x = clamp(state.simulator.drag.startX + dx / window.innerWidth * 100, 8, 92);
    state.simulator.y = clamp(state.simulator.drag.startY + dy / window.innerHeight * 100, 18, 82);
    renderSimulator();
  };
  const up = () => { state.simulator.drag = null; };
  els.simStage.addEventListener('pointerdown', (e) => { e.preventDefault(); down(e.clientX, e.clientY); els.simStage.setPointerCapture(e.pointerId); });
  els.simStage.addEventListener('pointermove', (e) => move(e.clientX, e.clientY));
  els.simStage.addEventListener('pointerup', up);
  els.simStage.addEventListener('pointercancel', up);
}
function renderSimulator() {
  const point = currentSimPoint();
  if (!point) return;
  const sim = state.simulator;
  const area = Math.round(sim.lotWidth * sim.lotDepth);
  const modelMeta = {
    essencial: 'Essencial • 80 m²',
    conforto: 'Conforto • 120 m²',
    resort: 'Resort • 180 m²',
    premium: 'Premium • 250 m²'
  };
  els.simStage.style.setProperty('--x', sim.x);
  els.simStage.style.setProperty('--y', sim.y);
  els.simStage.style.setProperty('--scale', sim.scale);
  els.simStage.style.setProperty('--rotation', `${sim.rotation}deg`);
  els.simStage.querySelector('.setback-front').style.setProperty('--setback', `${Math.max(6, (sim.setback / Math.max(1, sim.lotDepth)) * 100)}%`);
  els.simPointName.textContent = point.name;
  els.simPointMeta.textContent = `${area.toLocaleString('pt-BR')} m² • ${sim.lotWidth} × ${sim.lotDepth} m`;
  els.simModelLabel.textContent = ({essencial:'Essencial',conforto:'Conforto',resort:'Resort',premium:'Premium'}[sim.model] || 'Conforto');
  els.simGuideMeta.textContent = modelMeta[sim.model] || modelMeta.conforto;
  renderSimulatorCompass();
}
function renderSimulatorCompass() {
  const heading = Number.isFinite(state.heading) ? normalizeDegrees(state.heading) : 0;
  els.simHeading.textContent = Number.isFinite(state.heading) ? `${Math.round(heading)}°` : '—';
  els.simCompassNeedle.style.transform = `rotate(${heading}deg)`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function escapeAttr(value) { return escapeHtml(value); }

init().catch((error) => {
  console.error(error);
  toast('Falha ao iniciar o aplicativo.');
});
