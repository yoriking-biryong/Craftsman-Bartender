(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./data.js'));
 else root.JojuMemoryDrill=factory(root.JojuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
 'use strict';
 const kinds={ingredients:'재료 고르기',reverse:'재료로 메뉴 찾기',order:'순서 배치',amount:'용량 맞히기',method:'기법 고르기',glass:'잔 고르기',garnish:'가니시 고르기'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function shuffle(items,rng=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
 function sequence(c){
  const stages=[],add=(...items)=>stages.push(items.map(([id,label])=>({id,label}))),ing=id=>['i-'+id,D.ingredients[id][0]+' 계량해 넣기'];
  if(c.number===4){
   add(['prepare','가니시 준비 · 칠링한 잔의 얼음과 물 비우기']);
   add(ing('sugar'));add(ing('bitters'));add(ing('soda'));
   add(['dissolve','스푼으로 설탕 녹이기']);add(['ice','잔에 얼음 넣기']);add(ing('bourbon'));
   add(['mix','가볍게 저어 섞기']);add(['finish','코스터로 옮기고 오렌지 슬라이스·체리 얹기']);
  }else if(c.number===9){
   add(['prepare','올드 패션드 잔에 얼음 준비']);add(ing('scotch'));add(ing('drambuie'));
   add(['mix','잔에서 바스푼으로 저어 섞기']);add(['finish','가니시 없이 코스터에 제출']);
  }else if(c.number===38){
   add(['prepare','하이볼 잔 칠링 · 레몬 슬라이스 준비']);
   add(['glass','칠링 얼음과 물 비우기']);add(['i-freshLemon','생레몬 반 개를 짜서 씨를 걸러 넣기']);add(ing('sugar'));
   add(['dissolve','레몬즙과 설탕을 섞어 녹이기']);add(['ice','서비스용 얼음 넣기']);add(['i-soda','차가운 소다 워터로 Fill']);
   add(['mix','탄산을 과하게 날리지 않도록 가볍게 섞기']);add(['finish','코스터로 옮기고 레몬 슬라이스 걸기']);
  }else if(c.method==='Build'){
   add(['prepare',D.glasses[c.glass][0]+' 칠링 · 도구와 가니시 준비']);add(['ice','잔의 녹은 물을 비우고 서비스용 얼음 준비']);
   add(ing(c.ingredients[0].id));
   const early=c.ingredients.slice(1).filter(i=>i.amount!=='Fill');if(early.length)add(...early.map(i=>ing(i.id)));
   for(const i of c.ingredients.filter(i=>i.amount==='Fill'))add(['i-'+i.id,'차가운 '+D.ingredients[i.id][0]+'로 Fill']);
   add(['mix','제공 잔에서 가볍게 저어 섞기']);add(['finish',c.garnish==='none'?'가니시 없이 코스터에 제출':'코스터로 옮기고 '+D.garnishes[c.garnish]+' 올리기']);
  }else if(c.method==='Blend'){
   add(['prepare','필스너 잔·블렌더·가니시 준비']);
   add(['glass','필스너 잔에 얼음을 계량해 한 번 칠링하기']);add(['ice','칠링한 얼음을 바로 블렌더 통으로 옮기기']);
   const blendIng=id=>['i-'+id,D.ingredients[id][0]+' 계량해 얼음이 담긴 블렌더 통에 넣기'];
   if(c.number===39)add(...c.ingredients.map(i=>blendIng(i.id)));
   else{add(blendIng(c.ingredients[0].id));add(...c.ingredients.slice(1).map(i=>blendIng(i.id)));}
   add(['mix','재료를 모두 넣은 뒤 뚜껑을 닫고 블렌딩']);
   add(['pour','블렌딩한 내용물을 필스너 잔에 담기']);add(['finish','코스터로 옮기고 '+D.garnishes[c.garnish]+' 올리기']);
  }else{
   const stir=c.method==='Stir',rocks=c.glass==='rocks',vessel=stir?'믹싱 글라스':'셰이커';
   add(['prepare',D.glasses[c.glass][0]+'·도구·가니시 준비']);
   add(['ice',vessel+'에 얼음 준비'+(stir?' · 녹은 물 비우기':'')]);
   const early=c.ingredients.filter(i=>!i.finish);
   // Base first, then interchangeable secondary ingredients; late soda is a separate stage.
   add(ing(early[0].id));add(...early.slice(1).map(i=>ing(i.id)));
   const shake=c.number===5?'뚜껑을 닫고 하드 셰이킹 · 수업 기준':[22,28].includes(c.number)?'뚜껑을 닫고 소프트 셰이킹 · 수업 기준':'뚜껑을 닫고 셰이킹';
   add(['mix',stir?'바스푼으로 스터링':shake]);
   add(['glass',rocks?'제공 잔의 녹은 물 비우고 서비스용 얼음 준비':'제공 잔의 칠링 얼음과 물 비우기']);
   add(['pour',c.number===5?'작은 스트레이너를 받쳐 칵테일 잔에 거르기 · 수업 기준':'혼합용 얼음을 걸러 '+D.glasses[c.glass][0]+'에 따르기']);
   for(const i of c.ingredients.filter(i=>i.finish))add(['i-'+i.id,D.ingredients[i.id][0]+'를 마지막에 계량해 얹기 · 젓지 않기']);
   add(['finish',c.garnish==='none'?'가니시 없이 코스터에 제출':c.garnish==='nutmeg'?'넛메그 가루로 장식해 코스터에 제출':'코스터로 옮기고 '+D.garnishes[c.garnish]+' 올리기']);
  }
  const choices=stages.flat(),edges=[];
  for(let i=0;i<stages.length-1;i++)for(const a of stages[i])for(const b of stages[i+1])edges.push([a.id,b.id]);
  return {choices,edges,correct:choices.map(x=>x.id)};
 }
 function buildBank(recipes){
  const bank=[],allIds=[...new Set(recipes.flatMap(c=>c.ingredients.map(i=>i.id)))];
  const choice=id=>({id,label:D.ingredients[id][0]});
  for(const c of recipes){
   const common={recipeIds:[c.id],recipeId:c.id};
   const ids=c.ingredients.map(i=>i.id);
   bank.push({...common,id:c.id+'-ingredients',kind:'ingredients',prompt:c.name+'에 들어가는 재료를 모두 골라 주세요.',help:'복수 선택 · 빠짐없이 고르고, 들어가지 않는 재료는 제외해요.',choices:[...ids,...allIds.filter(id=>!ids.includes(id))].map(choice),correct:ids,explanation:c.ingredients.map(i=>D.ingredients[i.id][0]+' '+i.amount).join(' · ')});
   for(const i of c.ingredients){
    const options=[...new Set([i.amount,'1/4 oz','1/2 oz','3/4 oz','1 oz','1 1/2 oz','1/2 tsp','1 tsp','1 dash'])];
    bank.push({...common,id:c.id+'-amount-'+i.id,kind:'amount',prompt:c.name+'의 '+D.ingredients[i.id][0]+'는 얼마나 필요할까요?',help:'하나 선택 · 숫자와 단위를 함께 확인하세요.',choices:options.map(x=>({id:x,label:x})),correct:[i.amount],explanation:D.ingredients[i.id][0]+' '+i.amount+(i.finish==='top'?' · 마지막에 따로 넣습니다.':'')});
   }
   for(const [kind,value,options] of [['method',c.method,['Build','Stir','Shake','Shake/Build','Blend','Float']],['glass',c.glass,[...new Set(['cocktail','rocks','sour','saucer','flute','highball',c.glass])]],['garnish',c.garnish,[...new Set(recipes.map(x=>x.garnish))]]]){
    const label=id=>kind==='glass'?D.glasses[id][0]:kind==='garnish'?D.garnishes[id]:id;
    bank.push({...common,id:c.id+'-'+kind,kind,prompt:c.name+'의 '+({method:'기법',glass:'잔',garnish:'가니시'})[kind]+'를 골라 주세요.',help:'하나 선택 · 이 연습장의 시험 레시피 기준입니다.',choices:options.map(id=>({id,label:label(id)})),correct:[value],explanation:c.name+' · '+label(value)});
   }
   bank.push({...common,id:c.id+'-order',kind:'order',prompt:c.name+' 만들기 순서를 배치해 주세요.',help:c.number===39?'시험 시간 기준: 필스너 잔에 얼음을 계량해 한 번 칠링 → 바로 블렌더 통으로 옮기기 → 주스·시럽 넣기 → 블렌딩. 주스·시럽끼리는 순서가 자유예요.':c.method==='Blend'?'시험 시간 기준: 필스너 잔에 얼음을 계량해 한 번 칠링 → 바로 블렌더 통으로 옮기기 → 기주·부재료 넣기 → 블렌딩. 같은 단계의 부재료 순서는 자유예요.':c.number===38?'레몬즙과 설탕을 섞은 뒤 얼음·소다를 넣는 수업 연습 순서예요.':c.number===4?'작업을 순서대로 누르세요. 이 메뉴는 설탕을 먼저 녹인 뒤 얼음과 버번을 넣어요.':'작업을 순서대로 누르세요. 기주를 먼저 넣은 뒤, 같은 단계의 부재료끼리는 순서를 바꿔도 인정해요.',...sequence(c),explanation:c.number===38?'생레몬 반 개 → 설탕 2 tsp → 녹이기 → 얼음 → 소다 Fill → 가볍게 섞기 → 레몬 슬라이스.':c.method==='Blend'?'시험 시간 기준: 필스너 잔에 얼음 계량·한 번 칠링 → 바로 블렌더 통으로 얼음 옮기기 → 통에 재료 계량해 넣기 → 뚜껑 닫고 블렌딩 → 같은 잔에 담기 → 가니시. 버진 펀치는 과즙·시럽끼리 순서를 바꿔도 됩니다.':c.method==='Build'&&c.number!==4&&c.number!==9?'차가운 잔에 얼음 → 기주와 부재료 → 탄산은 마지막 → 잔에서 가볍게 섞기 → 코스터·장식.':c.number===4?'설탕을 먼저 녹인 뒤 얼음과 버번을 넣습니다.':c.number===10?'소다는 셰이킹하지 않고, 거른 다음 마지막에 넣습니다.':c.number===9?'얼음이 든 잔에 스카치 → 드람뷔 → 가볍게 젓기. 가니시는 없습니다.':'준비 → 계량 → 혼합 → 거르기 → 마무리. 혼합 전 부재료끼리의 순서는 바꿔도 됩니다.'});
  }
  for(const id of allIds){
   const matching=recipes.filter(c=>c.ingredients.some(i=>i.id===id));
   bank.push({id:'reverse-'+id,kind:'reverse',recipeIds:matching.map(c=>c.id),prompt:D.ingredients[id][0]+'가 들어가는 칵테일은 무엇일까요?',help:'복수 선택 · 선택한 연습 메뉴와 관계없이, 아래 '+recipes.length+'종 전체에서 모두 골라요.',choices:recipes.map(c=>({id:c.id,label:c.name})),correct:matching.map(c=>c.id),explanation:D.ingredients[id][0]+' → '+matching.map(c=>c.name).join(', ')});
  }
  // Additional practice from the three brandy class notes; personal taste and brands are not graded.
  const note=(recipeId,key,kind,prompt,options,correct,explanation,help)=>{
   if(!recipes.some(c=>c.id===recipeId))return;
   bank.push({id:recipeId+'-note-'+key,recipeIds:[recipeId],recipeId,kind,prompt,
    help:help||(['ingredients','reverse'].includes(kind)?'복수 선택 · 질문에서 묻는 재료를 모두 골라요.':'하나 선택 · 질문의 기준을 확인하세요.'),
    choices:options.map(([id,label])=>({id,label})),correct,explanation});
  };
  const strengths=[['soft','소프트 셰이킹'],['hard','하드 셰이킹'],['stir','스터링'],['build','빌드']];
  const ingredientOptions=ids=>ids.map(id=>[id,D.ingredients[id][0]]);
  for(const [id,name,answer] of [['jj-22','사이드카','soft'],['jj-05','브랜디 알렉산더','hard'],['jj-28','허니문','soft']]){
   note(id,'shake','method','수업에서 배운 '+name+'의 셰이킹 강도는?',strengths,[answer],
    '수업 기준: 사이드카·허니문은 소프트, 유제품을 섞는 브랜디 알렉산더는 하드 셰이킹. 공식 레시피의 기법은 셋 다 Shake입니다.','하나 선택 · 공식 기법명이 아닌 수업에서 배운 강도입니다.');
  }
  note('jj-22','spirits','ingredients','사이드카에 들어가는 두 가지 술을 골라 주세요.',ingredientOptions(['brandy','tripleSec','appleBrandy','benedictine','cacaoBrown']),['brandy','tripleSec'],'브랜디 1 oz + 트리플 섹 1 oz. 여기에 레몬 주스 1/4 oz를 더합니다.');
  note('jj-22','lemon-pair','amount','사이드카 → 허니문 순으로, 레몬 주스의 용량은?',[
   ['quarter-half','1/4 oz → 1/2 oz'],['half-quarter','1/2 oz → 1/4 oz'],['half-half','1/2 oz → 1/2 oz'],['quarter-quarter','1/4 oz → 1/4 oz']
  ],['quarter-half'],'사이드카의 레몬 주스는 1/4 oz, 허니문은 1/2 oz. 사이드카의 작은 용량을 구분해요.');
  note('jj-22','finish','method','사이드카를 셰이킹한 다음, 수업에서 배운 마무리는?',[
   ['empty-strain','칠링 얼음·물 비우기 → 스트레이너를 잡고 따르기'],['keep-ice','칠링 얼음을 그대로 둔 잔에 따르기'],['pour-first','먼저 따른 뒤 칠링 얼음과 함께 버리기'],['soda','탄산수 1 oz를 얹어 마무리하기']
  ],['empty-strain'],'칵테일 잔의 칠링 얼음과 물을 비운 뒤 혼합용 얼음을 걸러 따릅니다. 사이드카에는 소다와 가니시가 없습니다.','하나 선택 · 수업의 실습 순서를 떠올리세요.');
  note('jj-05','cacao','ingredients','브랜디 알렉산더에 쓸 카카오 리큐르를 골라 주세요.',ingredientOptions(['cacaoBrown','cacaoWhite','tripleSec','benedictine']),['cacaoBrown'],'크렘 드 카카오 브라운(B)을 사용합니다. 화이트와 구분하세요.','재료 선택 · 맞는 카카오 리큐르 하나를 고르세요.');
  note('jj-05','equal','amount','브랜디 알렉산더의 1 : 1 : 1, 세 재료는 각각 얼마일까요?',[
   ['3/4 oz','각 3/4 oz'],['1/4 oz','각 1/4 oz'],['1/2 oz','각 1/2 oz'],['1 oz','각 1 oz']
  ],['3/4 oz'],'브랜디 · 크렘 드 카카오 브라운 · 밀크를 각각 3/4 oz씩 계량합니다.');
  note('jj-05','nutmeg','garnish','수업에서 배운 브랜디 알렉산더의 넛메그 장식 방법은?',[
   ['pinch','가루를 씹히지 않도록 살짝 · 한 꼬집'],['whole','육두구 씨앗을 통째로 넣기'],['spoon','가루를 수북하게 1 tsp 넣기'],['shake','넛메그를 주재료와 함께 셰이킹하기']
  ],['pinch'],'수업 메모의 1 pinch는 한 꼬집. 거른 뒤 가루를 살짝 올립니다. 공식 표는 넛메그 장식이며 별도 용량을 지정하지 않습니다.','하나 선택 · 한 꼬집은 수업 메모의 양입니다.');
  note('jj-28','base','ingredients','허니문의 기주로 골라야 하는 브랜디는?',ingredientOptions(['appleBrandy','brandy','bourbon','scotch']),['appleBrandy'],'허니문은 애플 브랜디 3/4 oz. 사이드카·브랜디 알렉산더의 브랜디와 구분합니다.','재료 선택 · 기주 하나를 고르세요.');
  note('jj-28','liqueurs','ingredients','허니문에 들어가는 두 가지 리큐르를 골라 주세요.',ingredientOptions(['benedictine','tripleSec','cacaoBrown','drambuie','campari']),['benedictine','tripleSec'],'베네딕틴 DOM 3/4 oz + 트리플 섹 1/4 oz. 드람뷔나 꿀은 들어가지 않습니다.');
  note('jj-28','equal','amount','허니문의 애플 브랜디와 베네딕틴 DOM은 각각 얼마일까요?',[
   ['3/4 oz','둘 다 3/4 oz'],['1/4 oz','둘 다 1/4 oz'],['1/2 oz','둘 다 1/2 oz'],['1 oz','둘 다 1 oz']
  ],['3/4 oz'],'애플 브랜디와 베네딕틴 DOM은 각 3/4 oz. 트리플 섹 1/4 oz, 레몬 주스 1/2 oz를 더합니다.');
  note('jj-38','fill','amount','프레시 레몬 스쿼시의 소다 워터, 공식 표의 용량 표기는?',[
   ['Fill','Fill · 채우기'],['80%','반드시 잔의 80%'],['100 ml','100 mL'],['1 oz','1 oz']
  ],['Fill'],'정답은 Fill. 약 80%는 수업의 여유 공간 메모이며, 공식 표에 고정 비율이나 mL가 제시된 것은 아닙니다.');
  note('jj-39','juices','ingredients','버진 프루트 펀치에 들어가는 과즙 다섯 가지를 모두 골라 주세요.',ingredientOptions(['orange','pineapple','cranberry','grapefruit','lemon','lime']),['orange','pineapple','cranberry','grapefruit','lemon'],'라임은 제외. 이 다섯 과즙에 그레나딘 시럽을 더해 총 6재료입니다.');
  note('jj-07','pair','method','블랙 러시안을 러스티 네일과 묶어 외울 때, 공통 기법은?',[
   ['Build','Build · 제공 잔에서 만들기'],['Shake','Shake · 셰이커에서 흔들기'],['Stir','Stir · 믹싱 글라스에서 젓고 거르기'],['Blend','Blend · 블렌더로 갈기']
  ],['Build'],'둘 다 Build, 올드 패션드 잔, 두 재료, 가니시 없음. 기주는 블랙 러시안=보드카 / 러스티 네일=스카치입니다.');
  note('jj-26','garnish-pair','garnish','모스코 뮬 → 쿠바 리브레 순서로, 가니시 모양은?',[
   ['slice-wedge','슬라이스 → 웨지'],['wedge-slice','웨지 → 슬라이스'],['twist-wedge','껍질 트위스트 → 웨지'],['wedge-wedge','웨지 → 웨지']
  ],['slice-wedge'],'모스코 뮬은 라임 또는 레몬 슬라이스, 쿠바 리브레는 레몬 웨지입니다.');
  note('jj-18','juice-pair','amount','시브리즈의 크랜베리 → 자몽 주스 용량은?',[
   ['3-half','3 oz → 1/2 oz'],['half-3','1/2 oz → 3 oz'],['1-half','1 oz → 1/2 oz'],['3-1','3 oz → 1 oz']
  ],['3-half'],'크랜베리 3 oz, 자몽 1/2 oz. 기주 보드카는 1 1/2 oz입니다.');
  note('jj-25','red','ingredients','코스모폴리탄의 붉은색을 내는 재료를 골라 주세요.',ingredientOptions(['cranberry','grenadine','campari','sweetVermouth']),['cranberry'],'크랜베리 주스 1/2 oz. 뉴욕의 그레나딘 1/2 tsp와 구분하세요.','재료 선택 · 하나를 고르세요.');
  note('jj-19','liqueur','ingredients','애플 마티니에 실제로 넣는 리큐르는?',ingredientOptions(['applePucker','sweetVermouth','tripleSec','cacaoWhite']),['applePucker'],'사워 애플 리큐르 1 oz. 이름에 마티니가 있어도 베르무트를 넣지 않습니다.','재료 선택 · 하나를 고르세요.');
  note('jj-24','mix','ingredients','피나 콜라다에서 2 oz 넣는 흰색 믹스는?',ingredientOptions(['pinaMix','coconutRum','milk','sweetSour']),['pinaMix'],'피나 콜라다 믹스 2 oz. 코코넛 럼이나 우유로 대체하지 않습니다.','재료 선택 · 하나를 고르세요.');
  note('jj-29','three-spirits','ingredients','블루 하와이안에서 각각 1 oz 들어가는 술 세 가지는?',ingredientOptions(['rum','blueCuracao','coconutRum','vodka','tripleSec']),['rum','blueCuracao','coconutRum'],'라이트 럼·블루 큐라소·코코넛 럼 각 1 oz. 파인애플 주스 2 1/2 oz를 더하며 라임은 없습니다.');
  note('jj-23','pharaoh','ingredients','마이 타이의 암기법 ‘파라오’에 해당하는 과즙을 모두 골라 주세요.',ingredientOptions(['pineapple','lime','orange','lemon','cranberry','grapefruit']),['pineapple','lime','orange'],'파인애플·라임·오렌지 주스, 각각 1 oz입니다.');
  note('jj-16','fill','ingredients','쿠바 리브레에서 마지막에 Fill 하는 재료는?',ingredientOptions(['cola','gingerAle','soda','cranberry']),['cola'],'콜라로 Fill. 모스코 뮬의 진저 에일과 구분하세요.','재료 선택 · 하나를 고르세요.');
  note('jj-12','sweetener','ingredients','다이키리에서 단맛을 위해 1 tsp 넣는 재료는?',ingredientOptions(['sugar','grenadine','tripleSec','pinaMix']),['sugar'],'다이키리는 가루 설탕 1 tsp. 바카디 칵테일은 그레나딘 시럽 1 tsp입니다.','재료 선택 · 하나를 고르세요.');
  note('jj-15','brand','ingredients','바카디 칵테일의 공식 표에 지정된 기주는?',ingredientOptions(['bacardi','rum','coconutRum','vodka']),['bacardi'],'Bacardi Rum White 1 3/4 oz로 지정되어 있습니다. 일반 라이트 럼이라는 답으로 대체하지 않습니다.','재료 선택 · 지정 브랜드까지 확인해 하나를 고르세요.');
  return bank;
 }
 function grade(q,answer){
  const picked=Array.isArray(answer)?answer:[],unique=new Set(picked),valid=unique.size===picked.length&&picked.every(id=>q.choices.some(c=>c.id===id));
  if(q.kind==='order'){
   const complete=valid&&picked.length===q.choices.length;
   const violations=complete?q.edges.filter(([a,b])=>picked.indexOf(a)>picked.indexOf(b)):[];
   return {passed:complete&&!violations.length,complete,violations};
  }
  return {passed:valid&&picked.length===q.correct.length&&q.correct.every(id=>unique.has(id)),missing:q.correct.filter(id=>!unique.has(id)),extra:picked.filter(id=>!q.correct.includes(id))};
 }
 function makeRound(bank,recipes,settings,rng=Math.random){
  const pool=bank.filter(q=>(settings.kind==='mixed'||q.kind===settings.kind)&&(settings.menu==='all'||q.recipeIds.includes(settings.menu)));
  const count=settings.count==='all'?pool.length:Math.min(Number(settings.count)||18,pool.length);
  if(settings.kind!=='mixed'||settings.menu!=='all')return shuffle(pool,rng).slice(0,count);
  const chosen=[],keys=shuffle(Object.keys(kinds),rng);
  // Even short mixed rounds revisit every selected cocktail before filling remaining slots.
  for(const [i,c] of shuffle(recipes,rng).entries()){
   if(chosen.length===count)break;
   const candidates=pool.filter(q=>q.recipeIds.includes(c.id)&&q.kind===keys[i%keys.length]&&!chosen.includes(q));
   const fallback=pool.filter(q=>q.recipeIds.includes(c.id)&&!chosen.includes(q));
   const q=shuffle(candidates.length?candidates:fallback,rng)[0];if(q)chosen.push(q);
  }
  for(const kind of keys){
   if(chosen.length===count)break;
   if(!chosen.some(q=>q.kind===kind)){const q=shuffle(pool.filter(q=>q.kind===kind&&!chosen.includes(q)),rng)[0];if(q)chosen.push(q);}
  }
  return shuffle([...chosen,...shuffle(pool.filter(q=>!chosen.includes(q)),rng).slice(0,count-chosen.length)],rng);
 }
 function create(recipes,groups=[]){
  let host=null,settings={group:'all',kind:'mixed',menu:'all',count:'18'},session=null,screen='setup';
  const scopedRecipes=()=>settings.group==='all'?recipes:recipes.filter(c=>groups.find(g=>g.id===settings.group)?.numbers.includes(c.number));
  let bank=buildBank(recipes),byId=new Map(bank.map(q=>[q.id,q]));
  function refreshBank(){bank=buildBank(scopedRecipes());byId=new Map(bank.map(q=>[q.id,q]));}
  const label=(q,id)=>q.choices.find(c=>c.id===id)?.label||id;
  const answerText=q=>q.correct.map(id=>label(q,id)).join(q.kind==='order'?' → ':' · ');
  function moveFocus(selector){const el=host.querySelector(selector);if(el){el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'});}}
  function start(questions,review=false){
   session={review,index:0,items:questions.map(q=>{
    let choices=q.choices;
    if(q.kind==='ingredients')choices=[...q.choices.filter(x=>q.correct.includes(x.id)),...shuffle(q.choices.filter(x=>!q.correct.includes(x.id))).slice(0,4)];
    if(q.kind==='amount')choices=[...q.choices.filter(x=>q.correct.includes(x.id)),...shuffle(q.choices.filter(x=>!q.correct.includes(x.id))).slice(0,3)];
    return {id:q.id,choices:shuffle(choices),answer:[],result:null};
   })};screen='question';render(host);moveFocus('#md-title');
  }
  function setup(){
   return '<section class="md-sheet md-setup" aria-labelledby="md-title"><div class="md-eyebrow">MIX & REMEMBER</div><h2 id="md-title" tabindex="-1">다르게 물어봐도, 떠오르도록.</h2><p class="md-lead">재료를 고르고, 메뉴를 찾고, 만드는 순서를 꺼내 보세요.<br>'+scopedRecipes().length+'종에서 만든 <b>'+bank.length+'개 문제</b>를 골고루 섞어 연습해요.</p><div class="md-kind-grid">'+Object.entries(kinds).map(([id,title],i)=>'<div><span>0'+(i+1)+'</span><b>'+title+'</b></div>').join('')+'</div><div class="md-settings">'+(groups.length?'<label for="md-group">메뉴 묶음<select id="md-group"><option value="all">전체 '+recipes.length+'종</option>'+groups.map(g=>'<option value="'+g.id+'" '+(settings.group===g.id?'selected':'')+'>'+g.label+'</option>').join('')+'</select></label>':'')+'<label for="md-kind">문제 유형<select id="md-kind"><option value="mixed">모든 유형 섞기</option>'+Object.entries(kinds).map(([id,title])=>'<option value="'+id+'" '+(settings.kind===id?'selected':'')+'>'+title+'</option>').join('')+'</select></label><label for="md-menu">연습 메뉴<select id="md-menu"><option value="all">이 묶음 전체</option>'+scopedRecipes().map(c=>'<option value="'+c.id+'" '+(settings.menu===c.id?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select></label><label for="md-count">문제 수<select id="md-count">'+[['9','9문제'],['18','18문제'],...(recipes.length>18?[[String(recipes.length),recipes.length+'문제']]:[]),['all','해당 문제 모두']].map(([v,t])=>'<option value="'+v+'" '+(settings.count===v?'selected':'')+'>'+t+'</option>').join('')+'</select></label></div><div class="md-actions"><p>틀린 문제는 결과 화면에서 다시 풀어요.</p><button class="primary" data-md-action="start">연습 시작 →</button></div><details class="md-guide"><summary>채점 기준과 연습 기록</summary><p>재료·용량·잔·기법·가니시는 기존 2026년 레시피 기준입니다. 순서는 수업 필기와 연습장의 조주 흐름으로 구성한 연습 예시이며 공식 시험의 세부 채점표는 아닙니다. 메뉴 묶음을 고르면 재료로 메뉴 찾기도 그 묶음 안에서 출제합니다. 기주를 먼저 계량한 뒤 같은 단계의 부재료 순서는 바꿀 수 있어요. 논알코올 펀치는 과즙·시럽 순서를 자유롭게 배치합니다. Blend 4종은 시험 시간 기준으로 필스너 잔에 얼음을 계량해 한 번 칠링한 뒤 바로 블렌더 통으로 옮기고, 그 안에 재료를 넣어 블렌딩합니다. 탄산은 블렌더·셰이커에 넣지 않습니다. 올드 패션드의 설탕 녹이기, 위스키 사워의 마지막 소다는 순서를 구분합니다.</p><p>탭을 옮겨도 이번 연습은 유지됩니다. 새로고침하면 초기화되며, 기존 암기 체크와 실기 진도는 바뀌지 않습니다.</p></details></section>';
  }
  function question(){
   const item=session.items[session.index],q=byId.get(item.id),r=item.result,order=q.kind==='order',multi=['ingredients','reverse'].includes(q.kind);
   const graded=session.items.filter(x=>x.result),score=graded.filter(x=>x.result.passed).length;
   const choices=item.choices.map(c=>'<button type="button" class="md-choice'+(item.answer.includes(c.id)?' md-selected':'')+'" data-md-action="pick" data-value="'+esc(c.id)+'" '+(order?'':'aria-pressed="'+item.answer.includes(c.id)+'" ')+' '+(r||order&&item.answer.includes(c.id)?'disabled':'')+'>'+(order&&item.answer.includes(c.id)?'<span>✓ 배치됨</span>':multi?'<span aria-hidden="true">'+(item.answer.includes(c.id)?'✓':'＋')+'</span>':'')+esc(c.label)+'</button>').join('');
   const placed=order?'<div class="md-order"><h3>내가 배치한 순서 <small>'+item.answer.length+' / '+q.choices.length+'</small></h3><ol>'+item.answer.map((id,i)=>'<li><span class="md-step-num">'+(i+1)+'</span><span>'+esc(label(q,id))+'</span><div>'+[['up','↑',i===0],['down','↓',i===item.answer.length-1],['remove','×',false]].map(([a,t,disabled])=>'<button data-md-action="'+a+'" data-index="'+i+'" aria-label="'+esc((i+1)+'번째 '+label(q,id)+' '+({up:'위로',down:'아래로',remove:'배치 취소'})[a])+'" '+(disabled||r?'disabled':'')+'>'+t+'</button>').join('')+'</div></li>').join('')+'</ol>'+(!item.answer.length?'<p class="md-empty">아래 작업을 누르면 이곳에 순서대로 쌓여요.</p>':'')+'</div>':'';
   let feedback='';
   if(r){
    feedback='<div id="md-feedback" class="md-feedback '+(r.passed?'md-pass':'md-fail')+'" role="status" tabindex="-1"><h3>'+(r.passed?'정답이에요!':'다시 기억해 보세요')+'</h3><p>'+esc(q.explanation)+'</p>';
    if(order){if(!r.complete)feedback+='<p>모든 작업을 한 번씩 배치해야 해요.</p>';if(r.violations.length)feedback+='<p><b>순서 확인:</b> '+r.violations.slice(0,3).map(([a,b])=>esc(label(q,a)+' → '+label(q,b))).join(' / ')+'</p>';feedback+='<details '+(!r.passed?'open':'')+'><summary>정답 순서 예시</summary><ol>'+q.correct.map(id=>'<li>'+esc(label(q,id))+'</li>').join('')+'</ol></details>';}
    else feedback+='<p><b>정답:</b> '+esc(answerText(q))+'</p>'+(r.missing.length?'<p>빠진 답: '+esc(r.missing.map(id=>label(q,id)).join(' · '))+'</p>':'')+(r.extra.length?'<p>빼야 할 답: '+esc(r.extra.map(id=>label(q,id)).join(' · '))+'</p>':'');
    feedback+='</div>';
   }
   return '<div class="md-progress"><span>'+(session.review?'오답 복습':'이번 연습')+' <b>'+(session.index+1)+' / '+session.items.length+'</b></span><span>정답 '+score+' · 복습 '+(graded.length-score)+'</span><progress aria-label="채점 완료 문제" value="'+graded.length+'" max="'+session.items.length+'"></progress></div><section class="md-sheet" aria-labelledby="md-title"><div class="md-question-top"><span class="md-tag">'+kinds[q.kind]+'</span><button class="text-button" data-md-action="setup">연습 설정</button></div><h2 id="md-title" tabindex="-1">'+esc(q.prompt)+'</h2><p class="md-help">'+esc(q.help)+'</p>'+placed+'<div class="md-choices '+(order?'md-task-bank':'')+'" role="group" aria-label="'+(order?'배치할 작업':'정답 선택')+'">'+choices+'</div>'+feedback+'<div class="md-actions">'+(!r?'<button data-md-action="skip">모르겠어요 · 정답 보기</button><button class="primary" data-md-action="check" '+(!item.answer.length||order&&item.answer.length!==q.choices.length?'disabled':'')+'>정답 확인</button>':'<span>이 문제는 채점했어요.</span><button class="primary" data-md-action="next">'+(session.index===session.items.length-1?'결과 보기':'다음 문제 →')+'</button>')+'</div></section>';
  }
  function results(){
   const wrong=session.items.filter(x=>!x.result?.passed),score=session.items.length-wrong.length;
   return '<section class="md-sheet md-results" aria-labelledby="md-title"><div class="md-eyebrow">'+(session.review?'REVIEW COMPLETE':'ROUND COMPLETE')+'</div><h2 id="md-title" tabindex="-1">'+(wrong.length?'헷갈린 것만 한 번 더.':'이번 묶음, 모두 기억했어요!')+'</h2><p class="md-score">'+score+'<span> / '+session.items.length+'문제 정답</span></p><div class="md-kind-grid">'+Object.entries(kinds).filter(([kind])=>session.items.some(x=>byId.get(x.id).kind===kind)).map(([kind,title])=>{const items=session.items.filter(x=>byId.get(x.id).kind===kind);return '<div><b>'+title+'</b><span>'+items.filter(x=>x.result?.passed).length+' / '+items.length+'</span></div>';}).join('')+'</div><div class="md-actions">'+(wrong.length?'<button class="primary" data-md-action="review">틀린 '+wrong.length+'문제 다시 풀기</button>':'')+'<button data-md-action="start">새 문제로 연습</button><button data-md-action="setup">연습 설정</button></div>'+(wrong.length?'<div class="md-wrong-list"><h3>이번에 복습할 문제</h3>'+wrong.map(x=>{const q=byId.get(x.id);return '<details><summary>'+esc(q.prompt)+'</summary><p>'+esc(q.explanation)+'</p><p><b>'+(q.kind==='order'?'순서 예시':'정답')+':</b> '+esc(answerText(q))+'</p></details>';}).join('')+'</div>':'')+'<p class="md-footnote">이번 결과는 이 연습의 점수예요. 암기 체크와 실기 진도는 그대로입니다.</p></section>';
  }
  function render(container){
   if(host!==container){host=container;host.addEventListener('click',onClick);host.addEventListener('change',onChange);}
   host.innerHTML='<div class="md-root">'+(screen==='setup'?setup():screen==='results'?results():question())+'</div>';
  }
  function onChange(e){if(!e.target.closest('.md-root'))return;if(e.target.id==='md-group'){settings.group=e.target.value;settings.menu='all';refreshBank();render(host);moveFocus('#md-group');return;}const field={'md-kind':'kind','md-menu':'menu','md-count':'count'}[e.target.id];if(field)settings[field]=e.target.value;}
  function onClick(e){
   const button=e.target.closest('[data-md-action]');if(!button||!host.contains(button)||button.disabled)return;
   const a=button.dataset.mdAction;
   if(a==='start'){const questions=makeRound(bank,scopedRecipes(),settings);if(questions.length)start(questions);return;}
   if(a==='setup'){screen='setup';render(host);moveFocus('#md-title');return;}
   if(a==='review'&&screen==='results'){start(shuffle(session.items.filter(x=>!x.result?.passed).map(x=>byId.get(x.id))),true);return;}
   if(screen!=='question')return;
   const item=session.items[session.index],q=byId.get(item.id);
   if(a==='next'&&item.result){if(++session.index>=session.items.length)screen='results';render(host);moveFocus('#md-title');return;}
   if(item.result)return;
   if(a==='pick'){
    const value=button.dataset.value;if(!item.choices.some(x=>x.id===value))return;
    if(q.kind==='order'){if(!item.answer.includes(value))item.answer.push(value);}
    else if(['ingredients','reverse'].includes(q.kind)){item.answer=item.answer.includes(value)?item.answer.filter(x=>x!==value):[...item.answer,value];}
    else item.answer=[value];
   }else if(['up','down','remove'].includes(a)&&q.kind==='order'){
    const i=Number(button.dataset.index);if(!Number.isInteger(i)||i<0||i>=item.answer.length)return;
    const dest=i+(a==='up'?-1:1);
    if(a==='remove')item.answer.splice(i,1);else if(dest>=0&&dest<item.answer.length)[item.answer[i],item.answer[dest]]=[item.answer[dest],item.answer[i]];
   }else if(a==='check'||a==='skip'){
    if(a==='check'&&(!item.answer.length||q.kind==='order'&&item.answer.length!==q.choices.length))return;
    item.result=grade(q,a==='skip'?[]:item.answer);render(host);moveFocus('#md-feedback');return;
   }else return;
   render(host);
   // Keep keyboard focus on the newly rendered control after a selection or reorder.
   const target=[...host.querySelectorAll('[data-md-action]')].find(b=>b.dataset.mdAction===a&&b.dataset.value===button.dataset.value&&b.dataset.index===button.dataset.index&&!b.disabled);
   (target||host.querySelector('[data-md-action="check"]:not(:disabled)')||host.querySelector('[data-md-action="pick"]:not(:disabled)'))?.focus({preventScroll:true});
  }
  return {render};
 }
 return {kinds,sequence,buildBank,grade,makeRound,create};
});
