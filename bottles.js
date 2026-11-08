/* Bottle photographs are study references; recipe data and grading stay separate. */
(function(root){
 'use strict';
 const B=root.JojuBottleData,D=root.JojuData;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function photo(id,extra=''){
  const b=B[id];
  return b?'<img class="bottle-photo '+extra+'" src="'+esc(b.src)+'" width="'+b.width+'" height="'+b.height+'" alt="'+esc(b.product)+' 병" loading="lazy" decoding="async">':'';
 }
 function tile(id,full=false){
  const b=B[id],d=D.ingredients[id];
  return '<button type="button" class="bottle-tile" data-bottle="'+id+'" aria-label="'+esc(b.product)+' 병 사진 크게 보기">'+photo(id)+'<span class="bottle-ingredient">'+esc(d[0])+'</span><small>'+esc(b.product)+'</small>'+(full?'<span class="bottle-category">'+esc(d[2])+'</span>':'')+'</button>';
 }
 function strip(c){
  const ids=c.ingredients.map(i=>i.id).filter(id=>B[id]);
  if(!ids.length)return '';
  return '<section class="bottle-strip" aria-label="'+esc(c.name)+'에 쓰는 술병"><div class="bottle-strip-heading"><b>술병으로 기억하기</b><span>사진을 누르면 크게 보여요</span></div><div class="bottle-row">'+ids.map(id=>tile(id)).join('')+'</div><p class="bottle-caption">제품 사진 예시 · 병 모양보다 재료명과 라벨을 함께 확인해요.</p></section>';
 }
 root.JojuBottles={photo,strip};
 let viewer,opener;
 function show(id,button){
  const b=B[id];if(!b)return;
  if(!viewer){
   viewer=document.createElement('dialog');viewer.className='bottle-viewer';viewer.setAttribute('aria-labelledby','bottle-viewer-title');
   document.body.append(viewer);
   viewer.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
   viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.closest('[data-bottle-close]'))viewer.close();});
  }
  const menus=D.cocktails.filter(c=>c.ingredients.some(i=>i.id===id));
  const qa=new URLSearchParams(location.search).has('qa')?'?qa=1':'';
  opener=button;
  viewer.innerHTML='<div class="bottle-viewer-inner"><button type="button" class="bottle-close" data-bottle-close aria-label="병 사진 닫기" autofocus>닫기 ×</button><div class="bottle-large">'+photo(id)+'</div><div class="bottle-description"><span class="eyebrow">'+esc(D.ingredients[id][2])+'</span><h2 id="bottle-viewer-title">'+esc(b.product)+'</h2><p class="bottle-recipe-name">레시피 재료명: <b>'+esc(D.ingredients[id][0])+'</b></p><p class="bottle-english">'+esc(D.ingredients[id][1])+'</p><p>'+esc(b.note)+'</p><h3>이 술이 들어가는 칵테일</h3><div class="bottle-uses">'+menus.map(c=>'<a href="index.html'+qa+'#study/'+c.id+'/0">'+esc(c.name)+'</a>').join('')+'</div><p class="bottle-caption">병 디자인은 유통 지역·시기에 따라 달라질 수 있어요. 사진은 시험장 지급 제품을 보장하지 않습니다.</p><div class="bottle-source-links"><a href="'+esc(b.page)+'" target="_blank" rel="noopener noreferrer">제품·사진 출처 ↗</a><a href="'+esc(b.src)+'" download>PNG 저장 ↓</a></div></div></div>';
  viewer.showModal();
 }
 document.addEventListener('click',e=>{const button=e.target.closest('[data-bottle]');if(button)show(button.dataset.bottle,button);});
 const gallery=document.getElementById('bottle-gallery');
 if(gallery){
  document.getElementById('brand-mark').innerHTML=root.JojuArt.logo();
  const search=document.getElementById('bottle-search'),category=document.getElementById('bottle-category');
  const categories=['위스키','브랜디','진','보드카','테킬라','럼','와인','비터스','리큐르','전통주'];
  const ids=Object.keys(B).sort((a,b)=>categories.indexOf(D.ingredients[a][2])-categories.indexOf(D.ingredients[b][2])||D.ingredients[a][0].localeCompare(D.ingredients[b][0],'ko'));
  category.innerHTML='<option value="">모든 종류</option>'+[...new Set(ids.map(id=>D.ingredients[id][2]))].map(t=>'<option>'+esc(t)+'</option>').join('');
  function render(){
   const q=search.value.trim().toLowerCase().replace(/\s/g,'');
   const matches=ids.filter(id=>(!category.value||D.ingredients[id][2]===category.value)&&(!q||(D.ingredients[id].slice(0,3).join(' ')+B[id].product+B[id].note+D.cocktails.filter(c=>c.ingredients.some(i=>i.id===id)).map(c=>c.name).join(' ')).toLowerCase().replace(/\s/g,'').includes(q)));
   document.getElementById('bottle-count').textContent=matches.length+'종 / 전체 '+ids.length+'종';
   gallery.innerHTML=matches.length?matches.map(id=>tile(id,true)).join(''):'<p class="bottle-empty">일치하는 술이 없어요. 재료명이나 칵테일 이름으로 다시 찾아보세요.</p>';
  }
  search.addEventListener('input',render);category.addEventListener('change',render);
  document.getElementById('bottle-reset').addEventListener('click',()=>{search.value='';category.value='';render();search.focus();});
  render();
 }
})(globalThis);
