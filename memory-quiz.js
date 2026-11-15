(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./data.js'),require('./quiz-review.js'));
 else root.JojuMemoryQuiz=factory(root.JojuData,root.JojuReview);
})(typeof globalThis!=='undefined'?globalThis:this,function(D,R){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const normalizeName=s=>String(s??'').normalize('NFKD').replace(/\p{M}/gu,'').normalize('NFC').toLowerCase().replace(/[\s.,·()\-_'’]/g,'');
 const aliases={
  gamhongro:['감홍로'],jindo:['진도 홍주','홍주'],andong:['안동소주','안동 소주'],insam:['금산 인삼주','인삼주'],bokbunja:['선운산 복분자주','복분자주'],
  tequila:['데킬라','테킬라'],
  orangeLiqueur:['쿠앵트로','코앵트로','코인트로','트리플 섹','트리플섹','cointreau','triple sec'],
  bourbon:['버번','버본','버본 위스키','bourbon'],
  sweetVermouth:['스위트 버무스','스위트 버무트','스윗 베르무트','스윗 버무스','sweet vermouth'],
  bitters:['앙고스투라 비터','앙고스투라','비터스','angostura','bitters'],
  sugar:['설탕','파우더 슈거','sugar','powdered sugar'],
  soda:['소다','탄산수','클럽 소다','soda','club soda'],
  lime:['라임주스','라임 쥬스'],lemon:['레몬주스','레몬 쥬스'],
  grenadine:['그레나딘','그레나딘 시럽','그레나딘시럽','grenadine'],
  scotch:['스카치','스카치 위스키','scotch','scotch whisky'],
  drambuie:['드램뷔','드람부이'],
  tripleSec:['트리플섹','트리플 쎅','트리플 세크'],
  cacaoBrown:['크림 드 카카오 브라운','카카오 브라운','브라운 카카오','brown creme de cacao'],
  milk:['우유','밀크','라이트 우유','milk'],
  appleBrandy:['애플브랜디','사과 브랜디','apple brandy'],
  benedictine:['베네딕틴','베네딕틴 디오엠','베네딕틴 D.O.M.','benedictine','benedictine d.o.m.'],
  freshLemon:['생레몬','레몬','생레몬즙','착즙 레몬'],
  coffee:['커피 리큐르','깔루아','칼루아','kahlua'],
  gingerAle:['진저에일','진저 에일','ginger ale'],
  rum:['라이트럼','화이트럼','화이트 럼','white rum'],
  bacardi:['바카디','바카디 럼','바카디 화이트 럼','bacardi white rum'],
  applePucker:['애플푸커','애플 푸커','사워 애플 리큐르','sour apple liqueur'],
  blueCuracao:['블루큐라소','블루 퀴라소','블루퀴라소'],
  coconutRum:['코코넛 럼','말리부','malibu'],
  pinaMix:['피나콜라다 믹스','피나 콜라다 믹스']
 };
 function matchesIngredient(value,id){const name=normalizeName(value);if(!name||!D.ingredients[id])return false;return [...D.ingredients[id].slice(0,2),...(aliases[id]||[])].some(s=>normalizeName(s)===name);}
 function parseAmount(value){
  const fractions={'¼':'1/4','½':'1/2','¾':'3/4','⅓':'1/3','⅔':'2/3','⅛':'1/8','⅜':'3/8','⅝':'5/8','⅞':'7/8'};
  const text=String(value??'').trim().replace(/(\d)([¼½¾⅓⅔⅛⅜⅝⅞])/g,'$1 $2').replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g,x=>fractions[x]).normalize('NFKC').replace(/⁄/g,'/').toLowerCase().replace(/^반\s*개$/,'1/2 개');
  if(/^(fill|채우기|채움|잔\s*채우기)$/i.test(text))return {number:1,unit:'fill'};
  if(/^(on\s*top|온\s*톱|온\s*탑)$/i.test(text))return {number:1,unit:'top'};
  const match=text.match(/^(.+?)\s*(oz\.?|온스|tsp\.?|티스푼|dash(?:es)?|대시|대쉬|ea\.?|개|parts?|파트)$/);
  if(!match)return null;
  const unit=/^(oz\.?|온스)$/.test(match[2])?'oz':/^(tsp\.?|티스푼)$/.test(match[2])?'tsp':/^(ea\.?|개)$/.test(match[2])?'ea':/^(parts?|파트)$/.test(match[2])?'part':'dash';
  const n=match[1].trim();let number;
  let parts=n.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if(parts){if(Number(parts[3])===0)return null;number=Number(parts[1])+Number(parts[2])/Number(parts[3]);}
  else if((parts=n.match(/^(\d+)\s*\/\s*(\d+)$/))){if(Number(parts[2])===0)return null;number=Number(parts[1])/Number(parts[2]);}
  else if(/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(n))number=Number(n);
  else return null;
  return Number.isFinite(number)&&number>0?{number,unit}:null;
 }
 function matchesAmount(actual,expected){const a=parseAmount(actual),b=parseAmount(expected);return !!(a&&b&&a.unit===b.unit&&Math.abs(a.number-b.number)<1e-9);}
 function grade(recipe,answers){
  const expected=recipe.ingredients,used=new Set();
  const rows=expected.map((_,i)=>({ingredient:String(answers[i]?.ingredient??''),amount:String(answers[i]?.amount??''),match:-1}));
  // Pair complete matches first so a duplicate wrong amount cannot steal a valid pair.
  for(const exact of [true,false])for(const row of rows){if(row.match!==-1)continue;const j=expected.findIndex((item,i)=>!used.has(i)&&matchesIngredient(row.ingredient,item.id)&&(!exact||item.verified===false||matchesAmount(row.amount,item.amount)));if(j!==-1){row.match=j;used.add(j);}}
  const missing=expected.map((_,i)=>i).filter(i=>!used.has(i));let missingIndex=0;
  const result=rows.map(row=>{
   const ingredientOK=row.match!==-1,j=ingredientOK?row.match:missing[missingIndex++],item=expected[j];
   const duplicate=!ingredientOK&&expected.some(x=>matchesIngredient(row.ingredient,x.id));
   return {ingredient:row.ingredient,amount:row.amount,ingredientOK,amountOK:item.verified===false?null:ingredientOK&&matchesAmount(row.amount,item.amount),amountSkipped:item.verified===false,duplicate,expectedIngredient:D.ingredients[item.id][0],expectedAmount:item.amount,expectedId:item.id};
  });
  const correct=result.reduce((n,r)=>n+Number(r.ingredientOK)+Number(r.amountOK),0);
  const total=expected.length+expected.filter(i=>i.verified!==false).length;
  return {rows:result,correct,total,passed:correct===total};
 }
 function create(recipes){
  let host=null,index=0;const drafts=new Map();
  function draft(){const c=recipes[index];if(!drafts.has(c.id))drafts.set(c.id,{answers:c.ingredients.map(()=>({ingredient:'',amount:''})),result:null});return drafts.get(c.id);}
  function solved(){return recipes.filter(c=>drafts.get(c.id)?.result?.passed).length;}
  function feedback(row,field){if(field==='ingredient')return row.ingredientOK?'✓ 재료 정답':(row.duplicate?'✕ 중복 재료':'✕ '+(row.ingredient.trim()?'다른 재료예요':'미입력'))+' · 정답: '+row.expectedIngredient;if(row.amountSkipped)return '감홍로 용량은 원문 표기 확인 전까지 채점하지 않아요. 재료 이름은 채점합니다.';return row.amountOK?'✓ 용량 정답':(row.ingredientOK?'✕ 용량 확인':'↳ 위 정답 재료의 용량')+' · 정답: '+row.expectedAmount;}
  function resultMarkup(r){if(!r)return '';return '<h3>'+(r.passed?'모두 정답이에요!':r.correct+' / '+r.total+'칸 정답')+'</h3><p>'+(r.passed?'재료와 용량을 모두 맞혔어요. 다음 메뉴도 떠올려 보세요.':'아래에서 내 답을 고친 내용과 전체 레시피를 함께 확인해 보세요.')+'</p>'+R.fill(recipes[index],r);}
  function render(container){
   if(host!==container){host=container;host.addEventListener('submit',onSubmit);host.addEventListener('input',onInput);host.addEventListener('click',onClick);host.addEventListener('change',onChange);}
   const c=recipes[index],d=draft(),r=d.result;
   host.innerHTML='<div class="mq-toolbar"><div><label for="mq-menu">퀴즈 메뉴</label><select id="mq-menu">'+recipes.map((item,i)=>'<option value="'+i+'" '+(index===i?'selected':'')+'>'+esc(item.name)+'</option>').join('')+'</select></div><span id="mq-progress">이번 연습 정답 <b>'+solved()+' / '+recipes.length+'</b></span></div><section class="mq-sheet" aria-labelledby="mq-title"><header class="mq-header"><div><span class="eyebrow">WRITE & REMEMBER · '+(index+1)+' / '+recipes.length+'</span><h2 id="mq-title">'+esc(c.name)+'</h2><p>'+esc(c.en)+'</p></div><span class="mq-count">재료 '+c.ingredients.length+'개</span></header><p class="mq-instruction" id="mq-instruction">각 줄에 <b>재료 이름과 그 재료의 용량</b>을 함께 적어 주세요. 재료 순서는 자유예요.</p><form id="mq-form" autocomplete="off" aria-describedby="mq-instruction mq-help"><div class="mq-rows">'+d.answers.map((a,i)=>'<div class="mq-row"><span class="mq-number" aria-hidden="true">'+(i+1)+'</span>'+['ingredient','amount'].map(field=>{const skip=field==='amount'&&r?.rows[i].amountSkipped,ok=r?.rows[i][field==='ingredient'?'ingredientOK':'amountOK'];return '<div class="mq-field"><label for="mq-'+field+'-'+i+'">'+(i+1)+'번 '+(field==='ingredient'?'재료':'용량')+'</label><input id="mq-'+field+'-'+i+'" name="'+field+'-'+i+'" data-mq-row="'+i+'" data-mq-field="'+field+'" type="text" maxlength="120" spellcheck="false" autocapitalize="off" placeholder="'+(field==='ingredient'?'재료 이름':'숫자 + 단위')+'" value="'+esc(a[field])+'" '+(r?'class="'+(skip?'mq-neutral':ok?'mq-correct':'mq-wrong')+'" aria-invalid="'+(!skip&&!ok)+'" ':'')+'aria-describedby="mq-feedback-'+field+'-'+i+'"><p class="mq-feedback '+(r?(skip?'mq-neutral':ok?'mq-good':'mq-bad'):'')+'" id="mq-feedback-'+field+'-'+i+'">'+(r?esc(feedback(r.rows[i],field)):'')+'</p></div>';}).join('')+'</div>').join('')+'</div><p class="mq-help" id="mq-help">용량은 단위까지 적어 주세요. <b>1 1/2 oz = 1.5 oz = 1½ 온스</b>처럼 같은 값은 인정합니다. 생레몬은 <b>1/2 ea = 반 개</b>, 채우기는 <b>Fill</b>로 적어요. Fill을 80%나 고정 oz로 바꾸지는 않습니다. <b>1/3 part</b>는 비율이고, <b>On Top</b>은 마지막에 얹기입니다. 힐링의 감홍로 용량은 원문 표기가 불명확해 그 한 칸만 채점에서 제외합니다. 한글·영문 재료명과 띄어쓰기 차이도 허용해요. 중복 재료는 한 번만 인정합니다.</p><div class="mq-actions"><button type="button" data-mq-action="reset">이 메뉴 다시 풀기</button><button type="submit" class="primary" id="mq-submit">'+(r?'다시 채점':'정답 확인')+'</button></div><div id="mq-result" class="mq-result '+(r?.passed?'mq-success':'')+'" role="status" tabindex="-1" '+(!r?'hidden':'')+'>'+resultMarkup(r)+'</div></form></section><div class="mq-navigation"><button data-mq-action="previous" '+(index===0?'disabled':'')+'>← 이전 메뉴</button><p>퀴즈 입력·결과는 새로고침하면 초기화됩니다.<br>‘외웠어요’ 체크와 실기 진도는 바뀌지 않아요.</p><button data-mq-action="next">'+(index===recipes.length-1?'첫 메뉴로 ↺':'다음 메뉴 →')+'</button></div>';
  }
  function onInput(event){const el=event.target;if(!el.matches('#mq-form input[data-mq-field]'))return;const i=Number(el.dataset.mqRow),field=el.dataset.mqField,d=draft();if(!d.answers[i]||!['ingredient','amount'].includes(field))return;d.answers[i][field]=el.value;if(d.result){d.result=null;host.querySelectorAll('#mq-form input').forEach(input=>{input.classList.remove('mq-correct','mq-wrong');input.removeAttribute('aria-invalid');});host.querySelectorAll('.mq-feedback').forEach(p=>{p.textContent='';p.className='mq-feedback';});host.querySelector('#mq-result').hidden=true;host.querySelector('#mq-submit').textContent='정답 확인';host.querySelector('#mq-progress').innerHTML='이번 연습 정답 <b>'+solved()+' / '+recipes.length+'</b>';}}
  function onSubmit(event){if(event.target.id!=='mq-form')return;event.preventDefault();const d=draft();d.result=grade(recipes[index],d.answers);render(host);host.querySelector('#mq-result').focus({preventScroll:true});host.querySelector('#mq-result').scrollIntoView({block:'nearest',behavior:'instant'});}
  function move(next){index=next;render(host);host.querySelector('#mq-title').scrollIntoView({block:'nearest',behavior:'instant'});host.querySelector('#mq-ingredient-0').focus({preventScroll:true});}
  function onClick(event){const button=event.target.closest('[data-mq-action]');if(!button||!host.contains(button))return;const action=button.dataset.mqAction;if(action==='reset'){drafts.delete(recipes[index].id);render(host);host.querySelector('#mq-ingredient-0').focus({preventScroll:true});}else if(action==='next')move((index+1)%recipes.length);else if(action==='previous'&&index>0)move(index-1);}
  function onChange(event){if(event.target.id==='mq-menu'){const next=Number(event.target.value);if(Number.isInteger(next)&&next>=0&&next<recipes.length)move(next);}}
  return {render};
 }
 return {matchesIngredient,parseAmount,matchesAmount,grade,create};
});

/* Name recognition uses the same forty photographs as the catalog. */
(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const shuffled=(items,random=Math.random)=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
 function create(recipes,random=Math.random){
  let deck=[],index=0,answer='',options=[],score=0,wrong=[],round='all';
  function prepare(){answer='';const c=deck[index];options=c?shuffled([c,...shuffled(recipes.filter(x=>x.id!==c.id),random).slice(0,3)],random):[];}
  function start(onlyWrong=false){const pool=onlyWrong?recipes.filter(c=>wrong.includes(c.id)):recipes;deck=shuffled(pool.length?pool:recipes,random);index=0;score=0;wrong=[];round=onlyWrong?'틀린 사진 다시 보기':'전체 40종';prepare();}
  function choose(id){if(answer||!options.some(c=>c.id===id))return false;answer=id;if(id===deck[index].id)score++;else wrong.push(deck[index].id);return true;}
  function next(){if(!answer)return false;index++;prepare();return true;}
  function render(host){
   const c=deck[index],R=root.JojuReview;
   if(!c){host.innerHTML='<section class="photo-name-quiz photo-quiz-end"><h2>사진 퀴즈 완료</h2><p><strong>'+score+' / '+deck.length+'</strong>개 맞혔어요.</p><div class="row"><button data-photo-action="restart">전체 다시 풀기</button>'+(wrong.length?'<button class="primary" data-photo-action="retry">틀린 '+wrong.length+'종 다시 풀기</button>':'')+'<a href="#recipes">레시피·필기 보기</a></div></section>';return;}
   const picture=root.JojuArt.cocktail(c).replace(/\b(alt|title)="[^"]*"/g,(_,attr)=>attr+'="'+(answer?esc(c.name):'이름을 맞힐 칵테일 사진')+'"');
   host.innerHTML='<section class="photo-name-quiz"><div class="photo-quiz-heading"><div><h2>사진 퀴즈</h2><p>'+round+' · '+(index+1)+' / '+deck.length+' · 정답 '+score+'개</p></div><button data-photo-action="restart">처음부터</button></div><div class="photo-quiz-question"><div class="photo-quiz-image">'+picture+'</div><div class="photo-quiz-prompt"><h3>사진 속 칵테일의 이름은?</h3><div class="photo-quiz-options">'+options.map((x,i)=>'<button data-photo-choice="'+x.id+'" '+(answer?'disabled ':'')+'class="'+(answer?(x.id===c.id?'is-correct':x.id===answer?'is-wrong':''):'')+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(x.name)+(answer&&x.id===c.id?' <b>정답</b>':answer&&x.id===answer?' <b>내 답</b>':'')+'</button>').join('')+'</div></div></div>'+(answer?'<section class="photo-quiz-feedback" aria-live="polite"><h3>'+(answer===c.id?'정답이에요.':'다시 기억해 보세요.')+' '+esc(c.name)+' <small>'+esc(c.en)+'</small></h3>'+(answer!==c.id?'<p>내 답: <del>'+esc(recipes.find(x=>x.id===answer).name)+'</del> → <strong>'+esc(c.name)+'</strong></p>':'')+R.recipe(c,{hideTitle:true})+'<div class="qr-review">'+R.study(c,{nearby:false})+'</div>'+'<div class="photo-quiz-footer"><a href="#recipe/'+c.id+'">만드는 순서·필기 보기 →</a><button class="primary" data-photo-action="next">'+(index+1===deck.length?'결과 보기':'다음 사진 →')+'</button></div></section>':'')+'</section>';
  }
  function handle(event,host){const b=event.target.closest('button');if(!b||!host.contains(b))return false;let changed=false;if(b.dataset.photoChoice)changed=choose(b.dataset.photoChoice);else if(b.dataset.photoAction==='next')changed=next();else if(['restart','retry'].includes(b.dataset.photoAction)){start(b.dataset.photoAction==='retry');changed=true;}if(changed){render(host);const target=host.querySelector(answer?'.photo-quiz-feedback':'.photo-name-quiz');target?.scrollIntoView({block:'nearest'});host.querySelector(answer?'[data-photo-action="next"]':'[data-photo-choice]')?.focus({preventScroll:true});}return changed;}
  start();return {start,choose,next,render,handle,snapshot:()=>({deck:deck.map(c=>c.id),index,answer,options:options.map(c=>c.id),score,wrong:[...wrong]})};
 }
 root.JojuPhotoQuiz={create};
})(typeof globalThis!=='undefined'?globalThis:this);
