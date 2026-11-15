/* Photographic scene objects; SVG also draws the jigger fill diagram and digital clock. */
(function(root){
 'use strict';let serial=0;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const data=()=>root.JojuBarPhotos;
 function photo(key,label,rotation=0){
  const replacement=key==='g:collins'?root.JojuArt?.studyPhotos?.['glass-collins']:['b:tomato','b:sloeGin'].includes(key)?root.JojuArt?.studyPhotos?.[key.slice(2)]:null;
  const p=(replacement?{asset:'study-photo',crop:replacement.crop}:null)||data().items[key]||(key==='f:olive:whole'?{asset:'station-olives',crop:[171,1208,114,168]}:null);if(!p)throw Error('실제 사진이 연결되지 않았습니다: '+key);
  const asset=replacement||(p.asset==='station-olives'?{src:'images/station/spirits.png',width:800,height:1422}:data().assets[p.asset]),crop=p.crop||[0,0,asset.width,asset.height],id='bar-photo-'+(++serial);
  const [x,y,w,h]=crop,outline=p.mask||'0,0 '+w+',0 '+w+','+h+' 0,'+h,mask='<defs><clipPath id="'+id+'"><polygon points="'+outline+'"/></clipPath></defs>';
  const quarter=p.rotate===90;
  return '<svg class="bar-real-photo" preserveAspectRatio="xMidYMax meet" viewBox="0 0 '+(quarter?h:w)+' '+(quarter?w:h)+'" role="img" aria-label="'+esc(label)+(asset.credit?.includes('재제작')?' 사진 스타일 이미지':' 실제 사진')+'" xmlns="http://www.w3.org/2000/svg" style="'+(rotation?'transform:rotate('+rotation+'deg);':'')+'">'+mask+(quarter?'<g transform="translate('+h+' 0) rotate(90)">':'')+'<image href="'+esc(asset.src)+'" x="'+(-x)+'" y="'+(-y)+'" width="'+asset.width+'" height="'+asset.height+'" clip-path="url(#'+id+')"/>'+(quarter?'</g>':'')+'</svg>';
 }
 function tool(id,s){return photo('t:'+id,root.JojuBarObjects.byKey['t:'+id]?.name||id);}
 function fruit(value){
  const f=typeof value==='string'?{kind:value,form:'whole',angle:0}:value;
  let key='f:'+f.kind+':'+(f.form||'whole');
  if(f.wrapped&&data().items['f:'+f.kind+':wrapped'])key='f:'+f.kind+':wrapped';
  else if(f.cherry&&data().items['f:'+f.kind+':cherry'])key='f:'+f.kind+':cherry';
  const mapping=data().items[key]?key:'f:'+f.kind+':whole';
  const picture=photo(mapping,(root.JojuBarCore.fruitNames[f.kind]||f.kind)+' '+(root.JojuBarCore.forms[f.form]||''),f.angle||0);
  return f.cherry?'<span class="bar-photo-composite">'+picture+'<span class="bar-photo-cherry">'+photo('f:cherry:garnish','픽에 꽂은 체리')+'</span></span>':picture;
 }
 function item(o,s){
  if(o.type==='ingredient'&&root.JojuBottleData?.[o.id]){
   const bottle=root.JojuBottleData[o.id];
   if(o.photoCrop)return '<svg class="bar-real-photo" viewBox="'+o.photoCrop.join(' ')+'" preserveAspectRatio="xMidYMax meet" role="img" aria-label="'+esc(o.name)+' 실제 제품 사진"><image href="'+esc(bottle.src)+'" width="'+bottle.width+'" height="'+bottle.height+'"/></svg>';
   return '<img draggable="false" src="'+esc(bottle.src)+'" alt="'+esc(o.name)+' 실제 제품 사진">';
  }
  if(o.type==='fruit')return fruit(s?.fruit?.kind===o.id?s.fruit:o.id);
  return photo(o.key,o.name);
 }
 function status(o,s){
  if(o.type==='fruit'&&s.fruit?.kind===o.id)return root.JojuBarCore.forms[s.fruit.form]||'착즙한 반쪽';
  if(o.id==='jigger'&&s.drink.cup)return root.JojuPhotoCore.fmt(s.drink.cup.n,s.drink.cup.unit);
  if(o.type==='tool'&&['shaker','mixing','blender'].includes(o.id)){const n=s.drink.pours.filter(p=>p.location===o.id).length;return [o.id==='mixing'?'':s.closed[o.id]?(o.id==='shaker'&&s.capOff?'윗캡 열림':'뚜껑 닫힘'):'뚜껑 열림',n?n+'회 계량':'',s.drink.ice[o.id]?'얼음':''].filter(Boolean).join(' · ');}
  if(o.type==='glass'&&s.drink.glass===o.id)return [s.drink.pours.some(p=>p.location==='glass')?'음료 담김':'',s.drink.ice.glass?'얼음':''].filter(Boolean).join(' · ');
  return '';
 }

 // Cross-section teaching diagram: volume maps to the fill height of a tapered cup.
 function jiggerFill(side='small',amount=0){
  const P=root.JojuPhotoCore,max=side==='large'?1.5:1,wide=side==='large'?45:38,neck=9,top=12,bottom=103;
  const height=n=>bottom-(Math.cbrt(neck**3+Math.min(1,n/max)*(wide**3-neck**3))-neck)/(wide-neck)*(bottom-top);
  const level=height(amount),liquidWidth=neck+(wide-neck)*(bottom-level)/(bottom-top),id='jigger-fill-'+(++serial);
  const ticks=P.ticks[side].map(n=>'<line x1="'+(58+neck+(wide-neck)*(bottom-height(n))/(bottom-top))+'" y1="'+height(n)+'" x2="108" y2="'+height(n)+'" stroke="'+(Math.abs(n-amount)<1e-7?'#754959':'#747865')+'" stroke-width="1"/>').join('');
  return '<svg class="bar-jigger-diagram" viewBox="0 0 120 174" role="img" aria-label="'+(side==='large'?'큰':'작은')+' 쪽 지거 '+(amount?P.fmt(amount,'oz')+' · '+Math.round(amount*3000)/100+' mL':'비어 있음')+'" data-capacity="'+max+'" data-amount="'+amount+'"><defs><linearGradient id="'+id+'"><stop stop-color="#a1a6a4"/><stop offset=".4" stop-color="#f3f1e9"/><stop offset=".6" stop-color="#c0c4bd"/><stop offset="1" stop-color="#767c79"/></linearGradient></defs><path d="M'+(58-wide)+' 12H'+(58+wide)+'L67 103L'+(side==='large'?94:104)+' 162H'+(side==='large'?22:12)+'L49 103Z" fill="url(#'+id+')" stroke="#6f7470" stroke-width="1.5"/><path d="M'+(58-wide+4)+' 16H'+(58+wide-4)+'L65 101H51Z" fill="#f6f1e5"/>'+(amount?'<path d="M'+(58-liquidWidth)+' '+level+'H'+(58+liquidWidth)+'L67 103H49Z" fill="#ac8b36" fill-opacity=".8"/><line x1="'+(58-liquidWidth)+'" x2="'+(58+liquidWidth)+'" y1="'+level+'" y2="'+level+'" stroke="#754959" stroke-width="2"/>':'')+ticks+'<path d="M'+(58-wide)+' 12H'+(58+wide)+'M49 103H67M'+(side==='large'?22:12)+' 162H'+(side==='large'?94:104)+'" stroke="#606763" stroke-width="3" fill="none"/></svg>';
 }
 function digitalClock(value){
  const segments=['M3 2H13','M15 4V10','M15 14V20','M3 22H13','M1 14V20','M1 4V10','M3 12H13'];
  const digits=['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];
  const minutes=value.split(':')[0].length,numbers=value.replace(':','').split(''),colon=minutes*20+3;
  return '<svg viewBox="0 0 '+(numbers.length*20+8)+' 24" aria-hidden="true">'+numbers.map((n,i)=>'<g transform="translate('+(i*20+(i>=minutes?11:0))+',0)">'+segments.map((d,k)=>'<path d="'+d+'" stroke="'+(digits[Number(n)][k]==='1'?'#ff3939':'#3b1818')+'" stroke-width="2.4"/>').join('')+'</g>').join('')+'<g fill="#ff3939"><rect x="'+colon+'" y="7" width="3" height="3"/><rect x="'+colon+'" y="16" width="3" height="3"/></g></svg>';
 }

 // Same geometry as the drawn tapered cup: pointer height snaps to a real jigger marking.
 function jiggerAt(side,y){
  const max=side==='large'?1.5:1,wide=side==='large'?45:38,neck=9;
  const height=n=>103-(Math.cbrt(neck**3+n/max*(wide**3-neck**3))-neck)/(wide-neck)*91;
  return [0,...root.JojuPhotoCore.ticks[side]].reduce((best,n)=>Math.abs(height(n)-y)<Math.abs(height(best)-y)?n:best,0);
 }
 function examinerImage(kind){return kind==='incident'?examinerIncident:kind==='submission'?examinerSubmission:examinerAlternate;}
 function examinerPoses(){return '<div class="bar-examiner-poses" aria-hidden="true"><img class="bar-examiner-female" src="'+examinerAlternate+'" alt="" draggable="false"><img class="bar-examiner-male" src="'+examinerAlternate+'" alt="" draggable="false"></div><output class="bar-examiner-reaction" id="bar-examiner-reaction" aria-live="polite" hidden></output>';}

 const examinerAlternate=globalThis.JojuPackedPhotos["bar-art-1"];
 const examinerIncident=globalThis.JojuPackedPhotos["bar-art-2"];
 const examinerSubmission=globalThis.JojuPackedPhotos["bar-art-3"];
 root.JojuBarArt={examinerImage,item,tool,fruit,status,photo,jiggerFill,jiggerAt,digitalClock,examinerPoses};
})(typeof globalThis!=='undefined'?globalThis:this);
