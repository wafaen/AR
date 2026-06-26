const $ = (id) => document.getElementById(id);

function makeUrl() {
  const params = new URLSearchParams({
    target: $('targetUrl').value.trim(),
    asset: $('assetUrl').value.trim(),
    type: $('assetType').value,
    w: $('width').value || '1',
    h: $('height').value || '0.65',
    x: $('x').value || '0',
    y: $('y').value || '0',
    z: $('z').value || '0',
    transparent: $('transparent').checked ? '1' : '0',
    sound: $('sound').checked ? '1' : '0'
  });
  const base = new URL('viewer.html', location.href).href;
  return `${base}?${params.toString()}`;
}

$('makeLink').addEventListener('click', () => {
  if (!$('targetUrl').value.trim() || !$('assetUrl').value.trim()) {
    alert('Please add both the .mind target URL and the AR asset URL.');
    return;
  }
  const url = makeUrl();
  $('result').value = url;
  $('openLink').href = url;
});

$('copyLink').addEventListener('click', async () => {
  const url = $('result').value || makeUrl();
  await navigator.clipboard.writeText(url);
  $('copyLink').textContent = 'Copied';
  setTimeout(() => $('copyLink').textContent = 'Copy link', 1200);
});
