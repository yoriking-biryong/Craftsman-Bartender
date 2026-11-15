(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./data.js'));
 else root.JojuPhotoCore=factory(root.JojuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
 'use strict';
 const recipes=new Map(D.cocktails.map(c=>[c.id,c]));
 const vesselNames={glass:'제공 잔',shaker:'셰이커',mixing:'믹싱 글라스',blender:'블렌더'};
 const ticks={small:[1/8,1/4,1/3,1/2,3/4,1],large:[1.5]};
 const round=n=>Math.round(n*1e8)/1e8;
 const fraction=n=>({[1/8]:'1/8',[1/4]:'1/4',[1/3]:'1/3',[1/2]:'1/2',[3/4]:'3/4',[1.25]:'1 1/4',[1.5]:'1 1/2',[1.75]:'1 3/4',[2.5]:'2 1/2'}[n]||String(round(n)));
 function parse(value){if(['Fill','On Top'].includes(value))return {n:1,unit:value};const match=String(value).match(/^((?:\d+\s+)?\d+\/\d+|\d+(?:\.\d+)?)\s+(oz|tsp|dash|ea|part)$/);if(!match)return null;const n=match[1].split(/\s+/).reduce((sum,x)=>sum+(x.includes('/')?Number(x.split('/')[0])/Number(x.split('/')[1]):Number(x)),0);return Number.isFinite(n)&&n>0?{n,unit:match[2]}:null;}
 const fmt=(n,unit)=>['Fill','On Top'].includes(unit)?(n===1?unit:n+'회 '+unit):fraction(n)+' '+unit;
 function fresh(id){if(!recipes.has(id))throw Error('알 수 없는 메뉴');return {id,glass:'',chilled:false,ice:{glass:false,shaker:false,mixing:false,blender:false},vessel:'glass',cup:null,pours:[],actions:[],garnish:'none',coaster:false,workedOnCoaster:false,submitted:false};}
 function act(input,event){
  const s=JSON.parse(JSON.stringify(input)),fail=message=>({state:input,ok:false,message}),c=recipes.get(s.id);
  if(s.submitted)return fail('제출한 잔입니다. 다른 잔을 선택해 주세요.');
  const at=s.actions.length,log=(kind,extra={})=>s.actions.push({kind,at,...extra});
  const occupied=dest=>s.pours.some(p=>p.location===dest);
  let message='';
  switch(event.type){
   case 'glass':if(!D.glasses[event.id])return fail('잔을 골라 주세요.');if(occupied('glass'))return fail('내용물이 든 잔은 바꿀 수 없어요. 이 잔을 초기화한 뒤 다시 골라 주세요.');if(s.glass!==event.id){s.chilled=false;s.ice.glass=false;s.garnish='none';s.coaster=false;}s.glass=event.id;log('glass',{id:event.id});message=D.glasses[event.id][0]+' 준비';break;
   case 'vessel':if(!vesselNames[event.id])return fail('도구를 골라 주세요.');s.vessel=event.id;message=vesselNames[event.id]+'에서 작업';break;
   case 'chill':if(!s.glass)return fail('먼저 제공할 잔을 고르세요.');if(occupied('glass'))return fail('음료가 담기기 전에 잔을 칠링해 주세요.');s.chilled=true;s.ice.glass=true;log('chill');message='잔에 칠링용 얼음을 넣었습니다.';break;
   case 'emptyIce':if(occupied('glass'))return fail('음료가 담긴 잔입니다. 칠링 얼음만 비울 수 없어요.');s.ice.glass=false;log('emptyIce');message='제공 잔의 칠링 얼음을 비웠습니다.';break;
   case 'ice':if(s.vessel==='glass'&&!s.glass)return fail('먼저 제공 잔을 고르세요.');s.ice[s.vessel]=true;if(s.vessel==='glass')s.chilled=true;log('ice',{vessel:s.vessel});message=vesselNames[s.vessel]+'에 얼음을 넣었습니다.';break;
   case 'iceToBlender':if(!s.glass||!s.ice.glass)return fail('제출 잔에 얼음을 계량해 칠링한 뒤 옮기세요.');if(occupied('glass'))return fail('음료가 담기기 전의 칠링 얼음을 옮겨 주세요.');s.ice.glass=false;s.ice.blender=true;s.vessel='blender';log('iceToBlender');message='잔의 칠링 얼음을 바로 블렌더 통으로 옮겼습니다.';break;
   case 'drain':if(s.vessel!=='mixing'||!s.ice.mixing)return fail('얼음이 있는 믹싱 글라스를 선택하세요.');if(occupied('mixing'))return fail('술을 넣기 전에 녹은 물만 비워 주세요.');log('drain');message='스트레이너로 얼음을 잡고 녹은 물만 비웠습니다.';break;
   case 'measure':
    if(!D.ingredients[event.id])return fail('사진에서 병을 먼저 선택하세요.');
    if(s.cup)return fail('지거에 든 재료를 먼저 붓거나 비워 주세요.');
    if(!ticks[event.side]?.some(n=>Math.abs(n-event.n)<1e-8))return fail('선택한 지거 쪽의 눈금을 골라 주세요.');
    s.cup={id:event.id,n:event.n,unit:'oz',side:event.side};message=D.ingredients[event.id][0]+' '+fmt(event.n,'oz')+' 계량';break;
   case 'emptyCup':s.cup=null;message='지거를 비웠습니다.';break;
   case 'pour':case 'direct':{
    if(s.vessel==='glass'&&!s.glass)return fail('먼저 제공 잔을 고르세요.');
    const item=event.type==='pour'?s.cup:{id:event.id,n:event.n,unit:event.unit};
    if(!item||!D.ingredients[item.id])return fail('계량할 재료를 선택하세요.');
    if(event.type==='direct'&&!['Fill','On Top','tsp','dash','ea','part'].includes(item.unit))return fail('온스는 지거로 계량해 주세요.');
    if(!(item.n>0)||!Number.isFinite(item.n))return fail('용량을 확인하세요.');
    if(event.style==='float'&&s.vessel!=='glass')return fail('뒤집은 바 스푼을 대어 부을 제공 잔을 선택하세요.');
    s.pours.push({...item,dest:s.vessel,location:s.vessel,at,ice:s.ice[s.vessel],style:event.style==='float'?'float':'normal'});
    log('pour',{id:item.id,vessel:s.vessel,style:event.style});if(s.coaster&&s.vessel==='glass')s.workedOnCoaster=true;
    if(event.type==='pour')s.cup=null;
    message=D.ingredients[item.id][0]+' '+fmt(item.n,item.unit)+' → '+vesselNames[s.vessel]+(event.style==='float'?' · 뒤집은 스푼 사용':'');break;
   }
   case 'dissolve':if(s.vessel!=='glass'||!occupied('glass'))return fail('재료가 든 제공 잔을 선택하세요.');log('dissolve');message='제공 잔에서 설탕을 녹였습니다.';break;
   case 'mix':{
    const expected={Build:'glass',Stir:'mixing',Shake:'shaker',Blend:'blender'}[event.method];
    if(s.vessel!==expected)return fail(({Build:'제공 잔',Stir:'믹싱 글라스',Shake:'셰이커',Blend:'블렌더'})[event.method]+'를 작업 도구로 선택하세요.');
    if(!occupied(s.vessel))return fail('먼저 재료를 계량해 넣으세요.');
    log('mix',{method:event.method,vessel:s.vessel,ice:s.ice[s.vessel]});if(s.coaster&&s.vessel==='glass')s.workedOnCoaster=true;
    message=({Build:'가볍게 저었습니다.',Stir:'스터링했습니다.',Shake:'뚜껑을 닫고 셰이킹했습니다.',Blend:'뚜껑을 닫고 블렌딩했습니다.'})[event.method];break;
   }
   case 'transfer':{
    if(!s.glass)return fail('먼저 제공 잔을 고르세요.');
    if(s.vessel==='glass'||!occupied(s.vessel))return fail('내용물이 담긴 혼합 도구를 선택하세요.');
    if(!['strain','all'].includes(event.mode))return fail('따르는 방법을 골라 주세요.');
    log('transfer',{vessel:s.vessel,mode:event.mode});
    s.pours.forEach(p=>{if(p.location===s.vessel)p.location='glass';});
    if(event.mode==='all'&&s.ice[s.vessel])s.ice.glass=true;
    s.ice[s.vessel]=false;if(s.coaster)s.workedOnCoaster=true;
    message=event.mode==='strain'?'스트레이너로 얼음을 걸러 제공 잔에 따랐습니다.':'얼음과 내용물을 함께 제공 잔에 담았습니다.';break;
   }
   case 'garnish':if(!D.garnishes[event.id]||!s.glass)return fail('잔과 장식을 골라 주세요.');s.garnish=event.id;log('garnish',{id:event.id});message=D.garnishes[event.id]+' 적용';break;
   case 'coaster':if(!s.glass)return fail('제공 잔을 고르세요.');s.coaster=true;log('coaster');message='잔을 제출용 코스터로 옮겼습니다.';break;
   case 'worktop':s.coaster=false;message='잔을 작업대로 옮겼습니다.';break;
   case 'submit':if(!s.glass)return fail('제출할 잔이 없습니다.');s.submitted=true;log('submit');message=c.name+' 제출 완료';break;
   default:return fail('작업을 선택하세요.');
  }
  return {state:s,ok:true,message};
 }
 function grade(s){
  const c=recipes.get(s.id),rows=[],add=(key,label,expected,actual,ok)=>rows.push({key,label,expected,actual,ok:!!ok});
  const normalized=id=>c.ingredients.some(i=>i.id==='orangeLiqueur')&&id==='tripleSec'?'orangeLiqueur':c.ingredients.some(i=>i.id==='rum')&&id==='bacardi'?'rum':id;
  const served=s.pours.filter(p=>p.location==='glass'),expectedIds=new Set(c.ingredients.map(i=>i.id));
  add('glass','잔',D.glasses[c.glass][0],D.glasses[s.glass]?.[0]||'미선택',s.glass===c.glass);
  for(const ing of c.ingredients){
   const target=parse(ing.amount),pours=served.filter(p=>normalized(p.id)===ing.id),units=[...new Set(pours.map(p=>p.unit))];
   const actual=units.map(unit=>fmt(pours.filter(p=>p.unit===unit).reduce((a,p)=>a+p.n,0),unit)).join(' + ')||'미입력';
   const total=pours.filter(p=>p.unit===target?.unit).reduce((a,p)=>a+p.n,0),oneAlternative=ing.id!=='orangeLiqueur'||new Set(pours.map(p=>p.id)).size===1;
   const amountKnown=ing.verified!==false&&!!target;
   add('ingredient-'+ing.id,D.ingredients[ing.id][0],amountKnown?ing.amount:'재료 선택 · 용량은 원문 확인 전 채점 제외',actual,amountKnown?units.length===1&&units[0]===target.unit&&Math.abs(total-target.n)<1e-7&&oneAlternative:pours.length>0&&oneAlternative);
  }
  for(const id of new Set(served.filter(p=>!expectedIds.has(normalized(p.id))).map(p=>p.id)))add('extra-'+id,D.ingredients[id][0],'사용하지 않음','추가함',false);
  add('leftovers','혼합 도구·지거','내용물을 모두 제공 잔에 옮기기',s.cup||s.pours.some(p=>p.location!=='glass')?'남은 재료 있음':'옮김',!s.cup&&!s.pours.some(p=>p.location!=='glass'));
  const a=s.actions,first=kind=>a.find(e=>e.kind===kind),lastPour=Math.max(-1,...s.pours.map(p=>p.at));
  const transport=c.method==='Stir'?'mixing':c.method.startsWith('Shake')?'shaker':c.method==='Blend'?'blender':null;
  const expectedMix=c.method==='Stir'?'Stir':c.method.startsWith('Shake')?'Shake':c.method==='Blend'?'Blend':c.method==='Build'?'Build':null;
  const lateIds=c.ingredients.filter(i=>i.finish||[6,37].includes(c.number)&&i.id==='soda'||i.amount==='On Top').map(i=>i.id),early=s.pours.filter(p=>!lateIds.includes(normalized(p.id)));
  let methodOK=true,orderOK=true,methodActual=[];
  for(const e of a.filter(e=>e.kind==='mix'))methodActual.push(e.method);
  if(c.method==='Build/Float'&&s.pours.some(p=>p.dest==='glass'))methodActual.unshift('Build');
  if(c.method==='Shake/Build'&&s.pours.some(p=>p.dest==='glass'&&lateIds.includes(normalized(p.id))))methodActual.push('Build');
  if(s.pours.some(p=>p.style==='float'))methodActual.push('Float');
  if(expectedMix){
   const mixes=a.filter(e=>e.kind==='mix'&&e.method===expectedMix),mix=mixes.find(e=>early.every(p=>p.at<e.at));
   methodOK=!!mix&&a.filter(e=>e.kind==='mix').every(e=>e.method===expectedMix);
   if(transport){
    const transfer=a.find(e=>e.kind==='transfer'&&e.vessel===transport&&mix&&e.at>mix.at);
    methodOK=methodOK&&early.every(p=>p.dest===transport)&&!!mix?.ice&&!!transfer&&transfer.mode===(c.method==='Blend'?'all':'strain');
    orderOK=!!transfer&&early.every(p=>p.ice)&&s.pours.filter(p=>lateIds.includes(normalized(p.id))).every(p=>p.dest==='glass'&&p.at>transfer.at)&&!a.some(e=>e.kind==='mix'&&e.at>transfer.at);
    if(transport==='mixing')orderOK=orderOK&&a.some(e=>e.kind==='drain'&&early.every(p=>e.at<p.at));
   }else methodOK=methodOK&&s.pours.every(p=>p.dest==='glass');
  }else if(c.method==='Float'){
   const layerIds=c.ingredients.map(i=>i.id),blocks=s.pours.map(p=>normalized(p.id)).filter((id,i,ids)=>i===0||id!==ids[i-1]);
   methodOK=s.pours.length>0&&s.pours.every(p=>p.dest==='glass'&&!p.ice&&(normalized(p.id)===layerIds[0]||p.style==='float'))&&!a.some(e=>['mix','transfer'].includes(e.kind));
   orderOK=blocks.length===layerIds.length&&blocks.every((id,i)=>id===layerIds[i]);
  }else if(c.method==='Build/Float'){
   const syrup=s.pours.filter(p=>p.id==='grenadine'),orange=s.pours.filter(p=>p.id==='orange');
   methodOK=syrup.length>0&&syrup.every(p=>p.style==='float'&&p.dest==='glass')&&s.pours.every(p=>p.dest==='glass');
   orderOK=syrup.every(p=>orange.length&&orange.every(o=>o.at<p.at))&&!a.some(e=>e.kind==='mix'&&e.at>Math.min(...syrup.map(p=>p.at)))&&s.pours.at(-1)?.id==='grenadine';
  }
  add('method','도구·기법',c.method,methodActual.join(' → ')||'혼합하지 않음',methodOK);
  if(c.number===4){const d=first('dissolve'),sugar=s.pours.find(p=>p.id==='sugar'),soda=s.pours.find(p=>p.id==='soda'),bitters=s.pours.find(p=>p.id==='bitters'),bourbon=s.pours.find(p=>p.id==='bourbon');orderOK=!!d&&[sugar,soda,bitters].every(p=>p&&p.at<d.at)&&!!bourbon&&bourbon.at>d.at&&a.some(e=>e.kind==='ice'&&e.vessel==='glass'&&e.at>d.at&&e.at<bourbon.at);}
  if(c.number===38){const d=first('dissolve'),soda=s.pours.find(p=>p.id==='soda');orderOK=!!d&&['freshLemon','sugar'].every(id=>s.pours.some(p=>p.id===id&&p.at<d.at))&&!!soda&&soda.at>d.at;}
  if(c.number===6){const sodas=s.pours.filter(p=>p.id==='soda'),cherries=s.pours.filter(p=>p.id==='cherryBrandy');orderOK=orderOK&&sodas.length>0&&cherries.length>0&&sodas.every(p=>cherries.every(cherry=>p.at<cherry.at));}
  if(c.number===21){const cola=s.pours.filter(p=>p.id==='cola'),mix=a.find(e=>e.kind==='mix'&&e.method==='Build'&&early.every(p=>p.at<e.at));orderOK=orderOK&&!!mix&&cola.length>0&&cola.every(p=>p.at>mix.at)&&!a.some(e=>e.kind==='mix'&&cola.some(p=>e.at>p.at));}
  if(c.method==='Blend'){const moved=first('iceToBlender');orderOK=orderOK&&!!moved&&s.pours.every(p=>p.at>moved.at);}
  if(c.garnish==='salt')orderOK=orderOK&&a.some(e=>e.kind==='garnish'&&e.id==='salt'&&s.pours.filter(p=>p.location==='glass').every(p=>e.at<p.at));
  const orderExpected=c.number===21?'얼음 있는 콜린스 잔 → 다섯 술 각 1/2 oz·S/S 1 1/2 oz → 섞기 → 콜라 On Top':c.number===37?'진·레몬·설탕 셰이킹 → 얼음 있는 하이볼 잔에 거르기 → 소다 Fill':c.number===30?'화이트 와인 잔 칠링 → 얼음 비우기 → 와인·카시스 → 가볍게 젓기':c.number===6?'진·레몬·설탕 셰이킹 → 거르기 → 소다 Fill → 체리 브랜디 1/2 oz On Top · 다시 젓지 않기':c.method==='Blend'?'잔의 칠링 얼음을 바로 블렌더로 → 재료 → 블렌딩 → 통째로 따르기':c.number===4?'설탕·비터스·소다 → 녹이기 → 얼음 → 버번 → 가볍게 젓기':c.number===38?'레몬·설탕 → 녹이기 → 얼음·소다 → 가볍게 섞기':c.method==='Build/Float'?'오렌지 다음 그레나딘 · 마지막에는 젓지 않기':c.garnish==='salt'?'소금 리밍 → 셰이커 얼음·재료 → 셰이킹 → 거르기':c.method==='Build'?'제공 잔에 재료를 계량 → 가볍게 젓기':c.method==='Shake/Build'?'셰이커 얼음·재료 → 셰이킹 → 거르기 → 탄산수 · 젓지 않기':c.method==='Stir'?'믹싱 글라스 얼음·물 비우기 → 재료 → 스터링 → 얼음 걸러 따르기':'셰이커 얼음·재료 → 셰이킹 → 칠링 얼음 비우기 → 얼음 걸러 따르기';
  add('order','작업 순서',c.method==='Float'?c.ingredients.map(i=>D.ingredients[i.id][0]+' '+i.amount).join(' → ')+' · 뒤집은 스푼으로 층 쌓기, 젓지 않기':orderExpected,orderOK?'순서 일치':'작업 기록에서 순서 확인',orderOK);
  const needsIce=['rocks','highball','pilsner','collins'].includes(c.glass);
  add('ice','제출 잔의 얼음',needsIce?'얼음과 함께 제출':'칠링 얼음 없이 제출',s.ice.glass?'얼음 있음':'얼음 없음',s.ice.glass===needsIce);
  add('chill','잔 준비',c.method==='Float'?'얼음 없는 잔에 층 쌓기':'차갑게 준비한 잔',c.method==='Float'?(s.ice.glass?'얼음 있음':'얼음 없는 잔'):s.chilled?'칠링함':'칠링하지 않음',c.method==='Float'?!s.ice.glass:s.chilled);
  add('garnish','장식',D.garnishes[c.garnish],D.garnishes[s.garnish],D.garnishes[c.garnish]===D.garnishes[s.garnish]);
  add('coaster','제출 위치','작업을 마친 뒤 코스터에 제출',s.coaster?(s.workedOnCoaster?'코스터 위에서 조주함':'코스터에 놓음'):'작업대에 있음',s.coaster&&!s.workedOnCoaster&&a.some(e=>e.kind==='coaster'&&e.at>lastPour));
  add('submitted','제출','제출 완료',s.submitted?'제출 완료':'미제출',s.submitted);
  return {rows,correct:rows.filter(r=>r.ok).length,total:rows.length,passed:rows.every(r=>r.ok)};
 }
 return {fresh,act,grade,parse,fmt,ticks,vesselNames};
});
