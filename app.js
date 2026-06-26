(() => {
  const scene = document.getElementById('scene');
  const video = document.getElementById('arVideo');
  const plane = document.getElementById('videoPlane');
  const target = document.getElementById('target');
  const startPanel = document.getElementById('startPanel');
  const startButton = document.getElementById('startButton');
  const status = document.getElementById('status');
  const hint = document.getElementById('hint');

  const cfg = window.AR_CONFIG || {};
  const tw = Number(cfg.targetWidth) || 1;
  const th = Number(cfg.targetHeight) || 1;
  plane.setAttribute('width', '1');
  plane.setAttribute('height', String(th / tw));

  video.muted = true;              // Required for reliable mobile autoplay.
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  async function primeVideo() {
    try {
      await video.play();
      video.pause();
      status.textContent = 'Video ready. Starting camera…';
      return true;
    } catch (err) {
      status.textContent = 'Tap again if the browser blocks video playback.';
      console.warn('Video prime failed:', err);
      return false;
    }
  }

  async function startAR() {
    startButton.disabled = true;
    status.textContent = 'Preparing video…';
    await primeVideo();

    try {
      const arSystem = scene.systems['mindar-image-system'];
      if (!arSystem) throw new Error('MindAR system did not load. Check internet/CDN connection.');
      status.textContent = 'Requesting camera permission…';
      await arSystem.start();
      startPanel.classList.add('hidden');
      hint.classList.remove('hidden');
      status.textContent = 'Camera started.';
      try { await video.play(); } catch (_) {}
    } catch (err) {
      console.error(err);
      status.textContent = 'Camera failed: ' + (err.message || err);
      startButton.disabled = false;
    }
  }

  startButton.addEventListener('click', startAR);

  target.addEventListener('targetFound', async () => {
    hint.textContent = 'Target found';
    if (cfg.restartFromBeginningOnFound) video.currentTime = 0;
    video.loop = true;
    video.muted = true;
    try { await video.play(); } catch (err) { console.warn('Play on target found failed:', err); }
  });

  target.addEventListener('targetLost', () => {
    hint.textContent = 'Scan the printed image';
    if (cfg.pauseWhenTargetLost) video.pause();
  });

  window.addEventListener('pagehide', () => video.pause());
})();
