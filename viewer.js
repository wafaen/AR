const params = new URLSearchParams(location.search);
const cfg = {
  target: params.get('target'),
  asset: params.get('asset'),
  type: params.get('type') || 'video',
  w: parseFloat(params.get('w') || '1'),
  h: parseFloat(params.get('h') || '0.65'),
  x: parseFloat(params.get('x') || '0'),
  y: parseFloat(params.get('y') || '0'),
  z: parseFloat(params.get('z') || '0'),
  transparent: params.get('transparent') !== '0',
  sound: params.get('sound') === '1'
};

const errorEl = document.getElementById('error');
const startPanel = document.getElementById('startPanel');
const startBtn = document.getElementById('startBtn');

function escAttr(value) {
  return String(value || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function buildScene() {
  if (!cfg.target || !cfg.asset) {
    errorEl.textContent = 'Missing target or asset URL. Go back to the builder and create a complete link.';
    return;
  }

  const scene = document.createElement('a-scene');
  scene.setAttribute('mindar-image', `imageTargetSrc: ${cfg.target}; autoStart: false; uiScanning: yes; uiLoading: yes;`);
  scene.setAttribute('color-space', 'sRGB');
  scene.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights');
  scene.setAttribute('vr-mode-ui', 'enabled: false');
  scene.setAttribute('device-orientation-permission-ui', 'enabled: true');
  scene.setAttribute('embedded', '');

  const transparentMaterial = cfg.transparent ? '; transparent: true; alphaTest: 0.01' : '';
  const position = `${cfg.x} ${cfg.y} ${cfg.z}`;

  let assets = '<a-assets timeout="30000">';
  let content = '';

  if (cfg.type === 'video') {
    assets += `<video id="arAsset" src="${escAttr(cfg.asset)}" crossorigin="anonymous" preload="auto" loop playsinline webkit-playsinline ${cfg.sound ? '' : 'muted'}></video>`;
    content = `<a-video id="arContent" src="#arAsset" width="${cfg.w}" height="${cfg.h}" position="${position}" rotation="0 0 0" material="shader: flat${transparentMaterial}"></a-video>`;
  } else if (cfg.type === 'model') {
    assets += `<a-asset-item id="arAsset" src="${escAttr(cfg.asset)}" crossorigin="anonymous"></a-asset-item>`;
    content = `<a-gltf-model id="arContent" src="#arAsset" position="${position}" scale="${cfg.w} ${cfg.w} ${cfg.w}" rotation="0 0 0"></a-gltf-model>`;
  } else {
    assets += `<img id="arAsset" src="${escAttr(cfg.asset)}" crossorigin="anonymous" />`;
    content = `<a-plane id="arContent" src="#arAsset" width="${cfg.w}" height="${cfg.h}" position="${position}" rotation="0 0 0" material="shader: flat${transparentMaterial}"></a-plane>`;
  }

  assets += '</a-assets>';
  scene.innerHTML = `${assets}<a-camera position="0 0 0" look-controls="enabled: false"></a-camera><a-entity id="target" mindar-image-target="targetIndex: 0">${content}</a-entity>`;
  document.body.appendChild(scene);

  const target = scene.querySelector('#target');
  const video = scene.querySelector('#arAsset');

  target.addEventListener('targetFound', async () => {
    if (cfg.type === 'video' && video) {
      try { await video.play(); } catch (e) { console.warn('Video play blocked:', e); }
    }
  });

  target.addEventListener('targetLost', () => {
    if (cfg.type === 'video' && video) video.pause();
  });

  return scene;
}

const scene = buildScene();

startBtn.addEventListener('click', async () => {
  if (!scene) return;
  startPanel.style.display = 'none';
  try {
    if (cfg.type === 'video') {
      const video = document.getElementById('arAsset');
      if (video && !cfg.sound) video.muted = true;
    }
    await scene.systems['mindar-image-system'].start();
  } catch (e) {
    startPanel.style.display = 'grid';
    errorEl.textContent = 'Could not start AR. Check HTTPS, camera permission, and whether your asset URLs allow CORS.';
    console.error(e);
  }
});
