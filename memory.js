(() => {
 'use strict';
 const D=JojuData,A=JojuArt,C=JojuMemoryCatalog,numbers=C.numbers,groups=C.groups;
 const recipes=numbers.map(n=>D.cocktails.find(c=>c.number===n));
 const byId=new Map(recipes.map(c=>[c.id,c]));
 const quiz=JojuMemoryQuiz.create(recipes);
 const drill=JojuMemoryDrill.create(recipes,groups);
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const qa=new URLSearchParams(location.search).has('qa'),query=qa?'?qa=1':'',key=qa?'joju-memory-qa-v1':'joju-memory-v1';
 const content=document.getElementById('memory-content'),status=document.getElementById('memory-status');
 let learned={},mode='overview',filter='all',deck=[],position=0,revealed=false,overviewGroup='all',cardGroup='all';
 function inGroup(c,id){return id==='all'||groups.find(g=>g.id===id)?.numbers.includes(c.number);}
 function cardRecipes(){return recipes.filter(c=>inGroup(c,cardGroup));}
 function cardCount(){return cardRecipes().filter(c=>learned[c.id]).length;}
 function groupOptions(value){return '<option value="all">전체 '+recipes.length+'종</option>'+groups.map(g=>'<option value="'+g.id+'" '+(value===g.id?'selected':'')+'>'+g.label+'</option>').join('');}
 function groupBar(){return '<nav class="memory-group-bar" aria-label="노트 분류"><span>오늘 볼 묶음</span>'+[{id:'all',label:'전체 '+recipes.length+'종'},...groups].map(g=>'<button data-overview-group="'+g.id+'" aria-pressed="'+(overviewGroup===g.id)+'">'+g.label+'</button>').join('')+'</nav>';}
 function storageWarning(){const p=document.getElementById('memory-storage-warning');p.hidden=false;p.textContent='암기 체크를 저장하거나 읽지 못했습니다. 현재 화면에서는 계속 연습할 수 있습니다.';}
 try{const stored=JSON.parse(localStorage.getItem(key)||'{}');if(stored&&typeof stored==='object')for(const c of recipes)if(stored[c.id]===true)learned[c.id]=true;}catch{storageWarning();}
 document.getElementById('brand-mark').innerHTML=A.logo();
 document.querySelectorAll('[data-home-link]').forEach(a=>{if(qa)a.setAttribute('href',a.getAttribute('href').replace('index.html#','index.html?qa=1#'));});
 function save(){try{localStorage.setItem(key,JSON.stringify(learned));}catch{storageWarning();}}
 function count(){return recipes.filter(c=>learned[c.id]).length;}
 function updateCount(){const total=count();document.getElementById('memory-count').innerHTML=total+'<small> / '+recipes.length+'</small>';document.getElementById('memory-remaining').textContent=total===recipes.length?'모든 메뉴를 체크했어요':(recipes.length-total)+'종 더 외워요';}
 function studyLink(c){return 'index.html'+query+'#study/'+c.id+'/0';}
 function ingredients(c){return '<ul class="memory-ingredients">'+c.ingredients.map(i=>'<li><span>'+esc(D.ingredients[i.id][0])+(i.finish==='top'?'<small>마지막에 넣기</small>':'')+'</span><b>'+esc(i.amount)+'</b></li>').join('')+'</ul>';}
 function specs(c){return '<dl class="memory-spec"><div><dt>조주법</dt><dd>'+esc(c.method)+'</dd></div><div><dt>잔</dt><dd>'+esc(D.glasses[c.glass][0])+'</dd></div><div><dt>가니시</dt><dd>'+esc(D.garnishes[c.garnish])+'</dd></div></dl>';}
 function art(c){return A.glass(c.glass,c.color,c.garnish,true,c.method!=='Blend');}
 function mnemonic(c,hint=false){
  const template=document.getElementById('mnemonic-'+c.id);
  if(!template)return '';
  if(!hint)return template.innerHTML;
  const chant=template.content.querySelector('.mnemonic-chant').textContent;
  return '<details class="memory-recall-hint"><summary>막히면 암기 힌트</summary><p>'+esc(chant)+'</p><small>줄임말을 풀어 말해 본 뒤, 답 보기로 용량·단위를 확인해요.</small></details>';
 }
 function overview(){
  const noteTemplates={'jj-02':'manhattan-note-template','jj-04':'old-fashioned-note-template','jj-11':'new-york-note-template','jj-10':'whiskey-sour-note-template','jj-40':'boulevardier-note-template','jj-09':'rusty-nail-note-template','jj-22':'sidecar-note-template','jj-05':'brandy-alexander-note-template','jj-28':'honeymoon-note-template'};
  Object.entries(C.notes).forEach(([id,name])=>noteTemplates[id]=name+'-note-template');
  const visibleRecipes=recipes.filter(c=>inGroup(c,overviewGroup));
  content.innerHTML='<div class="memory-overview"><div class="memory-intro"><div><h2>배운 만큼 쌓이는 칵테일 노트.</h2><p>기본은 또렷하게 · 덧붙인 필기는 꼬미체로</p></div><span class="memory-legend">기존 9종 + 논알코올·보드카·럼 13종</span></div>'+groupBar()+document.getElementById('common-prep-template').innerHTML+document.getElementById('memory-common-guide-template').innerHTML+document.getElementById('memory-mnemonics-guide-template').innerHTML+'<div class="memory-grid">'+visibleRecipes.map((c,i)=>'<article class="memory-recipe" aria-labelledby="recipe-'+c.id+'"><header class="memory-recipe-head"><div><span class="memory-number">'+String(numbers.indexOf(c.number)+1).padStart(2,'0')+' / '+esc(c.base)+'</span><h3 id="recipe-'+c.id+'">'+esc(c.name)+'</h3><p>'+esc(c.en)+'</p></div>'+art(c)+'</header><div class="memory-recipe-body">'+ingredients(c)+specs(c)+'<p class="memory-tip">'+esc(c.tip)+'</p>'+mnemonic(c)+'</div>'+(noteTemplates[c.id]?document.getElementById(noteTemplates[c.id]).innerHTML:'')+'<div class="memory-recipe-foot"><button class="memory-check" data-check="'+c.id+'" aria-pressed="'+!!learned[c.id]+'" aria-label="'+esc(c.name)+' 암기 체크">'+(learned[c.id]?'✓ 외웠어요':'○ 암기 체크')+'</button><a href="'+studyLink(c)+'">전체 순서 보기 ↗</a></div></article>').join('')+'</div></div>';
 }
 function startDeck(shuffle=false){deck=cardRecipes().filter(c=>filter==='all'||!learned[c.id]).map(c=>c.id);if(shuffle)for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}position=0;revealed=false;}
 function toolbar(){return '<div class="memory-card-toolbar"><label class="memory-group-label" for="memory-card-group">카드 분류<select id="memory-card-group">'+groupOptions(cardGroup)+'</select></label><div class="memory-filters" aria-label="암기 카드 범위"><button data-filter="all" aria-pressed="'+(filter==='all')+'">이 묶음 전체 ('+cardRecipes().length+')</button><button data-filter="review" aria-pressed="'+(filter==='review')+'">아직 못 외운 메뉴 <span>('+(cardRecipes().length-cardCount())+')</span></button></div><div class="memory-card-tools"><select id="memory-jump" aria-label="암기 카드 바로가기" '+(!deck.length||position>=deck.length?'disabled':'')+'>'+deck.map((id,i)=>'<option value="'+i+'" '+(position===i?'selected':'')+'>'+esc(byId.get(id).name)+'</option>').join('')+'</select><button data-action="shuffle">순서 섞기 ↻</button></div></div>';}
 function flash(){
  let body;
  if(position>=deck.length){const all=cardCount()===cardRecipes().length;body='<div class="memory-flash"><div class="memory-round-end"><div class="eyebrow">'+(deck.length?'ROUND COMPLETE':'ALL CHECKED')+'</div><h2>'+(deck.length?'이번 묶음을 마쳤어요.':'이 묶음을 모두 체크했어요.')+'</h2><p>현재 '+cardCount()+' / '+cardRecipes().length+'종을 외웠다고 표시했어요.<br>'+(all?'순서를 섞어 다시 떠올려 보세요.':'아직 못 외운 '+(cardRecipes().length-cardCount())+'종을 한 번 더 연습해 보세요.')+'</p><div class="row"><button class="primary" data-action="retry">'+(all?'이 묶음 다시 외우기':'아직 못 외운 메뉴 복습')+'</button><a href="#overview">요약으로 돌아가기</a></div></div></div>';}
  else{const c=byId.get(deck[position]);body='<article class="memory-flash" aria-labelledby="flash-title"><div class="memory-flash-top"><span>카드 '+(position+1)+' / '+deck.length+'</span><span class="memory-pill">'+(learned[c.id]?'✓ 외웠다고 표시한 메뉴':'기억을 꺼내 보세요')+'</span></div><div class="memory-flash-title"><h2 id="flash-title">'+esc(c.name)+'</h2><p>'+esc(c.en)+'</p></div><div class="memory-question" '+(revealed?'hidden':'')+'><p>레시피를 소리 내어 말하거나 적어 보세요.<br>다 떠올렸다면 답을 확인해요.</p><div class="memory-question-tags"><span>재료 · 용량</span><span>조주법</span><span>잔</span><span>가니시</span></div>'+mnemonic(c,true)+'<button class="primary" data-action="reveal" aria-expanded="false" aria-controls="memory-answer">답 보기</button></div><div id="memory-answer" class="memory-answer" '+(!revealed?'hidden':'')+'><div class="memory-answer-title"><h3>기억한 내용과 비교해 보세요</h3><button data-action="hide" class="text-button">답 다시 가리기</button></div><div class="memory-answer-content"><div>'+ingredients(c)+specs(c)+'</div><div class="memory-answer-art">'+art(c)+'<a href="'+studyLink(c)+'">전체 순서 보기 ↗</a></div></div><p class="memory-tip">'+esc(c.tip)+'</p>'+mnemonic(c)+'<div class="memory-grade"><button data-grade="review">다시 보기</button><button data-grade="learned" class="remembered">외웠어요 ✓</button></div></div></article><div class="memory-navigation"><button data-action="previous" '+(position===0?'disabled':'')+'>← 이전 카드</button><p>직접 확인하는 암기 체크예요. 자동 채점하지 않습니다.</p><button data-action="next">'+(position===deck.length-1?'이번 묶음 마치기':'건너뛰기 →')+'</button></div>';}
  content.innerHTML=toolbar()+body;
 }
 function render(){updateCount();if(mode==='cards')flash();else if(mode==='quiz')quiz.render(content);else if(mode==='drill')drill.render(content);else overview();}
 function focus(selector){document.querySelector(selector)?.focus({preventScroll:true});}
 function route(){mode=location.hash==='#drill'?'drill':location.hash==='#quiz'?'quiz':location.hash==='#cards'?'cards':'overview';for(const name of ['overview','cards','quiz','drill']){const a=document.getElementById('mode-'+name);a.classList.toggle('active',mode===name);if(mode===name)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}if(mode==='cards')startDeck();render();}
 content.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||!content.contains(b))return;
  if(b.dataset.overviewGroup){overviewGroup=b.dataset.overviewGroup;render();focus('[data-overview-group="'+overviewGroup+'"]');return;}
  if(b.dataset.check){const id=b.dataset.check;if(!byId.has(id))return;learned[id]=!learned[id];save();render();focus('[data-check="'+id+'"]');status.textContent=byId.get(id).name+(learned[id]?' 외웠어요.':' 암기 체크를 해제했어요.');return;}
  if(b.dataset.filter){filter=b.dataset.filter;startDeck();render();focus('[data-filter="'+filter+'"]');return;}
  if(b.dataset.grade&&revealed&&position<deck.length){const id=deck[position];learned[id]=b.dataset.grade==='learned';save();status.textContent=byId.get(id).name+(learned[id]?' 외웠어요.':' 다시 복습할 메뉴에 남겼어요.');position++;revealed=false;render();focus(position<deck.length?'[data-action="reveal"]':'[data-action="retry"]');return;}
  const action=b.dataset.action;
  if(action==='shuffle'){startDeck(true);render();focus('[data-action="shuffle"]');}
  else if(action==='retry'){filter=cardCount()===cardRecipes().length?'all':'review';startDeck();render();focus('[data-action="reveal"]');}
  else if(action==='reveal'||action==='hide'){revealed=action==='reveal';render();focus(revealed?'[data-action="hide"]':'[data-action="reveal"]');}
  else if(action==='next'||action==='previous'){position=Math.max(0,Math.min(deck.length,position+(action==='next'?1:-1)));revealed=false;render();focus(position<deck.length?'[data-action="reveal"]':'[data-action="retry"]');}
 });
 content.addEventListener('toggle',event=>{const details=event.target;if(!details.matches('.recipe-note-details'))return;requestAnimationFrame(()=>{if(details.isConnected)details.querySelector('summary').scrollIntoView({block:details.open?'start':'nearest'});});},true);
 content.addEventListener('change',event=>{if(event.target.id==='memory-card-group'){cardGroup=event.target.value;startDeck();render();focus('#memory-card-group');return;}if(event.target.id==='memory-jump'){const n=Number(event.target.value);if(Number.isInteger(n)&&n>=0&&n<deck.length){position=n;revealed=false;render();focus('#memory-jump');}}});
 window.addEventListener('hashchange',route);route();
})();
