import * as THREE from 'three';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.getElementById('rad');
const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
r.setPixelRatio(Math.min(devicePixelRatio,2));r.toneMapping=THREE.ACESFilmicToneMapping;r.outputColorSpace=THREE.SRGBColorSpace;
const sc=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(32,1,.1,100);cam.position.set(0,.4,9);
// env lighting
sc.add(new THREE.HemisphereLight(0xffe7d6,0x181210,.7));
const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(4,6,6);sc.add(key);
const rim=new THREE.PointLight(0xff5a1f,30,20);rim.position.set(-4,1,-3);sc.add(rim);
const glow=new THREE.PointLight(0xff7a2f,0,8);glow.position.set(0,0,1.8);sc.add(glow);
const grp=new THREE.Group();sc.add(grp);
const N=12, cols=[];
const cold=new THREE.Color(0x7d8794), hot=new THREE.Color(0xff5a1f), emisHot=new THREE.Color(0xff3c00);
for(let i=0;i<N;i++){
 const m=new THREE.MeshStandardMaterial({color:0xe8e4de,metalness:.55,roughness:.32,emissive:0x000000});
 const col=new THREE.Group();
 for(const z of [-.18,.18]){
  const tube=new THREE.Mesh(new THREE.CapsuleGeometry(.11,2.6,8,16),m);tube.position.z=z;col.add(tube);
 }
 const web=new THREE.Mesh(new THREE.BoxGeometry(.06,2.4,.3),m);col.add(web);
 col.position.x=(i-(N-1)/2)*.36;grp.add(col);cols.push(m);
}
const hm=new THREE.MeshStandardMaterial({color:0xd9d4cc,metalness:.6,roughness:.3});
for(const y of [1.42,-1.42]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,N*.36+.2,24),hm);h.rotation.z=Math.PI/2;h.position.y=y;grp.add(h);}
// valves + pipes
const brass=new THREE.MeshStandardMaterial({color:0xc9a050,metalness:1,roughness:.28});
const chrome=new THREE.MeshStandardMaterial({color:0xdddddd,metalness:1,roughness:.12});
const ex=N*.18+.25;
for(const s of [-1,1]){
 const v=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.4,20),brass);v.position.set(s*ex,-1.5,0);v.rotation.z=Math.PI/2;grp.add(v);
 const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1.6,16),chrome);p.position.set(s*(ex+.2),-2.3,0);grp.add(p);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.3,24),s<0?new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5}):chrome);cap.position.set(s*(ex+.2),-1.2,0);grp.add(cap);
}
// wall + floor shadow plate
const wall=new THREE.Mesh(new THREE.PlaneGeometry(14,9),new THREE.MeshStandardMaterial({color:0x221d1a,roughness:.95}));wall.position.z=-.9;sc.add(wall);
// heat shimmer particles (sprites rising)
const pg=new THREE.BufferGeometry();const PC=160;const pos=new Float32Array(PC*3);
for(let i=0;i<PC;i++){pos[i*3]=(Math.random()-.5)*4.4;pos[i*3+1]=Math.random()*3+1.5;pos[i*3+2]=(Math.random()-.2)*.8;}
pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
const pm=new THREE.PointsMaterial({color:0xff8a3d,size:.05,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
const pts=new THREE.Points(pg,pm);grp.add(pts);
grp.rotation.set(.05,-.45,0);
let ry=-.45,rx=.05,drag=false,lx=0,ly=0,vel=0;
cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx;vel=dx*.01;ry+=vel;rx=Math.max(-.4,Math.min(.5,rx+(e.clientY-ly)*.005));lx=e.clientX;ly=e.clientY;});
addEventListener('pointerup',()=>drag=false);
cv.style.touchAction='pan-y';
const temp=document.getElementById('temp'),out=document.getElementById('tempOut');
let target=0,heat=0;
function setT(){const t=+temp.value;out.textContent=t+'\u00b0C';target=(t-10)/14;}
temp.addEventListener('input',setT);setT();
// auto-warm when lab scrolls into view
new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&temp.value==16&&!RM){let t=16;const iv=setInterval(()=>{t+=.5;temp.value=t;setT();if(t>=21)clearInterval(iv);},70);}})},{threshold:.5}).observe(cv);
function size(){const w=cv.clientWidth,h=cv.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.position.z=w<500?11.5:9;cam.updateProjectionMatrix();}
addEventListener('resize',size);size();
const clock=new THREE.Clock();
function loop(){
 const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 heat+=(target-heat)*(RM?1:dt*2.5);
 cols.forEach((m,i)=>{const d=Math.abs(i-(N-1)/2)/((N-1)/2);const local=Math.max(0,Math.min(1,heat*1.35-d*.35));
  m.color.copy(cold).lerp(hot,local*.55).lerp(new THREE.Color(0xf3efe9),.35*(1-local));m.emissive.copy(emisHot).multiplyScalar(local*.55);});
 glow.intensity=heat*14;pm.opacity=heat*.8;
 if(!RM){const a=pg.attributes.position.array;for(let i=0;i<PC;i++){a[i*3+1]+=dt*(.4+heat);a[i*3]+=Math.sin(t*2+i)*.002;if(a[i*3+1]>4.4)a[i*3+1]=1.5;}pg.attributes.position.needsUpdate=true;}
 if(!drag){vel*=.94;ry+=vel;if(!RM)ry+=Math.sin(t*.4)*.0015;}
 grp.rotation.y+=(ry-grp.rotation.y)*.15;grp.rotation.x+=(rx-grp.rotation.x)*.15;
 r.render(sc,cam);requestAnimationFrame(loop);
}
loop();
