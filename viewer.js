const params = new URLSearchParams(location.search);
const target = params.get('target');
const videoUrl = params.get('video');
const targetW = Number(params.get('w') || 1080);
const targetH = Number(params.get('h') || 1080);
const scale = Number(params.get('scale') || 1);
const muted = params.get('muted') !== '0';
const pauseLost = params.get('pauseLost') !== '0';

const startPanel = document.getElementById('startPanel');
const startBtn = document.getElementById('startBtn');
const errorEl = document.getElementById('error');
const scanHint = document.getElementById('scanHint');

function fail(message) {
  errorEl.textContent = message;
}

function buildScene() {
  if (!target || !videoUrl) {
    fail('Missing target or video URL. Generate a viewer link from the builder page first.');
    return;
  }

  const planeWidth = 1 * scale;
  const planeHeight = (targetH / targetW) * scale;
  const soundAttr = muted ? 'muted' : '';

  const scene = document.createElement('a-scene');
  scene.setAttribute('mindar-image', `imageTargetSrc: ${target}; autoStart: false; uiScanning: no; uiLoading: no; filterMinCF:0.0001; filterBeta: 0.01`);
  scene.setAttribute('embedded', '');
  scene.setAttribute('color-space', 'sRGB');
  scene.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights: true');
  scene.setAttribute('vr-mode-ui', 'enabled: false');
  scene.setAttribute('device-orientation-permission-ui', 'enabled: false');

  scene.innerHTML = `
    <a-assets>
      <video id="arVideo" src="${videoUrl}" crossorigin="anonymous" preload="auto" loop playsinline webkit-playsinline ${soundAttr}></video>
    </a-assets>
    <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
    <a-entity id="targetAnchor" mindar-image-target="targetIndex: 0">
      <a-video id="videoPlane" src="#arVideo" width="${planeWidth}" height="${planeHeight}" position="0 0 0.01" rotation="0 0 0"></a-video>
    </a-entity>
  `;
  document.body.appendChild(scene);

  const video = document.getElementById('arVideo');
  const anchor = document.getElementById('targetAnchor');

  anchor.addEventListener('targetFound', async () => {
    scanHint.classList.add('hidden');
    try { await video.play(); } catch (e) { console.warn(e); }
  });

  anchor.addEventListener('targetLost', () => {
    scanHint.classList.remove('hidden');
    if (pauseLost) video.pause();
  });

  return { scene, video };
}

let built = false;
startBtn.addEventListener('click', async () => {
  if (built) return;
  built = true;
  const made = buildScene();
  if (!made) { built = false; return; }

  const { scene, video } = made;
  startPanel.classList.add('hidden');
  scanHint.classList.remove('hidden');

  try {
    video.muted = muted;
    video.loop = true;
    video.playsInline = true;
    await video.play();
    video.pause();
  } catch (e) {
    // Mobile browsers may still block until targetFound; targetFound tries again.
  }

  scene.addEventListener('arReady', () => console.log('AR ready'));
  scene.addEventListener('arError', () => fail('Camera/AR failed. Check HTTPS, browser permissions, and target URL.'));

  await scene.systems['mindar-image-system'].start();
});
