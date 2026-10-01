import gsap from 'gsap';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(a:number,b:number,n:number)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t)};
type Point=[number,number,number];
type Grain={point:Point;region:number;phase:number;size:number};
type Fibre={points:Point[];from:number;to:number};
/** One continuous cortex with two folded hemispheres. Capabilities partition
 * that tissue; they do not define six separate floating volumes. */
export function initNeuralPassage(quiet:boolean){
 const section=document.querySelector<HTMLElement>('.connections');
 const stage=document.querySelector<HTMLElement>('.connections-still');
 const canvas=document.querySelector<HTMLCanvasElement>('.neural-field');
 const context=canvas?.getContext('2d');
 if(!section||!stage||!canvas||!context)return;
 const surface=stage,field=canvas,ctx=context;
 const buttons=Array.from(stage.querySelectorAll<HTMLButtonElement>('[data-region]'));
 const panels=Array.from(stage.querySelectorAll<HTMLElement>('[data-region-panel]'));
 const connector=stage.querySelector<SVGPathElement>('.region-connector path');
 const regions:Point[]=[[-.57,-.25,.28],[.02,-.48,.28],[.58,-.08,.27],[-.08,.02,.32],[-.42,.28,.26],[.48,.36,.22]];
 const pairs=[[0,1],[0,3],[1,2],[2,5],[3,4],[4,5],[0,5],[1,4],[2,3]];
 let seed=4717;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 // Lateral cerebral contour: front at left, recessed occipital base at right.
 const contour:Point[]=[[-.87,-.2,0],[-.79,-.47,0],[-.48,-.64,0],[-.1,-.7,0],[.3,-.62,0],[.65,-.43,0],[.82,-.13,0],[.73,.1,0],[.49,.19,0],[.26,.13,0],[.12,.35,0],[-.15,.48,0],[-.47,.43,0],[-.73,.25,0],[-.87,.04,0]];
 const regionOf=(point:Point)=>regions.reduce((best,r,i)=>Math.hypot(point[0]-r[0],point[1]-r[1])<Math.hypot(point[0]-regions[best]![0],point[1]-regions[best]![1])?i:best,0);
 function outline(u:number):Point{
  const t=((u/(Math.PI*2)%1)+1)%1*contour.length,i=Math.floor(t),f=t-i;
  const at=(offset:number)=>contour[(i+offset+contour.length)%contour.length]!;
  const a=at(-1),b=at(0),c=at(1),d=at(2);
  const spline=(axis:number)=>.5*((2*b[axis]!)+(-a[axis]!+c[axis]!)*f+(2*a[axis]!-5*b[axis]!+4*c[axis]!-d[axis]!)*f*f+(-a[axis]!+3*b[axis]!-3*c[axis]!+d[axis]!)*f*f*f);
  return [spline(0),spline(1),0];
 }
 function cortex(side:number,u:number,v:number,depth=1):Point{
  const edge=outline(u),radius=Math.pow(Math.sin(v),.72)*depth;
  const furrow=Math.sin(u*13+Math.sin(v*7)*2+side*.5)*.018+Math.cos(u*21-v*9)*.009;
  const x=edge[0]*radius+furrow*radius;
  const y=-.1+(edge[1]+.1)*radius+Math.sin(u*9+v*8)*.015*radius;
  // Hemispheres overlap in depth rather than mirroring across the screen.
  const z=side*.105+Math.cos(v)*.22*depth+Math.sin(u*7+v*11)*.018;
  return [x+side*.025,y+side*.015,z];
 }
 const grains:Grain[]=[],folds:Point[][]=[],fibres:Fibre[]=[];
 for(const side of [-1,1]){
  for(let i=0;i<5900;i++){
   const u=random()*Math.PI*2,v=Math.acos(2*random()-1),point=cortex(side,u,v,i%5===0?.65+random()*.3:1);
   grains.push({point,region:regionOf(point),phase:random(),size:.45+random()*1.1});
  }
  // Lower rear tissue remains subordinate to the cerebral volume.
  for(let i=0;i<600;i++){
   const u=random()*Math.PI*2,v=Math.acos(2*random()-1),r=Math.sin(v);
   const point:Point=[.48+Math.cos(u)*r*.24,.34+Math.sin(u)*r*.17,side*.09+Math.cos(v)*.15];
   grains.push({point,region:5,phase:random(),size:.45+random()*1.1});
  }
  for(let k=1;k<31;k++){
   const points:Point[]=[];
   // Meandering cortical tracks turn through the lobe envelope, avoiding latitude bands.
   for(let j=0;j<=100;j++){
    const u=j/100*Math.PI*2;
    const v=k/31*Math.PI+Math.sin(u*3+k*.73)*.12+Math.sin(u*7+k)*.04;
    points.push(cortex(side,u,Math.max(.02,Math.min(Math.PI-.02,v))));
   }
   folds.push(points);
  }
 }
 pairs.forEach(([a,b],index)=>{
  const from=regions[a!]!,to=regions[b!]!,points:Point[]=[];
  for(let j=0;j<=100;j++){
   const t=j/100,arc=Math.sin(t*Math.PI);
   points.push([from[0]+(to[0]-from[0])*t+arc*Math.sin(t*8+index)*.035,from[1]+(to[1]-from[1])*t+arc*(index%2?.13:-.13),from[2]+(to[2]-from[2])*t+arc*.22]);
  }
  fibres.push({points,from:a!,to:b!});
  // Smaller axons branch from each inter-region fibre into nearby tissue.
  for(const t of [.25,.52,.76]){
   const origin=points[Math.round(t*100)]!,branch:Point[]=[];
   for(let j=0;j<=24;j++){const q=j/24;branch.push([origin[0]+Math.sin(index*3+t)*q*.14,origin[1]+Math.cos(index*2+t)*q*.13,origin[2]-q*.16])}
   fibres.push({points:branch,from:a!,to:b!});
  }
 });
 let width=1,height=1,visible=false,reduced=quiet,progress=0,frame=0,last=0,selected=-1,selection=0;
 const state={progress:0},preference=matchMedia('(prefers-reduced-motion: reduce)');
 let tween:gsap.core.Tween|undefined;
 function draw(time:number){
  const p=reduced||selected>=0?.55:progress,mobile=width<600;
  const formation=.15+.85*smooth(0,.38,p),dissolve=smooth(.78,1,p);
  const scale=Math.min(width*(mobile?.46:.35),height*.46)*(1+(1-smooth(0,.4,p))*.18)*(1-selection*(mobile?.15:.12));
  const selectedOnLeft=selected>=0&&regions[selected]![0]<0;
  const centreX=width*(mobile?.5:.59)+selection*width*(mobile?0:selectedOnLeft?.12:-.2);
  const centreY=height*(mobile?.47:.49)-selection*height*(mobile?.18:0);
  const angle=-.27+p*.55+(reduced?0:Math.sin(time*.00015)*.025),c=Math.cos(angle),s=Math.sin(angle);
  const project=(point:Point):[number,number,number]=>{const [x,y,z]=point,rx=x*c+z*s,rz=z*c-x*s,perspective=2.8/(2.8-rz);return [centreX+rx*scale*perspective,centreY+(y-rz*.08)*scale*perspective,perspective]};
  const material=(point:Point,phase:number):Point=>{
   const growth=formation*(1-dissolve);
   return [point[0]*growth+(phase-.5)*2.4*(1-growth),point[1]*growth+Math.sin(phase*12)*.08*(1-growth),point[2]*(.25+.75*growth)];
  };
  function stroke(points:Point[],alpha:number,colour:string,portion=1){
   ctx.beginPath();points.slice(0,Math.max(2,Math.round(points.length*portion))).forEach((point,j)=>{const [x,y]=project(material(point,j/points.length));if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.strokeStyle=`rgba(${colour},${alpha})`;ctx.lineWidth=.6;ctx.stroke();
  }
  ctx.clearRect(0,0,width,height);
  folds.forEach(points=>stroke(points,(.08+.13*formation)*(1-dissolve*.7)*(selected>=0?.4:1),'154,184,166'));
  const skip=mobile?2:1;
  for(let i=0;i<grains.length;i+=skip){
   const g=grains[i]!,[x,y,depth]=project(material(g.point,g.phase));
   const pulse=Math.pow(Math.max(0,Math.cos((g.phase-p*2-(reduced?0:time*.00012))*Math.PI*2)),24);
   const active=selected===g.region,near=selected>=0&&pairs.some(([a,b])=>(a===selected&&b===g.region)||(b===selected&&a===g.region));
   const emphasis=selected<0?1:active?1.7:near?.4:.22;
   const alpha=(.2+depth*.2+pulse*.2)*emphasis*(.55+.45*formation)*(1-dissolve*.4);
   ctx.fillStyle=active?`rgba(237,194,111,${alpha})`:`rgba(${177+g.region*3},${204-g.region*2},${183+g.region},${alpha})`;
   const size=g.size*depth*(1+(active?pulse*.9:pulse*.25));ctx.fillRect(x,y,size,size);
  }
  fibres.forEach((f,i)=>{
   const active=selected===f.from||selected===f.to;
   const growth=.25+.75*smooth(.15,.6,p);
   stroke(f.points,(active?.75:selected>=0?.045:.23)*(1-dissolve*.3),'213,173,101',growth);
   const signal=(p*1.8+i*.137+(reduced?0:time*.00008))%1;
   const point=f.points[Math.floor(signal*(f.points.length-1))]!;
   const [x,y]=project(material(point,signal));
   ctx.fillStyle=`rgba(241,205,141,${active?.95:.65})`;ctx.beginPath();ctx.arc(x,y,active?2.5:1.4,0,Math.PI*2);ctx.fill();
  });
  // A small descending bundle completes the whole mass without a medical render.
  const stem:Point[]=Array.from({length:35},(_,i)=>[.24+i*.002+Math.sin(i*.12)*.014,.37+i*.008,.04] as Point);
  stroke(stem,.28*formation*(1-dissolve),'183,204,185');
  buttons.forEach((button,i)=>{
   const [x,y]=project(regions[i]!);
   button.style.left=`${x}px`;button.style.top=`${y}px`;
   const opacity=reduced||selected>=0?1:smooth(.13,.34,p)*(1-smooth(.84,.98,p));
   button.style.opacity=String(selected>=0&&selected!==i?.65:opacity);
   button.inert=opacity<.1;button.style.setProperty('--fragment',String(selected>=0?0:reduced?1:smooth(.28,.46,p)*(1-smooth(.74,.86,p))));
  });
  if(selected>=0&&connector){
   const [x,y]=project(regions[selected]!);
   const panel=panels[selected]!,box=panel.getBoundingClientRect(),outer=surface.getBoundingClientRect();
   const ex=mobile?box.left-outer.left+box.width*.5:selectedOnLeft?box.right-outer.left:box.left-outer.left;
   const ey=mobile?box.top-outer.top:box.top-outer.top+35;
   connector.setAttribute('d',`M${x} ${y} L${x} ${ey} L${ex} ${ey}`);
  }
  surface.style.setProperty('--field-title',String(selected>=0?0:1-smooth(.12,.32,p)));
  surface.style.setProperty('--mind-caption',String(selected>=0||reduced?0:smooth(.56,.72,p)*(1-smooth(.85,.98,p))));
 }
 function close(focus=true){const previous=selected;selected=-1;surface.classList.remove('region-open','region-left');panels.forEach(panel=>panel.hidden=true);buttons.forEach(b=>b.setAttribute('aria-expanded','false'));if(reduced){selection=0;draw(0)}else start();if(focus&&previous>=0)buttons[previous]?.focus({preventScroll:true})}
 function activate(index:number){
  if(selected===index){close();return}
  selected=index;surface.classList.add('region-open');surface.classList.toggle('region-left',regions[index]![0]<0);
  surface.querySelectorAll<HTMLDetailsElement>('details').forEach(d=>d.open=false);
  panels.forEach((panel,i)=>panel.hidden=i!==index);buttons.forEach((b,i)=>b.setAttribute('aria-expanded',String(i===index)));
  if(reduced){selection=1;draw(0)}else start();panels[index]?.querySelector<HTMLElement>('h3')?.focus({preventScroll:true});
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>activate(i)));
 panels.forEach(panel=>{panel.querySelector('.region-close')?.addEventListener('click',()=>close());panel.querySelector('a')?.addEventListener('click',()=>close(false))});
 surface.addEventListener('keydown',event=>{if(event.key==='Escape'&&selected>=0){event.preventDefault();event.stopPropagation();close()}});
 surface.querySelector('summary')?.addEventListener('click',()=>{if(selected>=0)close(false)});
 function resize(){width=surface.clientWidth;height=surface.clientHeight;const dpr=Math.min(devicePixelRatio||1,1.5);field.width=Math.round(width*dpr);field.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(0)}
 function tick(time:number){frame=0;if(!visible||reduced||document.hidden)return;if(time-last>32){progress+=(state.progress-progress)*.24;selection+=((selected>=0?1:0)-selection)*.2;draw(time);last=time}frame=requestAnimationFrame(tick)}
 function start(){if(!frame&&visible&&!reduced&&!document.hidden)frame=requestAnimationFrame(tick)}
 new ResizeObserver(resize).observe(surface);
 new IntersectionObserver(([entry])=>{visible=Boolean(entry?.isIntersecting);if(visible)start();else{cancelAnimationFrame(frame);frame=0;close(false)}},{rootMargin:'0px'}).observe(section);
 function mode(){reduced=quiet||preference.matches;tween?.scrollTrigger?.kill();tween?.kill();cancelAnimationFrame(frame);frame=0;if(reduced){progress=.55;selection=selected>=0?1:0;draw(0)}else{tween=gsap.to(state,{progress:1,ease:'none',scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:true}});start()}}
 resize();mode();preference.addEventListener('change',mode);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else start()});
}
