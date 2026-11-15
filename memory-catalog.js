(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.JojuMemoryCatalog=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const groups=[
  {id:'whisky',label:'위스키 6종',numbers:[2,4,9,10,11,40]},
  {id:'brandy',label:'브랜디 3종',numbers:[5,22,28]},
  {id:'zero',label:'논알코올 2종',numbers:[38,39]},
  {id:'vodka',label:'보드카 5종',numbers:[7,26,18,25,19]},
  {id:'rum',label:'럼 6종',numbers:[24,29,23,16,12,15]},
  {id:'tequila',label:'데킬라 2종',numbers:[31,8]},
  {id:'gin',label:'진 5종',numbers:[3,20,6,21,37]},
  {id:'liqueur',label:'리큐르 3종',numbers:[27,17,14]},
  {id:'wine',label:'와인 1종',numbers:[30]}
 ];
 const numbers=groups.flatMap(g=>g.numbers);
 const garnishComponents={
  orangeCherry:['orangeSlice','cherry'],lemonCherry:['lemonSlice','cherry'],
  pineappleCherry:['pineappleWedge','cherry'],maiTai:['pineappleWedge','cherry'],
  citrusWedge:['limeWedge','lemonWedge'],citrusTwist:['limeTwist','lemonTwist'],
  citrusSlice:['limeSlice','lemonSlice']
 };
 const garnishNames={orangeSlice:'오렌지 슬라이스',pineappleWedge:'생파인애플 웨지',limeWedge:'라임 웨지',limeTwist:'라임 껍질 트위스트',limeSlice:'라임 슬라이스'};
 function garnishParts(id){return garnishComponents[id]||[id];}
 function garnishMatches(candidate,selected){const wanted=garnishParts(selected);return garnishParts(candidate).some(id=>wanted.includes(id));}
 const categories=[{id:'type',label:'종류'},{id:'method',label:'기법'},{id:'glass',label:'잔'},{id:'ingredient',label:'재료'},{id:'garnish',label:'가니시'},{id:'ice',label:'얼음'}];
 const iceLabels={with:'얼음과 함께 제공',cubes:'각얼음과 함께 제공',blended:'갈린 얼음과 함께 제공',none:'얼음 없이 제공'};
 // 조주용 얼음이 아닌, 완성된 음료의 제공 상태. 기존 실기 판정의 잔 기준과 동일하다.
 function iceService(c){return c.method==='Blend'?'blended':['rocks','highball','pilsner','collins'].includes(c.glass)?'cubes':'none';}
 function matches(c,kind,value){
  if(kind==='ice')return value==='with'?iceService(c)!=='none':iceService(c)===value;
  if(kind==='ingredient')return c.ingredients.some(i=>i.id===value);
  if(kind==='garnish')return garnishMatches(c.garnish,value);
  if(kind==='method')return c.method.split('/').includes(value);
  return kind==='glass'&&c.glass===value;
 }
 function facetLabel(D,kind,value){return kind==='ice'?iceLabels[value]:kind==='ingredient'?D.ingredients[value]?.[0]:kind==='glass'?D.glasses[value]?.[0]:kind==='garnish'?garnishParts(value).map(id=>D.garnishes[id]||garnishNames[id]||id).join(' / '):kind==='method'?value:'';}
 function facetOptions(D,kind){
  const recipes=D.cocktails;
  const values=kind==='ice'?Object.keys(iceLabels):kind==='ingredient'?Object.keys(D.ingredients):kind==='glass'?Object.keys(D.glasses):kind==='garnish'?[...new Set(recipes.flatMap(c=>garnishParts(c.garnish)))]:kind==='method'?[...new Set(recipes.flatMap(c=>c.method.split('/')))]:[];
  return values.map(value=>({value,label:facetLabel(D,kind,value),count:recipes.filter(c=>matches(c,kind,value)).length})).filter(o=>o.count>0);
 }
 function validFacet(D,kind,value){return kind==='garnish'?!!(D.garnishes[value]||garnishNames[value]):facetOptions(D,kind).some(o=>o.value===value);}
 const notes={'jj-21':'long-island','jj-37':'gin-fizz','jj-27':'apricot','jj-17':'grasshopper','jj-14':'june-bug','jj-30':'kir','jj-03':'dry-martini','jj-20':'negroni','jj-06':'singapore-sling','jj-31':'tequila-sunrise','jj-08':'margarita','jj-38':'lemon-squash','jj-39':'virgin-punch','jj-07':'black-russian','jj-26':'moscow-mule','jj-18':'seabreeze','jj-25':'cosmopolitan','jj-19':'apple-martini','jj-24':'pina-colada','jj-29':'blue-hawaiian','jj-23':'mai-tai','jj-16':'cuba-libre','jj-12':'daiquiri','jj-15':'bacardi'};
 return {groups,numbers,notes,garnishNames,garnishParts,garnishMatches,categories,iceLabels,iceService,matches,facetLabel,facetOptions,validFacet};
});
