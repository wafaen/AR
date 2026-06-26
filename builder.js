const $ = (id) => document.getElementById(id);

function makeViewerLink() {
  const target = $('targetUrl').value.trim();
  const video = $('videoUrl').value.trim();
  const targetW = Number($('targetW').value || 1080);
  const targetH = Number($('targetH').value || 1080);
  const scale = Number($('scale').value || 1);
  const muted = $('muted').checked ? '1' : '0';
  const pauseLost = $('pauseLost').checked ? '1' : '0';

  if (!target || !video) {
    alert('Paste both the .mind target URL and the MP4 video URL.');
    return;
  }

  const params = new URLSearchParams({ target, video, w: targetW, h: targetH, scale, muted, pauseLost });
  const link = `${location.origin}${location.pathname.replace(/index\.html$/, '')}viewer.html?${params.toString()}`;
  $('result').value = link;
  $('openLink').href = link;
}

$('makeLink').addEventListener('click', makeViewerLink);
$('copyLink').addEventListener('click', async () => {
  if (!$('result').value) makeViewerLink();
  try { await navigator.clipboard.writeText($('result').value); $('copyLink').textContent = 'Copied'; }
  catch { $('result').select(); document.execCommand('copy'); }
  setTimeout(() => $('copyLink').textContent = 'Copy link', 1200);
});
