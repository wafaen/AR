const $ = (id) => document.getElementById(id);
const DB_NAME = 'ar-video-builder-db';
const STORE = 'projects';
let db;
let activeId = null;
let projects = [];

function uid(){ return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8); }
function safeName(name){ return (name || 'ar-project').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50) || 'ar-project'; }
function readAsDataURL(file){ return new Promise((res, rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
function dataURLToBlob(dataURL){ const [head, body] = dataURL.split(','); const mime = (head.match(/data:(.*?);/)||[])[1] || 'application/octet-stream'; const bin=atob(body); const arr=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return new Blob([arr],{type:mime}); }
async function blobToArrayBuffer(blob){ return await blob.arrayBuffer(); }

function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, {keyPath:'id'});
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function tx(mode='readonly'){ return db.transaction(STORE, mode).objectStore(STORE); }
function getAll(){ return new Promise((resolve,reject)=>{ const req=tx().getAll(); req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error); }); }
function putProject(p){ return new Promise((resolve,reject)=>{ p.updatedAt=new Date().toISOString(); const req=tx('readwrite').put(p); req.onsuccess=()=>resolve(); req.onerror=()=>reject(req.error); }); }
function deleteProject(id){ return new Promise((resolve,reject)=>{ const req=tx('readwrite').delete(id); req.onsuccess=()=>resolve(); req.onerror=()=>reject(req.error); }); }
function current(){ return projects.find(p=>p.id===activeId); }

async function refresh(){
  projects = (await getAll()).sort((a,b)=> new Date(b.updatedAt)-new Date(a.updatedAt));
  renderProjects();
  if(!activeId && projects[0]) selectProject(projects[0].id);
}

function renderProjects(){
  const list=$('projectList'); list.innerHTML='';
  if(projects.length===0){ list.innerHTML='<p class="note">No projects yet. Create one now.</p>'; return; }
  const tpl=$('projectItemTpl');
  projects.forEach(p=>{
    const node=tpl.content.cloneNode(true);
    const btn=node.querySelector('.project-item');
    btn.classList.toggle('active', p.id===activeId);
    node.querySelector('.project-title').textContent=p.name;
    const flags=[p.imageData?'image':'no image', p.videoData?'video':'no video', p.mindData?'compiled':'not compiled'];
    node.querySelector('.project-meta').textContent=flags.join(' • ');
    btn.onclick=()=>selectProject(p.id);
    list.appendChild(node);
  });
}

function selectProject(id){
  activeId=id; renderProjects(); $('editor').classList.remove('hidden');
  const p=current(); if(!p) return;
  $('projectName').value=p.name || '';
  $('autoPlay').checked=p.autoPlay!==false; $('loopVideo').checked=p.loopVideo!==false;
  $('posX').value=p.fit?.x ?? 0; $('posY').value=p.fit?.y ?? 0; $('width').value=p.fit?.w ?? 1; $('height').value=p.fit?.h ?? 1;
  if(p.imageData){ $('targetPreview').src=p.imageData; $('targetPreview').classList.remove('hidden'); } else $('targetPreview').classList.add('hidden');
  if(p.videoData){ $('videoPreview').src=p.videoData; $('videoPreview').classList.remove('hidden'); } else $('videoPreview').classList.add('hidden');
  $('compileStatus').textContent=p.mindData?'Compiled target ready.':'Not compiled yet.';
}

async function saveFields(){
  const p=current(); if(!p) return;
  p.name=$('projectName').value.trim() || 'Untitled AR Project';
  p.autoPlay=$('autoPlay').checked; p.loopVideo=$('loopVideo').checked;
  p.fit={x:+$('posX').value,y:+$('posY').value,w:+$('width').value,h:+$('height').value};
  await putProject(p); await refresh(); selectProject(p.id);
}

async function compileTarget(){
  const p=current(); if(!p?.imageData) { alert('Add a target image first.'); return; }
  $('compileStatus').textContent='Loading compiler...';
  try{
    const mod = await import('https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js');
    const Compiler = mod.Compiler || mod.default?.Compiler || window.MINDAR?.IMAGE?.Compiler;
    if(!Compiler) throw new Error('Compiler not found from CDN');
    const img = new Image(); img.crossOrigin='anonymous';
    await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=p.imageData; });
    $('compileStatus').textContent='Compiling target. Keep this tab open.';
    const compiler = new Compiler();
    const dataList = await compiler.compileImageTargets([img], (progress)=>{ $('compileStatus').textContent = `Compiling target ${Math.round(progress*100)}%`; });
    const exported = await compiler.exportData();
    const blob = new Blob([exported], {type:'application/octet-stream'});
    p.mindData = await readAsDataURL(blob);
    await putProject(p); await refresh(); selectProject(p.id);
    $('compileStatus').textContent='Compiled target ready.';
  }catch(err){
    console.error(err);
    $('compileStatus').textContent='Compiler failed. Try a sharper JPG/PNG under 25 MB, served with internet connection.';
    alert('Target compile failed: ' + err.message);
  }
}

