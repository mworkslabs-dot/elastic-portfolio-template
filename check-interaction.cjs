// Run: node check-prototype.cjs. Geometry and interaction checks; device feel still needs review.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {SoftLetterWorld,traceLetterContours,toSVGPath}=require('./soft-letters');
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
assert.ok(html.includes(fs.readFileSync(`${__dirname}/soft-letters.js`,'utf8')),'preview embeds the reusable engine exactly');
const L=[[{u:0,v:0},{u:.32,v:0},{u:.32,v:.75},{u:1,v:.75},{u:1,v:1},{u:0,v:1}]];
const ellipse=(rx,ry)=>Array.from({length:36},(_,i)=>({u:.5+Math.cos(i*Math.PI/18)*rx,v:.5+Math.sin(i*Math.PI/18)*ry}));
const O=[ellipse(.49,.49),ellipse(.24,.34)];
function finite(w){for(const b of w.bodies)for(const n of b.nodes){assert.ok([n.x,n.y,n.vx,n.vy].every(Number.isFinite));assert.ok(n.x>=2&&n.x<=w.width-2&&n.y>=2&&n.y<=w.height-2,'contours stay inside the viewport');assert.ok(Math.abs(n.vx)<=10&&Math.abs(n.vy)<=10,'input cannot accumulate unbounded velocity')}}
function error(b){return Math.sqrt(b.nodes.reduce((sum,n)=>{const x=n.rx-b.restX,y=n.ry-b.restY;return sum+(n.x-(b.cx+Math.cos(b.angle)*x-Math.sin(b.angle)*y))**2+(n.y-(b.cy+Math.sin(b.angle)*x+Math.cos(b.angle)*y))**2},0)/b.nodes.length)}
const mask=new Uint8ClampedArray(12*12*4);for(let y=1;y<11;y++)for(let x=1;x<11;x++)if(x<4||x>7||y<4||y>7)mask[(y*12+x)*4+3]=255;
const traced=traceLetterContours(mask,12,12,1);assert.equal(traced.length,2,'trace preserves counters');assert.equal(Math.min(...traced.flat().map(p=>p.u)),0);assert.equal(Math.max(...traced.flat().map(p=>p.u)),1,'ink bounds, rather than padded raster bounds, determine initial spacing');
const still=new SoftLetterWorld(700,500),stillLetter=still.add({index:0,x:300,y:230,w:150,h:300,contours:L}),initial=stillLetter.nodes.map(n=>({x:n.x,y:n.y}));
assert.equal(still.isActive(),false,'the name has no autonomous idle motion');for(let i=0;i<200;i++)still.step(.5);assert.ok(stillLetter.nodes.every((n,i)=>Math.hypot(n.x-initial[i].x,n.y-initial[i].y)<.001),'no breathing, bobbing or self-started drift');still.nudge(stillLetter);assert.equal(still.isActive(),true,'interaction wakes the letter');still.reset();assert.equal(still.isActive(),false,'reset rests immediately');
const ambient=new SoftLetterWorld(900,700),ambientLetter=ambient.add({index:2,x:450,y:350,w:200,h:360,contours:L}),rest=ambientLetter.nodes.map(n=>({x:n.x,y:n.y}));
ambient.setAmbient(.85);assert.equal(ambient.isActive(),true,'ambient opening starts without a pointer event');
assert.ok(Math.max(...ambientLetter.nodes.map((n,i)=>Math.hypot(n.x-rest[i].x,n.y-rest[i].y)))>8,'opening contains visible elastic displacement');
let ongoingMin=Infinity,ongoingMax=0;
for(let i=0;i<900;i++){ambient.step(.5);finite(ambient);if(i>200){const value=error(ambientLetter);ongoingMin=Math.min(ongoingMin,value);ongoingMax=Math.max(ongoingMax,value)}}
assert.ok(ongoingMax-ongoingMin>2,'idle changes the contour shape instead of only translating a rigid glyph');
assert.ok(Math.hypot(ambientLetter.x-450,ambientLetter.y-350)<25,'idle does not accumulate wandering translation');
ambient.grab(ambientLetter,ambientLetter.nodes[0].x,ambientLetter.nodes[0].y);ambient.step(.5);assert.equal(ambientLetter.ambientGoals,null,'grabbing yields idle deformation to direct input');ambient.release();ambient.setAmbient(0);ambient.reset();assert.equal(ambient.isActive(),false,'ambient motion can be fully disabled');
const pick=new SoftLetterWorld(600,500),ring=pick.add({index:0,x:300,y:250,w:180,h:280,contours:O});
assert.equal(pick.pick(300,250),null,'the empty counter is not a rectangular collision box');assert.equal(pick.pick(370,250),ring,'ink is hittable');
const bend=new SoftLetterWorld(700,500),letter=bend.add({index:0,x:380,y:230,w:170,h:320,contours:L});
bend.grab(letter,455,370);bend.move(170,310);let peak=0;
for(let i=0;i<100;i++){bend.step(.5);peak=Math.max(peak,error(letter));finite(bend)}
assert.ok(peak>12,'an end pull bends the contour beyond any rigid transform');assert.ok(Math.abs(letter.angle)>.3,'letters can rotate freely');
bend.release();for(let i=0;i<600;i++)bend.step(.5);finite(bend);
assert.ok(error(letter)<3,'the letter shape recovers');assert.ok(Math.hypot(letter.x-letter.homeX,letter.y-letter.homeY)>80,'shape recovery does not snap the letter into its original slot');
bend.reset();assert.ok(Math.abs(letter.x-380)<.001&&Math.abs(letter.y-230)<.001&&Math.abs(letter.angle)<.001,'Reset Name restores the composition');
const touch=new SoftLetterWorld(700,500),a=touch.add({index:0,x:180,y:250,w:150,h:250,contours:L}),b=touch.add({index:1,x:370,y:250,w:150,h:250,contours:O});
touch.grab(a,230,330);touch.move(430,250);let neighborBend=0;
for(let i=0;i<220;i++){touch.step(.5);neighborBend=Math.max(neighborBend,error(b));finite(touch)}
assert.ok(neighborBend>3,'pressure deforms a neighboring contour');assert.ok(Math.hypot(b.x-370,b.y-250)>20,'a neighbor receives the push');
const wall=new SoftLetterWorld(600,500),wallLetter=wall.add({index:0,x:160,y:250,w:160,h:300,contours:L});wall.grab(wallLetter,90,140);wall.move(-10000,-10000);let wallBend=0;
for(let i=0;i<300;i++){wall.step(.5);wallBend=Math.max(wallBend,error(wallLetter));finite(wall)}assert.ok(wallBend>8,'wall contact bends the actual outline');wall.release(true);
// A busy row and narrow/wide viewports must remain finite during a sustained push and recovery.
for(const width of [390,1440]){
  const height=width===390?650:795,crowd=new SoftLetterWorld(width,height),bw=width*.098,h=height*.42;
  for(let row=0;row<2;row++)for(let i=0;i<(row?8:9);i++)crowd.add({index:crowd.bodies.length,x:width*.04+bw/2+i*width*.104,y:(row?.74:.25)*height,w:bw,h,contours:i%3===1?O:L});
  crowd.setAmbient(.85);const held=crowd.bodies[3];crowd.grab(held,held.x,held.y);crowd.move(width+500,held.y);
  for(let i=0;i<300;i++){crowd.step(.5);finite(crowd)}crowd.release();for(let i=0;i<300;i++){crowd.step(.5);finite(crowd)}
  crowd.setAmbient(0);crowd.reset();assert.ok(crowd.bodies.every(b=>Math.hypot(b.x-b.homeX,b.y-b.homeY)<.01));
}
// Held pressure must not revive the original pile-up vibration or collapse the material area.
{
 const w=new SoftLetterWorld(600,400);for(let i=0;i<5;i++)w.add({index:i,x:60+i*110,y:200,w:95,h:175,contours:L});const held=w.bodies[0];w.grab(held,held.nodes[0].x,held.nodes[0].y);w.move(1000,200);
 let last=w.bodies.flatMap(b=>b.nodes.map(n=>({x:n.x,y:n.y}))),sum=0,count=0;
 for(let frame=0;frame<1100;frame++){w.step(.5);const nodes=w.bodies.flatMap(b=>b.nodes);if(frame>900)nodes.forEach((n,i)=>{sum+=(n.x-last[i].x)**2+(n.y-last[i].y)**2;count++});last=nodes.map(n=>({x:n.x,y:n.y}))}
 assert.ok(Math.sqrt(sum/count)<.5,'sustained contact settles without pile-up vibration');
 for(const b of w.bodies)for(const loop of b.loops){const p=loop.indices.map(i=>b.nodes[i]);let area=0;for(let i=0;i<p.length;i++){const n=p[i],q=p[(i+1)%p.length];area+=n.x*q.y-q.x*n.y}assert.ok(area/2/loop.area>.75,'squeezing preserves material area rather than flattening letters away')}
}
assert.throws(()=>new SoftLetterWorld(NaN,500));assert.throws(()=>new SoftLetterWorld(500,500).add({index:0,x:100,y:100,w:20,h:100,contours:[[{u:NaN,v:0},{u:1,v:0},{u:0,v:1}]]}));
assert.equal((toSVGPath(pick.contours(ring)).match(/M/g)||[]).length,2,'SVG rendering includes the counter path');
function checkUI(reduced,withProjects=false){
 const content=require('./portfolio-content');
  const nodes=new Map(),frames=[],listeners={};let focused,time=0,scrollCalls=0,resetCalls=0,instrumented=false,lastScrollBehavior;
  const brush=new Proxy({measureText(){return{width:70,actualBoundingBoxLeft:1,actualBoundingBoxRight:69,actualBoundingBoxAscent:80,actualBoundingBoxDescent:0}},getImageData(x,y,w,h){const data=new Uint8ClampedArray(w*h*4);for(let y=3;y<h-3;y++)for(let x=3;x<w-3;x++)data[(y*w+x)*4+3]=255;return{data}}},{get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});
  class Element{
    constructor(){this.style={setProperty(){}};this.children=[];this.events={};this.classList={toggle(){}};this.clientWidth=390;this.clientHeight=844;this.offsetHeight=1688;this.offsetTop=0}
    append(e){this.children.push(e)}replaceChildren(...children){this.children=children}getContext(){return brush}setAttribute(k,v){this[k]=v}getAttribute(k){return this[k]??null}removeAttribute(k){delete this[k]}
    querySelector(s){this.parts||={};return this.parts[s]||=new Element()}addEventListener(t,f){this.events[t]=f}focus(){focused=this}scrollIntoView(options){lastScrollBehavior=options?.behavior}setPointerCapture(){}getBoundingClientRect(){return{left:0,top:0}}
  }
  const preference={matches:reduced,addEventListener(t,f){this.change=f}},doc={hidden:false,documentElement:{dataset:{}},addEventListener(t,f){listeners[t]=f},getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id)},createElement(){return new Element()},createElementNS(){return new Element()}};
  const context={document:doc,matchMedia:()=>preference,getComputedStyle:()=>({fontSize:'100px',fontWeight:'900',fontFamily:'Arial'}),requestAnimationFrame:f=>(frames.push(f),frames.length),scrollY:0};context.window={devicePixelRatio:1,addEventListener(t,f){listeners[t]=f},scrollTo({top}){context.scrollY=top;scrollCalls++}};
  for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)){vm.runInNewContext(match[1],context);
  if(withProjects&&match[1].includes('const content={'))context.MoushettePortfolioContent.categories.forEach(category=>{category.projects=[
    {approved:false,title:'PENDING PROJECT',images:[{permission:'approved',src:'pending-project.svg',alt:'Pending project'}]},
    {approved:true,title:'NO CLEARED IMAGES',images:[{permission:'pending',src:'pending-image.svg',alt:'Pending image'}]},
    {approved:true,title:'Fixture <script>',scope:'Scope & detail',images:[{permission:'approved',src:'approved.svg',alt:'Alt "quoted"',credit:'Credit <test>'},{permission:'pending',src:'excluded.svg',alt:'Excluded'}]}
  ]});
  if(context.MoushetteSoftLetters&&!instrumented){const proto=context.MoushetteSoftLetters.SoftLetterWorld.prototype,reset=proto.reset;proto.reset=function(){resetCalls++;return reset.call(this)};instrumented=true}}
  const run=(n=4)=>{for(let i=0;i<n&&frames.length;i++)frames.shift()(time+=16.667)};
  nodes.get('faceToggle').events.click({detail:0});assert.equal(nodes.get('faceToggle').getAttribute('aria-expanded'),'true');assert.equal(nodes.get('elsewhereLinks').hidden,false);nodes.get('faceToggle').events.click({detail:0});assert.equal(nodes.get('faceToggle').getAttribute('aria-expanded'),'false');assert.equal(nodes.get('elsewhereLinks').hidden,true);
  const menu=nodes.get('menu'),rows=nodes.get('menuItems').children,paths=nodes.get('letters').children[0].children.map(group=>group.children[0]);
  assert.equal(paths.length,content.identity.nameLines.join('').replace(/\s/g,'').length);assert.equal(rows.length,content.categories.length+1);assert.equal(menu.inert,!reduced);const firstPaths=paths.map(p=>p.d);run();if(!reduced)assert.ok(paths.some((p,i)=>p.d!==firstPaths[i]),'idle redraws actual glyph contours without input');assert.equal(frames.length,reduced?0:1,'visible ambient physics runs on arrival and reduced motion stays still');
  if(!reduced){const path=paths[3],e={button:0,pointerId:1,clientX:150,clientY:180};path.events.pointerdown(e);path.events.pointermove({...e,clientX:220,clientY:300});run(12);path.events.pointerup({...e,type:'pointerup',clientX:220,clientY:300});run(12);paths[0].events.keydown({key:'ArrowRight',preventDefault(){}});paths[0].events.keydown({key:'Enter',preventDefault(){}});assert.equal(scrollCalls,0,'play never navigates');assert.equal(menu.inert,true);paths[0].events.keydown({key:'Escape',preventDefault(){}});assert.equal(scrollCalls,0);doc.hidden=true;listeners.visibilitychange();run();assert.equal(frames.length,0);doc.hidden=false;listeners.visibilitychange()}
  const resetsBeforeMenu=resetCalls;
  if(!reduced){context.scrollY=(1688-844)*.7;listeners.scroll();run();assert.equal(resetCalls,resetsBeforeMenu,'partial reveal does not reset visible letters')}
  nodes.get('bottom').events.click({detail:1});run();assert.equal(resetCalls,resetsBeforeMenu+(reduced?0:1),'menu entry resets the hidden name once');assert.equal(menu.inert,false);assert.equal(focused,undefined);
  nodes.get('menuButton').events.click({detail:0});run();assert.equal(focused,rows[0]);assert.equal(resetCalls,resetsBeforeMenu+(reduced?0:1),'remaining in the menu does not reset repeatedly');
  rows.forEach((row,i)=>{row.events.click({detail:0});assert.equal(focused,nodes.get(i===content.categories.length?'bio':'gallery').querySelector('h1'));
    if(i<content.categories.length){const output=nodes.get('galleryProjects').innerHTML;
      if(withProjects){assert.ok(output.includes('approved.svg'));assert.ok(output.includes('Fixture &lt;script&gt;'));assert.ok(output.includes('Alt &quot;quoted&quot;'));assert.ok(!/PENDING PROJECT|NO CLEARED IMAGES|pending-image.svg|excluded.svg/.test(output),'uncleared projects and images never appear')}
      else {
        const projects=content.categories[i].projects.filter(project=>project.approved);
        assert.equal((output.match(/<img /g)||[]).length,projects.length,'category shows one cover per project');
        assert.ok(!/<details|<summary|VIEW ALL|project-kind|Bespoke production/.test(output),'gallery has no disclosure click or redundant labels');
        projects.forEach((project,index)=>{
          nodes.get('galleryProjects').events.click({detail:1,target:{closest(selector){return selector==='[data-project]'?{getAttribute(){return String(index)}}:null}}});
          const detail=nodes.get('galleryProjects').innerHTML;
          assert.equal(lastScrollBehavior,'instant','project switches reset position without sweeping through and revealing all new photos');
          assert.equal((detail.match(/<img /g)||[]).length,project.images.filter(image=>image.permission==='approved').length,'only selected project photographs render');
          for(const credit of new Set(project.images.map(image=>image.credit).filter(Boolean)))assert.equal(detail.split(credit).length-1,1,'credit appears once per project');
          nodes.get('galleryProjects').events.click({detail:1,target:{closest(selector){return selector==='[data-project-back]'?{}:null}}});
          assert.equal((nodes.get('galleryProjects').innerHTML.match(/<img /g)||[]).length,projects.length,'return restores project covers');
        });
      }
    }nodes.get(i===content.categories.length?'bioBack':'back').events.click({detail:0});run();assert.equal(focused,row)});
  preference.change({matches:true});run();assert.equal(menu.inert,false);assert.equal(frames.length,0);
}
checkUI(false);checkUI(true);checkUI(true,true);
console.log('PASS: elastic physics, simulated DOM navigation, project isolation, head toggle and reduced motion.');
