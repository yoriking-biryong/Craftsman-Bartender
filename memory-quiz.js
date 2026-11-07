(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./data.js'));
 else root.JojuMemoryQuiz=factory(root.JojuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const normalizeName=s=>String(s??'').normalize('NFKD').replace(/\p{M}/gu,'').normalize('NFC').toLowerCase().replace(/[\s.,·()\-_'’]/g,'');
 const aliases={
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
  const match=text.match(/^(.+?)\s*(oz\.?|온스|tsp\.?|티스푼|dash(?:es)?|대시|대쉬|ea\.?|개)$/);
  if(!match)return null;
  const unit=/^(oz\.?|온스)$/.test(match[2])?'oz':/^(tsp\.?|티스푼)$/.test(match[2])?'tsp':/^(ea\.?|개)$/.test(match[2])?'ea':'dash';
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
  for(const exact of [true,false])for(const row of rows){if(row.match!==-1)continue;const j=expected.findIndex((item,i)=>!used.has(i)&&matchesIngredient(row.ingredient,item.id)&&(!exact||matchesAmount(row.amount,item.amount)));if(j!==-1){row.match=j;used.add(j);}}
  const missing=expected.map((_,i)=>i).filter(i=>!used.has(i));let missingIndex=0;
  const result=rows.map(row=>{
   const ingredientOK=row.match!==-1,j=ingredientOK?row.match:missing[missingIndex++],item=expected[j];
   const duplicate=!ingredientOK&&expected.some(x=>matchesIngredient(row.ingredient,x.id));
   return {ingredient:row.ingredient,amount:row.amount,ingredientOK,amountOK:ingredientOK&&matchesAmount(row.amount,item.amount),duplicate,expectedIngredient:D.ingredients[item.id][0],expectedAmount:item.amount,expectedId:item.id};
  });
  const correct=result.reduce((n,r)=>n+Number(r.ingredientOK)+Number(r.amountOK),0);
  return {rows:result,correct,total:expected.length*2,passed:correct===expected.length*2};
 }
 function create(recipes){
  let host=null,index=0;const drafts=new Map();
  function draft(){const c=recipes[index];if(!drafts.has(c.id))drafts.set(c.id,{answers:c.ingredients.map(()=>({ingredient:'',amount:''})),result:null});return drafts.get(c.id);}
  function solved(){return recipes.filter(c=>drafts.get(c.id)?.result?.passed).length;}
  function feedback(row,field){if(field==='ingredient')return row.ingredientOK?'✓ 재료 정답':(row.duplicate?'✕ 중복 재료':'✕ '+(row.ingredient.trim()?'다른 재료예요':'미입력'))+' · 정답: '+row.expectedIngredient;return row.amountOK?'✓ 용량 정답':(row.ingredientOK?'✕ 용량 확인':'↳ 위 정답 재료의 용량')+' · 정답: '+row.expectedAmount;}
  function resultMarkup(r){if(!r)return '';return '<h3>'+(r.passed?'모두 정답이에요!':r.correct+' / '+r.total+'칸 정답')+'</h3><p>'+(r.passed?'재료와 용량을 모두 맞혔어요. 다음 메뉴도 떠올려 보세요.':'각 칸 아래의 정답을 확인하고 수정한 뒤 다시 채점해 보세요.')+'</p>';}
  function render(container){
   if(host!==container){host=container;host.addEventListener('submit',onSubmit);host.addEventListener('input',onInput);host.addEventListener('click',onClick);host.addEventListener('change',onChange);}
   const c=recipes[index],d=draft(),r=d.result;
   host.innerHTML='<div class="mq-toolbar"><div><label for="mq-menu">퀴즈 메뉴</label><select id="mq-menu">'+recipes.map((item,i)=>'<option value="'+i+'" '+(index===i?'selected':'')+'>'+esc(item.name)+'</option>').join('')+'</select></div><span id="mq-progress">이번 연습 정답 <b>'+solved()+' / '+recipes.length+'</b></span></div><section class="mq-sheet" aria-labelledby="mq-title"><header class="mq-header"><div><span class="eyebrow">WRITE & REMEMBER · '+(index+1)+' / '+recipes.length+'</span><h2 id="mq-title">'+esc(c.name)+'</h2><p>'+esc(c.en)+'</p></div><span class="mq-count">재료 '+c.ingredients.length+'개</span></header><p class="mq-instruction" id="mq-instruction">각 줄에 <b>재료 이름과 그 재료의 용량</b>을 함께 적어 주세요. 재료 순서는 자유예요.</p><form id="mq-form" autocomplete="off" aria-describedby="mq-instruction mq-help"><div class="mq-rows">'+d.answers.map((a,i)=>'<div class="mq-row"><span class="mq-number" aria-hidden="true">'+(i+1)+'</span>'+['ingredient','amount'].map(field=>{const ok=r?.rows[i][field==='ingredient'?'ingredientOK':'amountOK'];return '<div class="mq-field"><label for="mq-'+field+'-'+i+'">'+(i+1)+'번 '+(field==='ingredient'?'재료':'용량')+'</label><input id="mq-'+field+'-'+i+'" name="'+field+'-'+i+'" data-mq-row="'+i+'" data-mq-field="'+field+'" type="text" maxlength="120" spellcheck="false" autocapitalize="off" placeholder="'+(field==='ingredient'?'재료 이름':'숫자 + 단위')+'" value="'+esc(a[field])+'" '+(r?'class="'+(ok?'mq-correct':'mq-wrong')+'" aria-invalid="'+!ok+'" ':'')+'aria-describedby="mq-feedback-'+field+'-'+i+'"><p class="mq-feedback '+(r?(ok?'mq-good':'mq-bad'):'')+'" id="mq-feedback-'+field+'-'+i+'">'+(r?esc(feedback(r.rows[i],field)):'')+'</p></div>';}).join('')+'</div>').join('')+'</div><p class="mq-help" id="mq-help">용량은 단위까지 적어 주세요. <b>1 1/2 oz = 1.5 oz = 1½ 온스</b>처럼 같은 값은 인정합니다. 생레몬은 <b>1/2 ea = 반 개</b>, 채우기는 <b>Fill</b>로 적어요. Fill을 80%나 고정 oz로 바꾸지는 않습니다. 한글·영문 재료명과 띄어쓰기 차이도 허용해요. 중복 재료는 한 번만 인정합니다.</p><div class="mq-actions"><button type="button" data-mq-action="reset">이 메뉴 다시 풀기</button><button type="submit" class="primary" id="mq-submit">'+(r?'다시 채점':'정답 확인')+'</button></div><div id="mq-result" class="mq-result '+(r?.passed?'mq-success':'')+'" role="status" tabindex="-1" '+(!r?'hidden':'')+'>'+resultMarkup(r)+'</div></form></section><div class="mq-navigation"><button data-mq-action="previous" '+(index===0?'disabled':'')+'>← 이전 메뉴</button><p>퀴즈 입력·결과는 새로고침하면 초기화됩니다.<br>‘외웠어요’ 체크와 실기 진도는 바뀌지 않아요.</p><button data-mq-action="next">'+(index===recipes.length-1?'첫 메뉴로 ↺':'다음 메뉴 →')+'</button></div>';
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
