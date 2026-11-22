// Build a 47-second, silent social introduction from `demo.mjs --video --social`.
// Reuses the site's Instrument Sans, palette and three-slides-to-stack motion.
// No packages required: Chrome/CDP and ffmpeg, as with the original recorder.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { DIR, launch, page } from './driver.mjs';

const OUT = DIR + '../media/';
const WORK = DIR + 'social-build/';
mkdirSync(WORK, { recursive: true });
const take = JSON.parse(readFileSync(DIR + 'take.json'));
if (!take.social) throw new Error('First record: HEADLESS=1 node demo-recorder/demo.mjs --video --social');
const font = readFileSync(DIR + '../docs/vendor/instrument-sans/instrument-sans-latin-wght-normal.woff2').toString('base64');
for (const beat of ['link', 'getpdf', 'reorder', 'pdf', 'zip']) {
  if (!Number.isFinite(take.beats[beat])) throw new Error('Missing ' + beat + ': record a fresh social take.');
}
const chapters = [
  ['gather', 0, take.beats.link, 5, 'Gather every talk.', 'Drop PDF, PowerPoint and Keynote files into one list.'],
  ['google', take.beats.link, take.beats.reorder, 5, 'Google Slides, too.', 'Paste a shared link. Get a PDF for presenting and saving.'],
  ['order', take.beats.reorder, take.beats.pdf, 8, 'Set the running order.', 'Drag to reorder. Give every talk a clear title.'],
  ['present', take.beats.pdf, take.beats.zip, 15, 'Present from your browser.', 'Present PDF and PowerPoint. Follow PDF links to an appendix and back.'],
  ['save', take.beats.zip, take.duration, 8, 'Save the whole session.', 'Download a ZIP. Drop it back in to restore the running order.'],
];
function ff(args) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
}
const codec = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-r', '30', '-an'];
const { chrome, cdp } = await launch({ port: 9346 });
try {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const tab = page(cdp, sessionId);
  await tab.call('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await tab.eval(`document.body.innerHTML = '<canvas width="1920" height="1080"></canvas>'; document.body.style.margin='0';`);
  await tab.eval(`(async()=>{const f=new FontFace('Instrument', 'url(data:font/woff2;base64,${font})', {weight:'400 700'}); await f.load(); document.fonts.add(f)})()`);
  await tab.eval(`window.paint = ${paint.toString()}`);
  const snap = async (path, type = 'jpeg') => {
    const { data } = await tab.call('Page.captureScreenshot', { format: type, ...(type === 'jpeg' ? { quality: 96 } : {}), captureBeyondViewport: false });
    writeFileSync(path, Buffer.from(data, 'base64'));
  };
  for (const mode of ['intro', 'outro', 'brand']) {
    mkdirSync(WORK + mode, { recursive: true });
    const frameCount = mode === 'brand' ? 180 : 90;
    for (let f = 0; f < frameCount; f++) {
      await tab.eval(`paint(${JSON.stringify(mode)}, ${f / 30})`);
      await snap(WORK + mode + '/' + String(f).padStart(4, '0') + '.jpg');
      if (mode === 'intro' && f === 0) await snap(OUT + 'social-cover.png', 'png');
    }
    ff(['-framerate', '30', '-i', WORK + mode + '/%04d.jpg', '-frames:v', String(frameCount), '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', ...codec, '-movflags', '+faststart', WORK + mode + '.mp4']);
    console.log('rendered', mode);
  }
  for (const [i, [name, start, end, duration, title, subtitle]] of chapters.entries()) {
    await tab.eval(`paint('chapter', 0, ${JSON.stringify({ i, title, subtitle })})`);
    await snap(WORK + name + '.png', 'png');
    // Keep the recording's original aspect ratio and full frame. Captions sit
    // above it, not over the controls or the slide picker.
    const filter = `[1:v]trim=start=${start}:end=${end},setpts=(PTS-STARTPTS)*${duration / (end - start)},tpad=stop_mode=clone:stop_duration=1,fps=30,scale=1472:828:flags=lanczos,setsar=1[demo];[0:v][demo]overlay=224:216:shortest=1,trim=duration=${duration},setpts=PTS-STARTPTS,scale=out_range=tv,format=yuv420p[v]`;
    ff(['-loop', '1', '-framerate', '30', '-i', WORK + name + '.png', '-i', DIR + 'demo.mp4', '-filter_complex', filter, '-map', '[v]', '-t', String(duration), ...codec, WORK + name + '.mp4']);
    console.log('composited', name);
  }
} finally {
  await cdp.send('Browser.close').catch(() => {});
  cdp.close(); chrome.kill();
}
const parts = ['intro', ...chapters.map(c => c[0]), 'outro'];
writeFileSync(WORK + 'edit.txt', parts.map(n => `file '${n}.mp4'`).join('\n') + '\n');
ff(['-f', 'concat', '-safe', '0', '-i', WORK + 'edit.txt', '-c', 'copy', '-movflags', '+faststart', OUT + 'social-demo.mp4']);
ff(['-i', WORK + 'brand.mp4', '-c', 'copy', '-movflags', '+faststart', OUT + 'brand-animation.mp4']);
writeFileSync(WORK + 'storyboard.json', JSON.stringify({ duration: 47, chapters, source: take }, null, 2));
console.log('Wrote media/social-demo.mp4, media/brand-animation.mp4, media/social-cover.png');

// A deterministic canvas timeline: frame-accurate animation, independent of
// screenshot speed. Geometry follows the three masthead tiles and favicon stack.
function paint(mode, t, chapter) {
  const c = document.querySelector('canvas').getContext('2d');
  const W = 1920, H = 1080;
  const green = '#006644', mid = '#5fa47f', pale = '#a9d3b9', light = '#e3efe7', ink = '#103e30';
  c.clearRect(0, 0, W, H);
  const rect = (x,y,w,h,r,color) => { c.fillStyle=color; c.beginPath(); c.roundRect(x,y,w,h,r); c.fill(); };
  const text = (s,x,y,size=48,weight=500,color=ink,align='left') => { c.fillStyle=color; c.font=weight+' '+size+'px Instrument'; c.textAlign=align; c.fillText(s,x,y); };
  const ease = x => { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); };
  const lerp=(a,b,p)=>a+(b-a)*p;
  const blend=(a,b,p)=>{const rgb=h=>h.match(/\w\w/g).map(v=>parseInt(v,16));const A=rgb(a.slice(1)),B=rgb(b.slice(1));return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],p)).toString(16).padStart(2,'0')).join('');};
  const address = (x,y,size,color=ink,align='left') => {
    c.font='700 '+size+'px Instrument';
    const a=c.measureText('slide').width,b=c.measureText('org').width,d=c.measureText('.org').width;
    if(align==='center') x-=(a+b+d)/2;
    text('slide',x,y,size,700,color); text('org',x+a,y,size,700,color=== '#ffffff' ? pale : green);text('.org',x+a+b,y,size,700,mid);
  };
  if(mode==='chapter') {
    rect(0,0,W,H,0,'#f1f5f0');
    rect(224,42,66,66,18,green); text(String(chapter.i+1),257,89,36,600,'#ffffff','center');
    text(chapter.title,314,96,56,600); text(chapter.subtitle,224,160,32,400);
    address(1475,84,28);
    rect(217,209,1486,842,9,'#b7cfc0');
    return;
  }
  const dark=mode==='outro';
  rect(0,0,W,H,0,dark ? green : '#f1f5f0');
  // Gentle oversized slide silhouettes carry the brand without competing with it.
  c.globalAlpha=dark ? .10 : .35;
  rect(1550,-125,650,365,40,mid);rect(-370,890,650,365,40,pale);c.globalAlpha=1;
  const headline=dark ? '#ffffff' : ink;
  if (!dark) text('SLIDE ORGANIZER',960,118,32,600,green,'center');
  let stack;
  if(mode==='intro') stack=ease((t-.45)/.65);
  else if(mode==='outro') stack=1;
  else stack=ease((t-1)/1.1)*(1-ease((t-3.6)/1.1));
  // Three numbered 16:9 tiles collapse into the site's 32-unit icon geometry.
  const iconX=832, iconY=242, unit=8;
  c.globalAlpha=stack;
  rect(iconX,iconY,256,256,56,green);c.globalAlpha=1;
  const tiles=[
    {word:'slide',x:405,tx:8.5,ty:9.25,from:light,to:pale,z:2},
    {word:'.org',x:1165,tx:11,ty:5.5,from:dark?mid:green,to:mid,z:1},
    {word:'org',x:785,tx:6,ty:13,from:pale,to:'#ffffff',z:3},
  ].sort((a,b)=>a.z-b.z);
  for(const tile of tiles) {
    const x=lerp(tile.x,iconX+tile.tx*unit,stack), y=lerp(235,iconY+tile.ty*unit,stack);
    const w=lerp(350,128,stack), h=lerp(196.875,92,stack);
    // Brief stagger at the start, followed by the exact stack transformation.
    const reveal=1; // Frame zero is the complete social cover, with no fade-in.
    c.globalAlpha=reveal;
    rect(x,y+(1-reveal)*40,w,h,lerp(24.5,16,stack),blend(tile.from,tile.to,stack));
    const fg=tile.word==='org'?green:tile.word==='.org'?'#ffffff':ink;
    const labelAlpha=tile.word==='org'?1:1-stack;
    c.globalAlpha=reveal*labelAlpha;
    text(tile.word,x+w/2,y+h/2+lerp(28,20,stack),lerp(94,60.8,stack),700,fg,'center');
    c.globalAlpha=reveal*(1-stack);
    text(tile.word==='slide'?'1':tile.word==='org'?'2':'3',x+25,y+38,32,500,fg);
    c.globalAlpha=1;
  }
  if(mode==='intro') {
    text('Every talk. One place.',960,638,100,600,headline,'center');
    text('Run your conference session from one browser.',960,738,43,400,headline,'center');
    address(960,914,76,ink,'center');
  } else if(mode==='outro') {
    address(960,686,146,'#ffffff','center');
    text('Free · Open source · Private',960,812,42,500,light,'center');
  } else {
    address(960,690,112,ink,'center');
    text('Every talk, in order, on the room computer.',960,812,43,500,ink,'center');
    text('Free · Open source · Private',960,919,32,500,green,'center');
  }
}
