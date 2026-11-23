/* Moushette Soft Letters — dependency-free contour physics. No reference-site code or assets. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MoushetteSoftLetters=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function area(points){let sum=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];sum+=a.x*b.y-b.x*a.y}return sum/2}
function sampleLoop(points,count){
  const lengths=points.map((p,i)=>Math.hypot(points[(i+1)%points.length].x-p.x,points[(i+1)%points.length].y-p.y));
  const total=lengths.reduce((a,b)=>a+b,0),out=[];let edge=0,start=0;
  for(let i=0;i<count;i++){const distance=total*i/count;while(edge<points.length-1&&start+lengths[edge]<distance)start+=lengths[edge++];const t=(distance-start)/Math.max(.001,lengths[edge]),a=points[edge],b=points[(edge+1)%points.length];out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})}return out;
}
class SoftLetterWorld{
  constructor(width,height){if(![width,height].every(n=>Number.isFinite(n)&&n>4))throw new Error('World dimensions must be finite and greater than four pixels.');this.width=width;this.height=height;this.bodies=[];this.drag=null;this.time=0;this.ambient=0}
  add(spec){
    const {x,y,w,h}=spec;
    if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw new Error('Letter position and size must be finite, with positive dimensions.');
    const b={...spec,index:Number.isFinite(spec.index)?spec.index:this.bodies.length,homeX:x,homeY:y,x,y,w,h,angle:0,nodes:[],loops:[],links:[],bounds:null};
    const contours=spec.contours||[[{u:0,v:0},{u:1,v:0},{u:1,v:1},{u:0,v:1}]];
    for(const contour of contours){
      if(contour.length<3)continue;
      if(!contour.every(p=>Number.isFinite(p.u)&&Number.isFinite(p.v)&&p.u>=0&&p.u<=1&&p.v>=0&&p.v<=1))throw new Error('Contour coordinates must be finite normalized u/v values between zero and one.');
      const original=contour.map(p=>({x:(p.u-.5)*w,y:(p.v-.5)*h}));
      const perimeter=original.reduce((sum,p,i)=>sum+Math.hypot(p.x-original[(i+1)%original.length].x,p.y-original[(i+1)%original.length].y),0);
      const samples=sampleLoop(original,clamp(Math.ceil(perimeter/12),16,112)),loop=[];
      for(const p of samples){loop.push(b.nodes.length);b.nodes.push({rx:p.x,ry:p.y,x:x+p.x,y:y+p.y,vx:0,vy:0,oldX:0,oldY:0,normals:[]})}
      b.loops.push({indices:loop,area:area(samples)});
      for(let i=0;i<loop.length;i++)for(const skip of [1,2]){const a=loop[i],c=loop[(i+skip)%loop.length],p=b.nodes[a],q=b.nodes[c];b.links.push({a,c,length:Math.hypot(p.rx-q.rx,p.ry-q.ry),strength:skip===1?.42:.09})}
    }
    if(!b.nodes.length)throw new Error('A letter needs at least one closed contour.');
    b.restX=b.nodes.reduce((sum,n)=>sum+n.rx,0)/b.nodes.length;b.restY=b.nodes.reduce((sum,n)=>sum+n.ry,0)/b.nodes.length;
    // Counter-to-stroke links preserve thickness while allowing both contours to bend.
    const outer=b.loops.reduce((a,c)=>Math.abs(a.area)>Math.abs(c.area)?a:c);
    for(const loop of b.loops)if(loop!==outer)for(const index of loop.indices){const p=b.nodes[index];let nearest=outer.indices[0],distance=Infinity;for(const j of outer.indices){const q=b.nodes[j],d=Math.hypot(p.rx-q.rx,p.ry-q.ry);if(d<distance){distance=d;nearest=j}}b.links.push({a:index,c:nearest,length:distance,strength:.12})}
    this.bodies.push(b);this.updateBody(b);return b;
  }
  updateBody(b){
    let x=0,y=0,dot=0,cross=0,minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for(const n of b.nodes){x+=n.x;y+=n.y;minX=Math.min(minX,n.x);maxX=Math.max(maxX,n.x);minY=Math.min(minY,n.y);maxY=Math.max(maxY,n.y)}x/=b.nodes.length;y/=b.nodes.length;
    for(const n of b.nodes){const rx=n.rx-b.restX,ry=n.ry-b.restY;dot+=rx*(n.x-x)+ry*(n.y-y);cross+=rx*(n.y-y)-ry*(n.x-x)}
    b.angle=Math.atan2(cross,dot);b.cx=x;b.cy=y;b.x=x-Math.cos(b.angle)*b.restX+Math.sin(b.angle)*b.restY;b.y=y-Math.sin(b.angle)*b.restX-Math.cos(b.angle)*b.restY;b.bounds={minX,minY,maxX,maxY};
  }
  inside(b,x,y){let inside=false;for(const loop of b.loops){const ids=loop.indices;for(let i=0,j=ids.length-1;i<ids.length;j=i++){const a=b.nodes[ids[i]],c=b.nodes[ids[j]];if((a.y>y)!==(c.y>y)&&x<(c.x-a.x)*(y-a.y)/(c.y-a.y)+a.x)inside=!inside}}return inside}
  nearest(b,x,y){let best=null,distance=Infinity;for(const loop of b.loops){const ids=loop.indices;for(let i=0;i<ids.length;i++){const a=b.nodes[ids[i]],c=b.nodes[ids[(i+1)%ids.length]],dx=c.x-a.x,dy=c.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/Math.max(.001,dx*dx+dy*dy),0,1),qx=a.x+dx*t,qy=a.y+dy*t,d=Math.hypot(x-qx,y-qy);if(d<distance){distance=d;best={a,c,t,x:qx,y:qy,distance}}}}return best}
  pick(x,y){for(let i=this.bodies.length-1;i>=0;i--){const b=this.bodies[i],r=b.bounds;if(x>=r.minX&&x<=r.maxX&&y>=r.minY&&y<=r.maxY&&this.inside(b,x,y))return b}return null}
  grab(body,x,y){if(!this.bodies.includes(body)||![x,y].every(Number.isFinite))return;const edge=this.nearest(body,x,y);this.drag={body,a:edge.a,c:edge.c,t:edge.t,offsetX:x-edge.x,offsetY:y-edge.y,x,y}}
  move(x,y){if(this.drag&&[x,y].every(Number.isFinite)){this.drag.x=clamp(x,2,this.width-2);this.drag.y=clamp(y,2,this.height-2)}}
  release(cancelled=false){if(this.drag&&cancelled)for(const n of this.drag.body.nodes)n.vx=n.vy=0;this.drag=null}
  setAmbient(strength=0){
    const next=Number.isFinite(strength)?clamp(strength,0,1):0,start=this.ambient===0&&next>0;this.ambient=next;
    if(start)this.prime();
  }
  prime(){
    if(!this.ambient)return;
    for(const b of this.bodies){const phase=b.index*1.43,angle=Math.sin(phase)*.035*this.ambient,co=Math.cos(angle),si=Math.sin(angle),bendX=Math.min(7,b.w*.055)*this.ambient,bendY=Math.min(11,b.h*.035)*this.ambient;
      for(const n of b.nodes){const x=n.x-b.x,y=n.y-b.y;n.x=clamp(b.x+co*x-si*y+Math.sin(phase+n.ry/b.h*Math.PI)*bendX,2,this.width-2);n.y=clamp(b.y+si*x+co*y+Math.cos(phase*.8+n.rx/b.w*Math.PI)*bendY,2,this.height-2);n.vx=Math.sin(phase+n.ry/b.h)*.22*this.ambient;n.vy=Math.cos(phase+n.rx/b.w)*.22*this.ambient}this.updateBody(b);
    }
  }
  prepareAmbient(b){
    const strength=this.drag?.body===b?0:this.ambient;
    if(!strength){b.ambientGoals=null;for(const link of b.links)link.targetLength=link.length;return}
    const phase=this.time*1.05+b.index*1.43,bend=Math.sin(phase)*Math.min(16,b.w*.1)*strength,ripple=Math.cos(this.time*.8+b.index*.8)*Math.min(9,b.h*.03)*strength,strain=Math.sin(this.time*.7+b.index)*.01*strength;
    const goals=b.nodes.map(n=>{const x=n.rx-b.restX,y=n.ry-b.restY;return{x:x*(1+strain)+Math.cos(y/b.h*Math.PI)*bend,y:y*(1-strain)+Math.sin(x/b.w*Math.PI)*ripple}});
    const mx=goals.reduce((sum,p)=>sum+p.x,0)/goals.length,my=goals.reduce((sum,p)=>sum+p.y,0)/goals.length;
    // Remove net translation and torque: idle deformation must not steer the name around.
    let moment=0,inertia=0;goals.forEach((p,i)=>{p.x-=mx;p.y-=my;const n=b.nodes[i],x=n.rx-b.restX,y=n.ry-b.restY;moment+=x*(p.y-y)-y*(p.x-x);inertia+=x*x+y*y});const rotation=moment/Math.max(1,inertia);
    goals.forEach((p,i)=>{const n=b.nodes[i];p.x+=(n.ry-b.restY)*rotation;p.y-=(n.rx-b.restX)*rotation});
    b.ambientGoals=goals;for(const link of b.links){const a=goals[link.a],c=goals[link.c];link.targetLength=Math.hypot(a.x-c.x,a.y-c.y)}
  }
  reset(){this.drag=null;this.time=0;for(const b of this.bodies){for(const n of b.nodes){n.x=b.homeX+n.rx;n.y=b.homeY+n.ry;n.vx=n.vy=0}this.updateBody(b)}this.prime()}
  nudge(b,dx=(b.index%2?1:-1)*1.5,dy=-1.5){if(!this.bodies.includes(b)||![dx,dy].every(Number.isFinite))return;for(const n of b.nodes){n.vx+=dx;n.vy+=dy}}
  shape(b){
    this.updateBody(b);const co=Math.cos(b.angle),si=Math.sin(b.angle);
    for(let i=0;i<b.nodes.length;i++){const n=b.nodes[i],rx=b.ambientGoals?b.ambientGoals[i].x:n.rx-b.restX,ry=b.ambientGoals?b.ambientGoals[i].y:n.ry-b.restY;
      const gx=b.cx+co*rx-si*ry,gy=b.cy+si*rx+co*ry;
      n.x+=(gx-n.x)*.028;n.y+=(gy-n.y)*.028;
    }
    for(const link of b.links){const a=b.nodes[link.a],c=b.nodes[link.c],dx=c.x-a.x,dy=c.y-a.y,distance=Math.hypot(dx,dy)||.001,factor=(distance-(link.targetLength??link.length))/distance*link.strength*.5;const x=clamp(dx*factor,-4,4),y=clamp(dy*factor,-4,4);a.x+=x;a.y+=y;c.x-=x;c.y-=y}
    for(const loop of b.loops){const nodes=loop.indices.map(i=>b.nodes[i]),difference=area(nodes)-loop.area;let denominator=0;const gradients=nodes.map((n,i)=>{const prev=nodes[(i+nodes.length-1)%nodes.length],next=nodes[(i+1)%nodes.length],x=(next.y-prev.y)/2,y=(prev.x-next.x)/2;denominator+=x*x+y*y;return{x,y}});const lambda=difference/Math.max(1,denominator)*.13;nodes.forEach((n,i)=>{n.x-=clamp(gradients[i].x*lambda,-3,3);n.y-=clamp(gradients[i].y*lambda,-3,3)})}
  }
  pull(){if(!this.drag)return;const d=this.drag,wa=1-d.t,wc=d.t,den=wa*wa+wc*wc;
    const tx=clamp(d.x-d.offsetX,2,this.width-2),ty=clamp(d.y-d.offsetY,2,this.height-2),x=clamp((tx-(d.a.x*wa+d.c.x*wc))*.42,-7,7),y=clamp((ty-(d.a.y*wa+d.c.y*wc))*.42,-7,7);
    d.a.x+=x*wa/den;d.a.y+=y*wa/den;d.c.x+=x*wc/den;d.c.y+=y*wc/den;
  }
  collide(a,b){
    const bounds=b.bounds;
    for(const p of a.nodes){if(p.x<bounds.minX||p.x>bounds.maxX||p.y<bounds.minY||p.y>bounds.maxY||!this.inside(b,p.x,p.y))continue;
      const edge=this.nearest(b,p.x,p.y);if(!edge||edge.distance<.001)continue;
      const nx=(edge.x-p.x)/edge.distance,ny=(edge.y-p.y)/edge.distance,depth=Math.min(10,edge.distance+1.5),wa=1-edge.t,wc=edge.t,den=1+wa*wa+wc*wc;
      const x=nx*depth*.8/den,y=ny*depth*.8/den;p.x+=x;p.y+=y;edge.a.x-=x*wa;edge.a.y-=y*wa;edge.c.x-=x*wc;edge.c.y-=y*wc;
      p.normals.push({x:nx,y:ny});edge.a.normals.push({x:-nx,y:-ny});edge.c.normals.push({x:-nx,y:-ny});
    }
  }
  step(dt){
    if(!Number.isFinite(dt)||dt<=0)return;
    dt=clamp(dt,.1,1);this.time+=dt/60;
    for(const b of this.bodies)this.prepareAmbient(b);
    for(const b of this.bodies)for(const n of b.nodes){n.oldX=n.x;n.oldY=n.y;n.normals=[];
      n.vx*=Math.pow(.977,dt);n.vy*=Math.pow(.977,dt);n.x+=clamp(n.vx,-10,10)*dt;n.y+=clamp(n.vy,-10,10)*dt;
    }
    for(let pass=0;pass<4;pass++){
      for(const b of this.bodies)this.shape(b);this.pull();for(const b of this.bodies)this.updateBody(b);
      const order=pass%2?[...this.bodies].reverse():this.bodies;
      for(let i=0;i<order.length;i++)for(let j=i+1;j<order.length;j++){const a=order[i],b=order[j],r=a.bounds,s=b.bounds;if(r.maxX<s.minX||s.maxX<r.minX||r.maxY<s.minY||s.maxY<r.minY)continue;this.collide(a,b);this.collide(b,a)}
      for(const b of this.bodies)for(const n of b.nodes){const x=clamp(n.x,2,this.width-2),y=clamp(n.y,2,this.height-2);if(x!==n.x)n.normals.push({x:x>n.x?1:-1,y:0});if(y!==n.y)n.normals.push({x:0,y:y>n.y?1:-1});n.x=x;n.y=y}
    }
    for(const b of this.bodies){for(const n of b.nodes){n.vx=clamp((n.x-n.oldX)/dt,-10,10);n.vy=clamp((n.y-n.oldY)/dt,-10,10);
      for(const normal of n.normals){const speed=n.vx*normal.x+n.vy*normal.y;if(speed<0){const impulse=-speed*(speed<-.8?1.15:1);n.vx+=normal.x*impulse;n.vy+=normal.y*impulse}}
      n.vx=clamp(n.vx,-10,10);n.vy=clamp(n.vy,-10,10);
    }this.updateBody(b)}
  }
  isActive(){return this.ambient>0||Boolean(this.drag)||this.bodies.some(b=>b.nodes.some(n=>n.vx*n.vx+n.vy*n.vy>.000625))}
  contours(b){return b.loops.map(loop=>loop.indices.map(i=>({x:b.nodes[i].x,y:b.nodes[i].y})))}
}

function traceLetterContours(data,width,height,stride=2){
  if(![width,height,stride].every(n=>Number.isFinite(n)&&n>0)||!Number.isInteger(width)||!Number.isInteger(height)||!data||data.length<width*height*4)throw new Error('Tracing requires positive dimensions and a complete RGBA buffer.');
  const cols=Math.ceil(width/stride),rows=Math.ceil(height/stride),solid=new Uint8Array(cols*rows),edges=new Map();
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)solid[y*cols+x]=data[(Math.min(height-1,y*stride)*width+Math.min(width-1,x*stride))*4+3]>100?1:0;
  const filled=(x,y)=>x>=0&&y>=0&&x<cols&&y<rows&&solid[y*cols+x];
  const key=(x,y)=>y*(cols+1)+x;
  function add(x,y,tx,ty,dir){const k=key(x,y);if(!edges.has(k))edges.set(k,[]);edges.get(k).push({x:tx,y:ty,dir})}
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(filled(x,y)){
    if(!filled(x,y-1))add(x,y,x+1,y,0);if(!filled(x+1,y))add(x+1,y,x+1,y+1,1);
    if(!filled(x,y+1))add(x+1,y+1,x,y+1,2);if(!filled(x-1,y))add(x,y+1,x,y,3);
  }
  const contours=[];
  while(edges.size){
    const start=edges.keys().next().value;let k=start,dir=0,count=0;const points=[];
    do{
      const available=edges.get(k);if(!available?.length)break;
      let pick=0;for(const wanted of [(dir+1)%4,dir,(dir+3)%4,(dir+2)%4]){const found=available.findIndex(e=>e.dir===wanted);if(found>=0){pick=found;break}}
      const edge=available.splice(pick,1)[0];if(!available.length)edges.delete(k);
      if(count%3===0||edge.dir!==dir)points.push({u:Math.min(1,(k%(cols+1))*stride/width),v:Math.min(1,Math.floor(k/(cols+1))*stride/height)});
      dir=edge.dir;k=key(edge.x,edge.y);count++;
    }while(k!==start&&count<width*height*4);
    if(points.length>=3){
      let smooth=points;
      for(let pass=0;pass<3;pass++)smooth=smooth.map((p,i)=>{const prev=smooth[(i+smooth.length-1)%smooth.length],next=smooth[(i+1)%smooth.length];return{u:(prev.u+2*p.u+next.u)/4,v:(prev.v+2*p.v+next.v)/4}});
      contours.push(smooth);
    }
  }
  if(!contours.length)return contours;
  const points=contours.flat(),minU=Math.min(...points.map(p=>p.u)),maxU=Math.max(...points.map(p=>p.u)),minV=Math.min(...points.map(p=>p.v)),maxV=Math.max(...points.map(p=>p.v));
  return contours.map(loop=>loop.map(p=>({u:clamp((p.u-minU)/Math.max(.000001,maxU-minU),0,1),v:clamp((p.v-minV)/Math.max(.000001,maxV-minV),0,1)})));
}

function toSVGPath(contours){
  let path='';const number=n=>n.toFixed(2);
  for(const points of contours){if(points.length<3)continue;const last=points[points.length-1],first=points[0];path+='M'+number((last.x+first.x)/2)+' '+number((last.y+first.y)/2);
    points.forEach((p,i)=>{const next=points[(i+1)%points.length];path+='Q'+number(p.x)+' '+number(p.y)+' '+number((p.x+next.x)/2)+' '+number((p.y+next.y)/2)});path+='Z';
  }return path;
}
return Object.freeze({SoftLetterWorld,traceLetterContours,toSVGPath});
});

