(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
// nav active state
var links=[].slice.call(document.querySelectorAll('.rail ol a'));
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('on',l.dataset.sec===e.target.id);if(l.dataset.sec===e.target.id)l.setAttribute('aria-current','true');else l.removeAttribute('aria-current');});}});},{rootMargin:'-45% 0px -50% 0px'});
['top','services','lab','reviews','quote'].forEach(function(id){io.observe(document.getElementById(id));});
// reveals
var rv=document.querySelectorAll('.sec-head,.svc-list li,.lab-copy,.lab-stage,.rev,.q-head,form');
var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io2.unobserve(e.target);}});},{threshold:.12});
rv.forEach(function(el,i){el.classList.add('reveal');el.style.transitionDelay=(i%5)*60+'ms';io2.observe(el);});
// hero gauge
var g=document.querySelector('.gauge-fill');
addEventListener('scroll',function(){var p=Math.min(1,scrollY/(document.body.scrollHeight-innerHeight));g.style.width=(p*100)+'%';},{passive:true});
// service peek
var peek=document.querySelector('.svc-peek'),pi=document.getElementById('peekImg');
document.querySelectorAll('.svc-list li').forEach(function(li){
 li.addEventListener('mouseenter',function(){pi.src=li.dataset.img;peek.classList.add('show');});
 li.addEventListener('mouseleave',function(){peek.classList.remove('show');});
 li.addEventListener('mousemove',function(e){peek.style.left=(e.clientX+24)+'px';peek.style.top=(e.clientY-100)+'px';});
});
// add to quote
var chips=[].slice.call(document.querySelectorAll('#chips input'));
document.querySelectorAll('.svc-list button').forEach(function(b){
 b.addEventListener('click',function(){var c=chips.find(function(x){return x.value===b.dataset.job});c.checked=!c.checked;sync();});
});
function sync(){document.querySelectorAll('.svc-list button').forEach(function(b){var c=chips.find(function(x){return x.value===b.dataset.job});b.classList.toggle('picked',c.checked);b.setAttribute('aria-pressed',c.checked);b.querySelector('.add').textContent=c.checked?'\u2713 In your quote':'+ Add to quote';});}
chips.forEach(function(c){c.addEventListener('change',sync);});sync();
// form
document.getElementById('qform').addEventListener('submit',function(e){
 e.preventDefault();var n=document.getElementById('qn'),a=document.getElementById('qa'),err=document.getElementById('qerr');
 [n,a].forEach(function(x){x.setAttribute('aria-invalid',!x.value.trim());});
 if(!n.value.trim()||!a.value.trim()){err.textContent='Please add your name and area.';(n.value.trim()?a:n).focus();return;}
 err.textContent='';var jobs=chips.filter(function(c){return c.checked}).map(function(c){return c.value});
 var msg='Hi Harvs & Sons, I would like a quote.\nName: '+n.value.trim()+'\nArea: '+a.value.trim()+'\nJobs: '+(jobs.join(', ')||'Not sure yet')+'\nUrgency: '+document.getElementById('qu').value+'\nDetails: '+(document.getElementById('qd').value.trim()||'-');
 window.open('https://wa.me/447877455279?text='+encodeURIComponent(msg),'_blank','noopener');
});
})();