function viewerHTML(){ return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>AR Video</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000;font-family:Arial,sans-serif}.hint{position:fixed;z-index:5;left:12px;right:12px;bottom:12px;padding:12px 14px;background:rgba(0,0,0,.65);color:#fff;border-radius:14px;text-align:center}.start{position:fixed;inset:0;z-index:10;display:grid;place-items:center;background:#050505;color:#fff}.start button{font-size:20px;padding:16px 22px;border:0;border-radius:16px;font-weight:800}.hidden{display:none}</style><script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script><script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script></head><body><div id="start" class="start"><button>Start AR</button></div><div class="hint">Allow camera, then point at the image.</div><a-scene mindar-image="imageTargetSrc: ./assets/target.mind; autoStart: false; uiScanning: yes; uiLoading: yes; filterMinCF:0.0001; filterBeta: 0.001" color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"><a-assets><video id="arvideo" src="./assets/video.mp4" preload="auto" crossorigin="anonymous" webkit-playsinline playsinline muted></video></a-assets><a-camera position="0 0 0" look-controls="enabled: false"></a-camera><a-entity mindar-image-target="targetIndex: 0"><a-video id="plane" src="#arvideo" position="0 0 0" rotation="0 0 0" width="1" height="1"></a-video></a-entity></a-scene><script src="./project.js"></script></body></html>`; }

function projectJS(p){ const fit=p.fit||{x:0,y:0,w:1,h:1}; return `const CONFIG=${JSON.stringify({fit,autoPlay:p.autoPlay!==false,loopVideo:p.loopVideo!==false})};
const scene=document.querySelector('a-scene');const start=document.getElementById('start');const video=document.getElementById('arvideo');const plane=document.getElementById('plane');
video.muted=true;video.loop=CONFIG.loopVideo;video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
plane.setAttribute('position', CONFIG.fit.x+' '+CONFIG.fit.y+' 0');plane.setAttribute('width', CONFIG.fit.w);plane.setAttribute('height', CONFIG.fit.h);
async function playVideo(){try{video.currentTime=0;await video.play();}catch(e){console.log('Autoplay blocked until tap',e);}}
start.addEventListener('click', async()=>{start.classList.add('hidden'); await scene.systems['mindar-image-system'].start(); if(CONFIG.autoPlay) playVideo();});
scene.addEventListener('targetFound',()=>{ if(CONFIG.autoPlay) playVideo(); });
scene.addEventListener('targetLost',()=>{ video.pause(); });
document.body.addEventListener('click',()=>{ if(video.paused) playVideo(); });`; }

async function exportOne(p){
  if(!p.imageData || !p.videoData || !p.mindData) throw new Error(`${p.name}: needs image, video, and compiled target`);
  const zip = new JSZip();
  zip.file('index.html', viewerHTML());
  zip.file('project.js', projectJS(p));
  const assets=zip.folder('assets');
  assets.file('target.mind', await blobToArrayBuffer(dataURLToBlob(p.mindData)));
  assets.file('video.mp4', await blobToArrayBuffer(dataURLToBlob(p.videoData)));
  assets.file('target-preview.png', await blobToArrayBuffer(dataURLToBlob(p.imageData)));
  zip.file('README.txt', `Upload this whole folder to an HTTPS host. Open index.html URL on phone. The video is muted, autoplayed, and looped by default. If iPhone blocks autoplay, tap Start AR once. Project: ${p.name}`);
  const blob = await zip.generateAsync({type:'blob'});
  downloadBlob(blob, safeName(p.name)+'.zip');
}
function downloadBlob(blob, filename){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
async function exportAll(){
  const ready=projects.filter(p=>p.imageData&&p.videoData&&p.mindData);
  if(!ready.length) throw new Error('No complete compiled projects to export.');
  const zip=new JSZip();
  for(const p of ready){
    const folder=zip.folder(safeName(p.name));
    folder.file('index.html', viewerHTML()); folder.file('project.js', projectJS(p));
    const assets=folder.folder('assets');
    assets.file('target.mind', await blobToArrayBuffer(dataURLToBlob(p.mindData)));
    assets.file('video.mp4', await blobToArrayBuffer(dataURLToBlob(p.videoData)));
  }
  downloadBlob(await zip.generateAsync({type:'blob'}), 'all-ar-projects.zip');
}

$('newProjectBtn').onclick=async()=>{ const p={id:uid(),name:`AR Project ${projects.length+1}`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),autoPlay:true,loopVideo:true,fit:{x:0,y:0,w:1,h:1}}; await putProject(p); activeId=p.id; await refresh(); selectProject(p.id); };
$('saveBtn').onclick=saveFields;
$('deleteBtn').onclick=async()=>{ if(!activeId || !confirm('Delete this project?')) return; await deleteProject(activeId); activeId=null; $('editor').classList.add('hidden'); await refresh(); };
$('imageInput').onchange=async(e)=>{ const f=e.target.files[0]; if(!f) return; if(f.size>25*1024*1024){ alert('Image is over 25 MB. Compress it first for phone performance.'); return; } const p=current(); p.imageData=await readAsDataURL(f); p.mindData=null; await putProject(p); await refresh(); selectProject(p.id); };
$('videoInput').onchange=async(e)=>{ const f=e.target.files[0]; if(!f) return; const p=current(); p.videoData=await readAsDataURL(f); await putProject(p); await refresh(); selectProject(p.id); };
$('compileBtn').onclick=compileTarget;
$('resetFitBtn').onclick=()=>{ $('posX').value=0; $('posY').value=0; $('width').value=1; $('height').value=1; saveFields(); };
['projectName','autoPlay','loopVideo','posX','posY','width','height'].forEach(id=>$(id).addEventListener('change', saveFields));
$('exportBtn').onclick=async()=>{ try{ await saveFields(); await exportOne(current()); }catch(e){ alert(e.message); } };
$('exportAllBtn').onclick=async()=>{ try{ await exportAll(); }catch(e){ alert(e.message); } };

db = await openDB(); await refresh();
