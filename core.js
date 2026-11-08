(function(root){
 'use strict';
 const D=root.JojuData||(typeof require!=='undefined'?require('./data.js'):null);
 const norm=s=>String(s??'').toLowerCase().normalize('NFKC').replace(/[\s.,·+&()\-_/’':]/g,'');
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const sample=(a,n)=>shuffle(a).slice(0,n);
 function ice(c){
   if(c.method==='Float'||c.number===30)return '완성 잔에 얼음 없음';
   if(c.method==='Blend')return '제출 잔의 칠링 얼음으로 블렌딩';
   if(['cocktail','saucer','sour','flute'].includes(c.glass))return '혼합용 얼음을 걸러 제출';
   return '완성 잔에 큐브 얼음';
 }
 function keywords(id){
   const v=D.ingredients[id];
   const aliases={sugar:['설탕','sugar'],soda:['소다','soda'],mintGreen:['민트그린','멘트그린','menthegreen'],mintWhite:['민트화이트','멘트화이트','menthewhite'],coffee:['커피','깔루아','칼루아','kahlua','coffee'],orangeLiqueur:['쿠앵트로','코인트로','트리플섹','cointreau','triplesec'],freshLemon:['레몬','lemon'],milk:['밀크','우유','milk'],gamhongro:['감홍로','gamhongro'],jindo:['홍주','jindohongju'],andong:['안동','andong'],insam:['인삼주','insamju'],bokbunja:['복분자','bokbunja'],sweetSour:['사워믹스','사우어믹스','sweetandsour','sweet&sour'],bacardi:['바카디','bacardi'],irishCream:['베일리스','베일리','bailey']};
   return aliases[id]||[v[0].split(' (')[0],v[1].split(' (')[0]];
 }
 function steps(c){
   const out=[];
   const add=(text,groups,extra={})=>out.push({id:out.length,text,groups,...extra});
   add('손과 기물을 씻은 상태에서 지급 재료·잔·도구의 위치와 이름을 확인한다.',[['손'],['확인','위치']],{phase:'prepare'});
   if(c.garnish==='salt')add('깨끗한 칵테일 잔을 차게 준비하고 잔 가장자리에 소금 리밍을 한다.',[['소금','salt'],['리밍','rimming']],{phase:'garnishPrep'});
   else if(!['none','nutmeg','cherry','olive'].includes(c.garnish))add('씻어 물기를 뺀 과일로 '+D.garnishes[c.garnish]+' 장식을 준비한다.',[['장식','가니시','garnish'],['준비','자르','자른','깎']],{phase:'garnishPrep'});
   else add('세척한 '+D.glasses[c.glass][0]+'을 준비하고 상태를 확인한다.',[['잔','글라스','glass'],['준비','확인']],{phase:'glassPrep'});
   const ingredientStep=(x,dest,ending='넣는다')=>{
     const amt=x.verified?x.amount:'용량 원문 확인 필요';
     const measure=['Fill','On Top'].includes(amt)||!x.verified?'':(' '+amt);
     const instruction=['Fill','On Top'].includes(amt)?' ('+amt+')':'';
     const name=D.ingredients[x.id][0],last=name.charCodeAt(name.length-1),particle=!measure&&last>=0xAC00&&last<=0xD7A3&&(last-0xAC00)%28?'을':'를';
     add(name+measure+particle+' '+dest+'에 '+ending+instruction+'.'+(!x.verified?' 용량은 원문 확인이 필요하다.':''),[keywords(x.id),['넣','붓','부어','부은','계량','채우','채운','올리','올린','띄우','쌓']],{ingredient:x.id,phase:'measure'});
   };
   if(c.method==='Float'){
     c.ingredients.forEach((x,i)=>ingredientStep(x,i===0?'준비한 잔 바닥':i===1?'첫 번째 층 위':'두 번째 층 위',i===0?'붓는다':'바 스푼을 대고 천천히 부어 층을 쌓는다'));
     add('층이 섞이지 않았는지 확인하고 별도 장식 없이 코스터에 올려 제출한다.',[['층'],['코스터','coaster'],['제출']],{phase:'submit'});
   }else if(c.number===4){
     ingredientStep(c.ingredients[1],'준비한 잔');ingredientStep(c.ingredients[2],'설탕이 담긴 잔');ingredientStep(c.ingredients[3],'설탕·비터스가 담긴 잔');
     add('잔 안의 가루 설탕을 소다 워터에 저어 녹인다.',[['설탕'],['녹','저어']],{phase:'dissolve'});
     add('설탕이 녹은 잔에 큐브 얼음을 넣는다.',[['얼음','ice'],['넣']],{phase:'ice'});ingredientStep(c.ingredients[0],'얼음이 담긴 잔');
     add('잔 안의 내용물을 가볍게 저어 섞는다.',[['저어','젓','스터','stir'],['잔','내용물']],{phase:'mix'});
     finish();
   }else if(c.number===38){
     add('씻어 물기를 뺀 생레몬 1/2개를 착즙해 준비한 잔에 넣는다.',[['레몬','lemon'],['착즙','짜']],{ingredient:'freshLemon',phase:'measure'});
     ingredientStep(c.ingredients[1],'레몬즙이 담긴 잔');
     add('레몬즙에 가루 설탕을 저어 녹인 뒤 큐브 얼음을 넣는다.',[['설탕'],['녹'],['얼음']],{phase:'ice'});
     ingredientStep(c.ingredients[2],'얼음이 담긴 잔','채우고 가볍게 젓는다');finish();
   }else{
     const shaken=c.method.startsWith('Shake'),stirred=c.method==='Stir',blended=c.method==='Blend';
     const vessel=shaken?'셰이커':stirred?'믹싱 글라스':blended?'블렌더':'준비한 잔';
     const late=c.ingredients.filter(x=>x.finish||x.amount==='Fill'||x.amount==='On Top'||c.number===36&&x.id==='sprite');
     const first=c.ingredients.filter(x=>!late.includes(x));
     if(blended)add('시험 시간 기준: 제출할 '+D.glasses[c.glass][0]+'에 얼음을 계량해 한 번 칠링한다.',[['잔','글라스','glass'],['얼음','ice'],['칠링','차게']],{phase:'chill'});
     if(!blended&&c.number!==30)add(vessel+'에 큐브 얼음을 넣어 차게 준비한다.',[[shaken?'셰이커':stirred?'믹싱':'잔',shaken?'쉐이커':stirred?'mixing':'글라스'],['얼음','ice']],{phase:'ice'});
     if(blended)add('칠링한 얼음을 제출 잔에서 바로 블렌더 통으로 옮긴다.',[['잔','글라스','glass'],['블렌더','blender'],['얼음','ice'],['옮','이동']],{phase:'ice'});
     for(const x of first)ingredientStep(x,blended?'얼음이 담긴 블렌더 통':vessel);
     if(shaken)add('뚜껑을 닫은 셰이커를 흔들어 내용물을 차게 섞는다.',[['흔들','셰이크','쉐이크','shake']],{phase:'mix'});
     else if(stirred)add('믹싱 글라스 안의 내용물을 바 스푼으로 저어 차게 섞는다.',[['믹싱','mixing'],['저어','젓','스터','stir']],{phase:'mix'});
     else if(blended)add('뚜껑을 닫은 블렌더를 작동해 재료와 얼음을 고르게 간다.',[['블렌더','blender'],['작동','간다','블렌딩','blend']],{phase:'mix'});
     if(shaken||stirred||blended){
       const iced=['collins','highball','pilsner','rocks'].includes(c.glass)&&!blended;
       if(iced)add('제출할 '+D.glasses[c.glass][0]+'에 새 큐브 얼음을 준비한다.',[['잔','글라스','glass'],['새','제출'],['얼음']],{phase:'servingIce'});
       const pour=blended?'내용물을 얼음과 함께':'혼합용 얼음을 걸러 내용물만';
       add(pour+' 준비한 '+D.glasses[c.glass][0]+'에 따른다.',[[blended?'함께':'걸러',blended?'통째':'스트레인',blended?'붓':'거른'],['잔','글라스','glass'],['따른','붓','담']],{phase:'pour'});
     }
     for(const x of late){
       const end=x.finish==='float'?'천천히 부어 층을 만들고 젓지 않는다':x.finish==='top'||x.amount==='On Top'?'마지막에 올린다':x.amount==='Fill'?'채운다':'붓고 가볍게 젓는다';
       ingredientStep(x,'내용물이 담긴 잔',end);
     }
     if(!shaken&&!stirred&&!blended&&c.method!=='Build/Float')add('잔 안의 내용물을 바 스푼으로 가볍게 저어 섞는다.',[['잔','내용물'],['저어','젓','섞']],{phase:'mix'});
     finish();
   }
   add('제출을 마친 뒤 사용한 기물을 세척·정리하고 제자리에 둔다. 종료 후 정리 시간은 3분 이내이다.',[['세척','씻'],['정리','제자리']],{phase:'cleanup'});
   return out;
   function finish(){
     if(c.garnish!=='none'&&c.garnish!=='salt')add('완성된 잔에 '+D.garnishes[c.garnish]+' 장식을 올린다.',[['장식','가니시','garnish'],['올','넣','꽂','뿌']],{phase:'garnish'});
     add('잔·용량·장식 상태를 확인하고 코스터에 올려 제출한다.',[['코스터','coaster'],['제출']],{phase:'submit'});
   }
 }
 function amountOptions(answer){return [...new Set(['1/4 oz','1/3 oz','1/2 oz','3/4 oz','1 oz','1 1/4 oz','1 1/2 oz','1 3/4 oz','2 oz','2 1/2 oz','3 oz','1/2 tsp','1 tsp','2 tsp','1 dash','1/3 part','1/2 ea','Fill','On Top',answer])].filter(x=>x&&!x.startsWith('원문'));}
 function stableOptions(answer,bank,key){
   const rest=[...new Set(bank)].filter(s=>s!==answer);
   let seed=Array.from(key).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
   const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   const sh=a=>{for(let i=a.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
   return sh([answer,...sh(rest).slice(0,3)]);
 }
 function fields(c){
   const list=[];
   for(const [i,x] of c.ingredients.entries()){
     list.push({key:'name-'+i,label:(i+1)+'번 재료',answer:D.ingredients[x.id][0],bank:Object.entries(D.ingredients).filter(([id])=>x.id!=='orangeLiqueur'||id!=='tripleSec').map(([,v])=>v[0]),section:'재료'});
     if(x.verified)list.push({key:'amount-'+i,label:(i+1)+'번 용량',answer:x.amount,bank:amountOptions(x.amount),section:'용량'});
   }
   list.push({key:'method',label:'조주법',answer:c.method,bank:[...new Set(D.cocktails.map(v=>v.method))],section:'기법'});
   list.push({key:'ice',label:'얼음 처리 · 학습 예시',answer:ice(c),bank:['완성 잔에 얼음 없음',c.method==='Blend'?ice(c):'분쇄 얼음과 블렌딩','혼합용 얼음을 걸러 제출','완성 잔에 큐브 얼음'],section:'얼음'});
   list.push({key:'garnish',label:'가니시',answer:D.garnishes[c.garnish],bank:Object.values(D.garnishes),section:'가니시'});
   return list;
 }
 function gradeFields(c,answers){return fields(c).map(f=>({key:f.key,label:f.label,expected:f.answer,actual:answers[f.key]||'미선택',ok:answers[f.key]===f.answer}));}
 function gradeIngredients(c,answers){
   const consumed=new Set();
   const rows=c.ingredients.map(x=>{const id=Object.hasOwn(answers,x.id)?x.id:x.id==='orangeLiqueur'&&Object.hasOwn(answers,'tripleSec')?'tripleSec':x.id;consumed.add(id);return {key:x.id,label:D.ingredients[x.id][0],expected:x.verified?x.amount:'선택 (용량 채점 제외)',actual:Object.hasOwn(answers,id)?answers[id]||'용량 미선택':'재료 미선택',ok:Object.hasOwn(answers,id)&&(!x.verified||answers[id]===x.amount)};});
   for(const id of Object.keys(answers))if(!consumed.has(id))rows.push({key:id,label:D.ingredients[id]?.[0]||id,expected:c.ingredients.some(x=>x.id==='orangeLiqueur')&&id==='tripleSec'?'쿠앵트로 또는 트리플 섹 중 하나만 사용':'사용하지 않음',actual:answers[id]||'선택함',ok:false});
   return rows;
 }
 function gradeOrder(c,picked){return steps(c).map((s,i)=>({key:String(i),label:(i+1)+'번째 작업',expected:s.text,actual:picked[i]===undefined?'미배치':steps(c)[picked[i]]?.text||'미배치',ok:picked[i]===i}));}
 function compareWriting(c,text){
   const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean),used=new Set();let last=-1;
   return steps(c).map((s,i)=>{
     const ix=lines.findIndex((line,n)=>!used.has(n)&&s.groups.every(group=>group.some(word=>norm(line).includes(norm(word)))));
     if(ix>=0)used.add(ix);
     const ordered=ix>last;if(ix>=0)last=Math.max(last,ix);
     return {key:String(i),label:(i+1)+'단계',expected:s.text,actual:ix<0?'키워드를 찾지 못했어요':(ix+1)+'번째 줄: '+lines[ix],ok:ix>=0&&ordered,found:ix>=0,ordered,keywords:s.groups.map(g=>g[0]).join(' · ')};
   });
 }
 const stages=['핵심 정리','재료·계량','레시피 빈칸','순서 맞히기','직접 쓰기','마지막 잔'];
 const defaults=()=>({version:1,examDate:'',selected:['jj-08','jj-29','jj-02'],progress:{},notes:{},wrong:{},history:[],session:null,lastMenu:'jj-08'});
 const dateValid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
 function sanitize(value){
   if(!value||value.version!==1)throw Error('지원하지 않는 학습 기록입니다.');
   const d=defaults(),ids=new Set(D.cocktails.map(c=>c.id));
   d.examDate=dateValid(value.examDate)?value.examDate:'';
   if(Array.isArray(value.selected)){const s=[...new Set(value.selected.filter(x=>ids.has(x)))].slice(0,5);if(s.length)d.selected=s;}
   d.lastMenu=ids.has(value.lastMenu)?value.lastMenu:d.lastMenu;
   for(const id of ids){
     const p=value.progress?.[id];if(p&&typeof p==='object')d.progress[id]=Object.fromEntries(Object.entries(p).filter(([k,v])=>/^\d$/.test(k)&&Number(k)<6&&v===true));
     if(typeof value.notes?.[id]==='string')d.notes[id]=value.notes[id].slice(0,10000);
   }
   if(value.wrong&&typeof value.wrong==='object')for(const [key,v] of Object.entries(value.wrong).slice(0,2000)){if(ids.has(v?.id)&&Number.isInteger(v.stage)&&v.stage>=1&&v.stage<=5&&typeof v.label==='string'&&typeof v.expected==='string')d.wrong[key]={id:v.id,stage:v.stage,label:v.label.slice(0,500),expected:v.expected.slice(0,2000),actual:String(v.actual||'').slice(0,2000),date:String(v.date||'').slice(0,30)};}
   if(Array.isArray(value.history))d.history=value.history.filter(v=>ids.has(v.id)&&Number.isInteger(v.stage)&&v.stage>=1&&v.stage<=5&&Number.isInteger(v.correct)&&Number.isInteger(v.total)&&v.correct>=0&&v.total>0&&v.correct<=v.total&&typeof v.date==='string').slice(0,300).map(v=>({id:v.id,stage:v.stage,correct:v.correct,total:v.total,date:v.date.slice(0,30)}));
   if(value.session&&Array.isArray(value.session.ids)){const ids2=[...new Set(value.session.ids.filter(x=>ids.has(x)))].slice(0,5);if(ids2.length)d.session={ids:ids2,index:Math.max(0,Math.min(ids2.length-1,Number(value.session.index)||0)),stage:Math.max(0,Math.min(5,Number(value.session.stage)||0)),done:Array.isArray(value.session.done)?value.session.done.filter(x=>ids2.includes(x)):[]};}
   return d;
 }
 const api={norm,shuffle,sample,ice,steps,keywords,amountOptions,stableOptions,fields,gradeFields,gradeIngredients,gradeOrder,compareWriting,stages,defaults,dateValid,sanitize};
 root.JojuCore=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
