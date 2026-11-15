(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./data.js'),require('./photo-core.js'),require('./bar-objects.js'));else root.JojuBarCore=factory(root.JojuData,root.JojuPhotoCore,root.JojuBarObjects);})(typeof globalThis!=='undefined'?globalThis:this,function(D,P,O){
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x)),recipe=id=>D.cocktails.find(c=>c.id===id);
 const fruitNames={lemon:'레몬',lime:'라임',orange:'오렌지',pineapple:'파인애플',apple:'사과',cherry:'체리',olive:'그린 올리브'};
 const forms={whole:'통과일',halfLong:'세로로 자른 반쪽',halfCross:'가로로 자른 반쪽',slice:'반달 슬라이스',wheel:'둥근 휠',wedge:'웨지',peel:'껍질',twist:'트위스트',irregular:'모양이 맞지 않는 조각'};
 function fresh(id){return {version:1,drink:P.fresh(id),positions:{},audit:[],fruit:null,garnish:null,closed:{shaker:false,blender:false},capOff:false,dirty:[],wetRim:false,freePours:0,attempt:1};}
 const onWork=(s,key)=>s.positions[key]?.zone==='work';
 function apply(input,event,elapsed=0){
  let s=copy(input),message='',ok=true;
  const need=(...keys)=>{if(keys.includes("g:null")||keys.includes("g:"))throw Error("제공할 잔을 먼저 골라 주세요.");};
  const base=e=>{const r=P.act(s.drink,e);if(!r.ok)throw Error(r.message);s.drink=r.state;message=r.message;};
  const vesselKey=()=>s.drink.vessel==='glass'?'g:'+s.drink.glass:'t:'+s.drink.vessel;
  const dirty=key=>{if(key&&!s.dirty.includes(key))s.dirty.push(key);};
  const fruit=()=>{if(!s.fruit)throw Error('과일을 눌러 손질을 시작하세요.');return s.fruit;};
  try{
   if(s.drink.submitted&&event.type!=='reset')throw Error('이미 제출한 잔입니다. 다른 잔을 선택하세요.');
   switch(event.type){
    case 'move':{
     const o=O.byKey[event.key];if(!o)throw Error('옮길 물건을 선택하세요.');
     if(!['work','home','sink'].includes(event.zone))throw Error('작업대·싱크대·원래 자리 중 하나를 선택하세요.');
     if(!Number.isFinite(event.x)||!Number.isFinite(event.y))throw Error('놓을 위치를 확인하세요.');
     s.moveUndo=s.moveUndo||{};s.moveUndo[o.key]=s.positions[o.key]?copy(s.positions[o.key]):{x:o.x,y:o.y,zone:'home'};
     s.positions[o.key]={x:Math.max(0,Math.min(96,event.x)),y:Math.max(0,Math.min(96,event.y)),zone:event.zone};
     message=o.name+' → '+({work:'작업대',home:'원래 자리',sink:'싱크대'})[event.zone];
     if(o.type==='glass'&&event.zone==='work'){if(s.drink.glass!==o.id)base({type:'glass',id:o.id});base({type:'worktop'});message='작업대에 준비: '+o.name;}
     if(o.type==='glass'&&o.id===s.drink.glass&&event.zone!=='work')base({type:'worktop'});
     break;
    }
    case 'undoMove':{const o=O.byKey[event.key],prior=s.moveUndo?.[event.key];if(!o||!prior)throw Error('되돌릴 이동이 없습니다.');s.positions[event.key]=prior;delete s.moveUndo[event.key];if(o.type==='glass'&&o.id===s.drink.glass)base({type:prior.zone==='coaster'?'coaster':'worktop'});message=o.name+' 이동 취소';break;}
    case 'glass':base(event);break;
    case 'sugarCube':base({type:'direct',id:'sugar',n:1,unit:'ea'});message='각설탕 1개 → '+P.vesselNames[s.drink.vessel];break;
    case 'vessel':if(event.id==='glass'){if(!s.drink.glass)throw Error('제공할 잔을 먼저 골라 주세요.');need('g:'+s.drink.glass);}else need('t:'+event.id);base(event);break;
    case 'chill':need('g:'+s.drink.glass,'t:ice','t:tongs');event={...event,tool:'tongs',source:'roundIceBowl'};base(event);dirty('t:tongs');message='집게로 둥근 바트의 얼음을 옮겨 잔 칠링';break;
    case 'ice':need(vesselKey(),event.crushed?'t:crushed':'t:ice');if(!event.crushed){need('t:tongs');event={...event,tool:'tongs',source:'roundIceBowl'};}base({type:'ice'});if(!event.crushed){dirty('t:tongs');message='집게로 각얼음 넣기 → '+P.vesselNames[s.drink.vessel];}break;
    case 'emptyIce':need('g:'+s.drink.glass);base(event);break;
    case 'iceToBlender':need('g:'+s.drink.glass,'t:blender');base(event);break;
    case 'drain':need('t:mixing','t:strainer');base(event);break;
    case 'measure':need('b:'+event.id,'t:jigger');base(event);dirty('t:jigger');break;
    case 'pour':need('t:jigger',vesselKey());if(event.style==='float')need('t:spoon');if(['shaker','blender'].includes(s.drink.vessel)&&s.closed[s.drink.vessel])throw Error('뚜껑을 열고 재료를 넣어 주세요.');base(event);dirty(vesselKey());break;
    case 'direct':{
     if(event.id==='freshLemon')throw Error('생레몬은 도마에서 반으로 자르고 착즙해 주세요.');
     need('b:'+event.id,vesselKey());if(event.unit==='tsp'||event.style==='float')need('t:spoon');
     if(['shaker','blender'].includes(s.drink.vessel)&&s.closed[s.drink.vessel])throw Error('뚜껑을 열고 재료를 넣어 주세요.');
     if(event.unit==='oz'){
      base({type:'direct',id:event.id,n:event.n,unit:'tsp',style:event.style});s.drink.pours.at(-1).unit='oz';s.drink.pours.at(-1).unmeasured=true;s.freePours++;
      message=D.ingredients[event.id][0]+' '+P.fmt(event.n,'oz')+' 눈대중으로 바로 붓기 · 지거 미사용';
     }else base(event);
     dirty(vesselKey());break;
    }
    case 'emptyCup':need('t:jigger');base(event);break;
    case 'lid':need('t:'+event.id);if(!['shaker','blender'].includes(event.id))throw Error('뚜껑이 있는 도구를 고르세요.');s.closed[event.id]=!!event.closed;if(event.id==='shaker')s.capOff=false;message=P.vesselNames[event.id]+' 뚜껑 '+(event.closed?'닫기':'열기');break;
    case 'cap':need('t:shaker');if(!s.closed.shaker)throw Error('셰이커를 조립한 뒤 윗캡을 여세요.');s.capOff=true;message='셰이커의 윗캡을 열었습니다.';break;
    case 'mix':
     need(vesselKey());if(['Build','Stir'].includes(event.method))need('t:spoon');
     if(event.method==='Shake'&&(!s.closed.shaker||s.capOff))throw Error('셰이커의 뚜껑과 윗캡을 닫은 뒤 흔드세요.');
     if(event.method==='Blend'&&!s.closed.blender)throw Error('블렌더 뚜껑을 닫은 뒤 작동하세요.');
     base(event);dirty(vesselKey());break;
    case 'dissolve':need('t:spoon','g:'+s.drink.glass);base(event);dirty('t:spoon');break;
    case 'transfer':
     need(vesselKey(),'g:'+s.drink.glass);
     if(s.drink.vessel==='mixing')need('t:strainer');
     if(s.drink.vessel==='shaker'&&s.closed.shaker&&!s.capOff)throw Error('셰이커의 윗캡을 열어 따르세요.');
     if(s.drink.vessel==='blender'&&s.closed.blender)throw Error('블렌더 뚜껑을 열어 따르세요.');
     base(event);dirty('g:'+s.drink.glass);break;
    case 'fruitStart':{
     if(!fruitNames[event.id])throw Error('과일을 골라 주세요.');need('f:'+event.id,'t:board');
     s.fruit={kind:event.id,form:'whole',angle:0,trimmed:false,thin:false,thickness:3,slit:false,cherry:false,picked:false,wrapped:false,cross:false};
     message=fruitNames[event.id]+' 손질 시작';break;
    }
    case 'rotate':{const f=fruit();f.angle=(f.angle+90)%180;message=fruitNames[f.kind]+' 90° 회전 → '+(f.angle?'가로 방향':'꼭지와 꼭지를 잇는 세로 방향');break;}
    case 'cut':{
     need('t:knife','t:board');const f=fruit();dirty('t:knife');dirty('t:board');
     if(event.mode==='trim'){f.trimmed=true;message='과일의 꼭지와 양 끝 정리';break;}
     if(event.mode==='half'){if(f.form!=='whole')throw Error('이미 자른 조각입니다. 새 과일로 시작하세요.');f.form=f.angle===0?'halfLong':'halfCross';}
     else if(event.mode==='slice'){
      f.thickness=Number(event.thickness);if(!Number.isFinite(f.thickness)||f.thickness<1||f.thickness>10)throw Error('두께를 1~10 mm에서 선택하세요.');
      if(f.kind==='apple'&&['whole','halfLong'].includes(f.form))f.form='slice';
      else if(f.form==='halfLong'&&f.angle===90)f.form='slice';else if(f.form==='whole'&&f.angle===90)f.form='wheel';else throw Error('슬라이스는 세로로 가른 반쪽을 눕혀 가로로 자르세요.');
     }else if(event.mode==='wedge'){if(f.form!=='halfLong')throw Error('세로로 가른 반쪽에서 중앙을 향해 웨지를 자르세요. 슬라이스·가로 반쪽을 바꾸어 쓰지 않습니다.');if(f.angle!==0)throw Error('꼭지와 꼭지를 잇는 방향으로 돌린 뒤 중앙을 향해 자르세요.');f.form='wedge';}
     else if(event.mode==='peel'){if(!['lemon','lime','orange'].includes(f.kind))throw Error('껍질 트위스트는 감귤류로 준비하세요.');f.form='peel';f.thin=false;}
     else if(event.mode==='pith'){if(f.form!=='peel')throw Error('껍질을 먼저 떠 주세요.');f.thin=true;}
     else if(event.mode==='slit'){if(!['slice','wedge','wheel'].includes(f.form))throw Error('자를 조각을 먼저 준비하세요.');f.slit=true;}
     else if(event.mode==='cross'){if(f.kind!=='lemon'||f.form!=='halfCross')throw Error('가로로 자른 레몬 반쪽 단면에 십자 칼집을 내세요.');f.cross=true;}
     else throw Error('손질 방법을 고르세요.');
     message=fruitNames[f.kind]+' · '+({half:'반으로 자르기',slice:'슬라이스 '+f.thickness+' mm',wedge:'중앙을 향해 웨지 자르기',peel:'껍질 뜨기',pith:'흰 부분 다듬기',slit:'잔에 걸 칼집 내기',cross:'십자 칼집 내기'})[event.mode]+' → '+forms[f.form];break;
    }
    case 'twist':{need('t:tongs');const f=fruit();if(f.form!=='peel'||!f.thin)throw Error('껍질을 뜨고 흰 부분을 다듬은 뒤 비틀어 주세요.');f.form='twist';message=fruitNames[f.kind]+' 껍질을 교차해 비틀기';break;}
    case 'pickFruit':{need('t:pick','t:tongs');const f=fruit();if(f.form==='whole'&&!['cherry','olive'].includes(f.kind))throw Error('먼저 장식할 조각을 잘라 주세요.');f.picked=true;message=fruitNames[f.kind]+' 조각을 픽에 꽂기';break;}
    case 'addCherry':{need('t:pick','t:tongs','f:cherry');const f=fruit();if(!['slice','wedge'].includes(f.form))throw Error('슬라이스 또는 웨지 조각을 준비하세요.');if(f.kind==='lemon'&&!f.picked)throw Error('레몬 슬라이스를 픽에 먼저 꽂고 체리를 꽂으세요.');f.cherry=true;f.picked=true;message='픽으로 장식 조립: '+fruitNames[f.kind]+' + 체리';break;}
    case 'wrap':{need('t:tongs');const f=fruit();if(f.kind!=='lemon'||f.form!=='slice'||!f.cherry)throw Error('레몬 슬라이스와 체리를 먼저 픽에 꽂으세요.');if(f.thickness>4)throw Error('두꺼운 레몬은 잘 말리지 않아요. 얇은 슬라이스로 다시 준비하세요.');f.wrapped=true;message='집게로 레몬 슬라이스를 체리 둘레에 감싸 말기';break;}
    case 'squeeze':{need('t:board','g:'+s.drink.glass);const f=fruit();if(f.kind!=='lemon'||f.form!=='halfCross'||!f.cross)throw Error('레몬을 가로 반으로 자르고 단면에 십자 칼집을 낸 뒤 짜 주세요.');base({type:'direct',id:'freshLemon',n:.5,unit:'ea'});f.form='squeezed';message='레몬 반 개 착즙 → '+P.vesselNames[s.drink.vessel];break;}
    case 'garnishFruit':{
     const f=fruit();need('g:'+s.drink.glass,'t:tongs');let id='';
     if(['cherry','olive'].includes(f.kind)&&f.picked)id=f.kind;
     if(f.form==='twist')id=f.kind==='orange'?'orangeTwist':f.kind==='lime'?'citrusTwist':'lemonTwist';
     if(f.form==='slice')id=f.kind==='apple'?'apple':f.kind==='orange'?(f.cherry?'orangeCherry':''):f.cherry?(f.kind==='lemon'&&f.wrapped?'lemonCherry':''):f.kind==='lemon'?'lemonSlice':f.kind==='lime'?'citrusSlice':'';
     if(f.form==='wedge')id=f.kind==='pineapple'&&f.cherry?'pineappleCherry':f.kind==='lemon'?'lemonWedge':f.kind==='lime'?'citrusWedge':'';
     if(!id)throw Error('아직 사용할 수 있는 장식이 완성되지 않았어요. 모양·픽·체리를 확인하세요.');
     const expected=recipe(s.drink.id).garnish;
     if(({citrusWedge:'lemonWedge',citrusSlice:'lemonSlice',citrusTwist:'lemonTwist'})[expected]===id)id=expected;
     base({type:'garnish',id});s.garnish=copy(f);message='손질한 장식을 잔에 올리기: '+D.garnishes[id];break;
    }
    case 'wetRim':{need('g:'+s.drink.glass);const f=fruit();if(!['lemon','lime'].includes(f.kind)||!['slice','wedge','halfLong','halfCross'].includes(f.form))throw Error('자른 레몬이나 라임으로 잔 가장자리를 적셔 주세요.');s.wetRim=true;message='감귤류로 잔 가장자리 적시기';break;}
    case 'salt':need('t:rimmer','g:'+s.drink.glass);if(!s.wetRim)throw Error('잔 가장자리를 감귤류로 먼저 적셔 주세요.');base({type:'garnish',id:'salt'});break;
    case 'nutmeg':need('t:nutmeg','g:'+s.drink.glass);base({type:'garnish',id:'nutmeg'});message='넛메그 한 꼬집 뿌리기';break;
    case 'wash':{
     const o=O.byKey[event.key];if(!o)throw Error('씻을 도구를 고르세요.');if(o.type==='ingredient'||o.type==='fruit')throw Error('씻을 도구나 잔을 고르세요.');
     if(s.positions[event.key]?.zone!=='sink')throw Error('싱크대로 옮긴 뒤 헹구세요.');
     if(o.id==='jigger'&&s.drink.cup)throw Error('지거의 내용물을 먼저 붓거나 비워 주세요.');
     const dest=o.type==='glass'&&o.id===s.drink.glass?'glass':o.id;
     if(s.drink.pours.some(p=>p.location===dest))throw Error('내용물을 먼저 옮기거나 버린 뒤 씻어 주세요.');
     s.dirty=s.dirty.filter(k=>k!==event.key);message=o.name+' 물로 헹구기';break;
    }
    case 'wipe':need('t:towel');message='행주로 닦기: '+(O.byKey[event.key]?.name||'작업대');break;
    case 'discard':{
     const v=event.id;if(!P.vesselNames[v])throw Error('내용물을 버릴 도구를 고르세요.');
     s.drink.pours=s.drink.pours.filter(p=>p.location!==v);s.drink.ice[v]=false;if(v==='glass'){s.drink.garnish='none';s.garnish=null;}message=P.vesselNames[v]+'의 내용물을 버렸습니다.';break;
    }
    case 'coaster':{if(!s.drink.glass)throw Error('제공 잔을 고르세요.');const key='g:'+s.drink.glass,o=O.byKey[key];s.moveUndo=s.moveUndo||{};s.moveUndo[key]=copy(s.positions[key]||{x:o.x,y:o.y,zone:'home'});need(key);base(event);const n=Math.max(0,Math.min(2,Number(event.index)||0));s.positions['g:'+s.drink.glass]={x:37+n*7.5,y:45.5,zone:'coaster'};break;}
    case 'worktop':base(event);if(s.drink.glass)s.positions['g:'+s.drink.glass]={x:35,y:56,zone:'work'};break;
    case 'submit':base(event);break;
    case 'note':message=String(event.text||'').trim().slice(0,500);if(!message)throw Error('기록할 내용을 입력하세요.');break;
    case 'reset':{const old=s;s=fresh(old.drink.id);s.audit=old.audit;s.attempt=old.attempt+1;message='이 잔 처음부터 다시 만들기 · 이전 행동 기록 보존';break;}
    default:throw Error('작업을 선택하세요.');
   }
  }catch(error){ok=false;message=error.message;s=copy(input);}
  s.audit.push({seq:s.audit.length+1,seconds:Math.max(0,Number(elapsed)||0),attempt:s.attempt,type:event.type,event:copy(event),label:message,ok});
  return {state:s,ok,message};
 }
 function grade(s){const g=P.grade(s.drink);const unmeasured=s.drink.pours.filter(p=>p.unmeasured);g.rows.push({key:'measurement',label:'계량 방법',expected:'oz 재료는 지거로 계량',actual:unmeasured.length?'눈대중으로 부은 oz 재료 '+unmeasured.length+'회':'단위에 맞게 계량함',ok:unmeasured.length===0});
  const c=recipe(s.drink.id);if(!['none','salt','nutmeg'].includes(c.garnish))g.rows.push({key:'fruit-process',label:'가니시 손질',expected:'직접 손질·조립한 장식',actual:s.garnish?'손질·조립 기록 있음':'손질 기록 없음',ok:!!s.garnish});
  g.correct=g.rows.filter(r=>r.ok).length;g.total=g.rows.length;g.passed=g.correct===g.total;return g;}
 // Training overlays are opt-in so saved legacy sessions keep their original grading.
 const precautionNames={hands:'비누로 손 씻기',dry:'손 물기 닦기',attire:'복장·머리·액세서리 확인',label:'기주 라벨 쇼잉',level:'지거 수평으로 잡기',front:'몸 앞에서 계량하기',steady:'병을 받쳐 천천히 따르기',fast:'한 손으로 급하게 따르기',seal:'뚜껑·윗캡 밀착 확인',grip:'위·아래를 양손으로 잡기',direction:'뚜껑을 가슴 쪽으로',strainer:'스트레이너를 손으로 고정'};
 const preparation=['hands','dry','attire'],heavyBottles=['grapefruit','cranberry'];
 const productive=new Set(['measure','direct','pour','chill','ice','iceToBlender','cut','pickFruit','addCherry','garnishFruit','twist','wrap','squeeze','wetRim','salt','nutmeg','mix','dissolve','transfer','sugarCube','submit']);
 function trainingFresh(id){const s=fresh(id);s.practice={version:1,prep:{hands:false,dry:false,attire:false},bottles:{},shake:{},strainer:false,incident:null,episodes:[],incidentCount:0,eligibleCount:0,lastIncidentAt:-20,verified:{measures:0,labels:0,shakes:0,strains:0}};return s;}
 function prepared(s){return !s.practice||preparation.every(k=>s.practice.prep[k]);}
 function needsLabel(s,id){const c=recipe(s.drink.id),category=D.ingredients[id]?.[2];return ['위스키','진','보드카','럼','테킬라','브랜디','전통주'].includes(category)||id==='whiteWine'||(c.ingredients[0]?.id===id&&category==='리큐르');}
 function requirements(s,e){
  const p=s.practice;if(!p)return [];
  if(productive.has(e.type)&&!prepared(s))return preparation.filter(k=>!p.prep[k]);
  const b=p.bottles[e.id]||{};
  if(e.type==='measure'||e.type==='direct')return [...(needsLabel(s,e.id)&&!b.label?['label']:[]),...(e.type==='measure'?[...(!b.level?['level']:[]),...(!b.front?['front']:[]),...(heavyBottles.includes(e.id)&&!b.pace?['pace']:[])]:[])];
  if(e.type==='mix'&&e.method==='Shake'&&s.closed.shaker&&!s.capOff)return ['seal','grip','direction'].filter(k=>!p.shake[k]);
  if(e.type==='transfer'&&e.mode==='strain'&&!p.strainer)return ['strainer'];
  return [];
 }
 function practiceLog(s,event,label,seconds,ok=true){s.audit.push({seq:s.audit.length+1,seconds:Math.max(0,Number(seconds)||0),attempt:s.attempt,type:event.type,event:copy(event),label,ok});return {state:s,ok,message:label};}
 function completeEpisode(s,seconds){const p=s.practice,i=p.incident;if(!i)return;
  const done=i.kind==='overpour'?i.emptied&&i.wiped:i.kind==='shakerLeak'?i.wiped&&i.washed:i.kind==='garnishDrop'?i.discarded:i.waited;
  if(done){p.episodes.push({...i,resolved:true,resolvedAt:seconds});p.incident=null;practiceLog(s,{type:'incidentResolved',kind:i.kind},'돌발 수습 완료 · '+i.title,seconds);}
 }
 function trainingApply(input,event,elapsed=0,options={}){
  if(!input.practice)return apply(input,event,elapsed);
  let s=copy(input),p=s.practice;
  const fail=message=>practiceLog(s,event,message,elapsed,false);
  if(s.drink.submitted&&event.type!=='reset')return fail('이미 제출한 잔입니다. 다른 잔을 선택하세요.');
  if(event.type==='precaution'){
   const k=event.key;if(!precautionNames[k])return fail('확인할 동작을 고르세요.');
   if(preparation.includes(k)){if(k==='dry'&&!p.prep.hands)return fail('손을 씻은 뒤 물기를 닦으세요.');p.prep[k]=true;if(k==='hands')p.prep.dry=false;}
   else if(['label','level','front','steady','fast'].includes(k)){
    if(!D.ingredients[event.id])return fail('확인할 병을 먼저 고르세요.');
    const b=p.bottles[event.id]||(p.bottles[event.id]={});if(k==='steady'||k==='fast')b.pace=k;else b[k]=!b[k];
    return practiceLog(s,event,D.ingredients[event.id][0]+' · '+precautionNames[k]+((k==='steady'||k==='fast')?'':b[k]?' ✓':' 취소'),elapsed);
   }else if(k==='strainer')p.strainer=!p.strainer;
   else {if(!s.closed.shaker||s.capOff)return fail('셰이커 뚜껑과 윗캡을 먼저 닫으세요.');p.shake[k]=!p.shake[k];}
   return practiceLog(s,event,precautionNames[k]+' ✓',elapsed);
  }
  if(event.type==='recover'){
   const i=p.incident;if(!i)return fail('진행 중인 돌발 상황이 없습니다.');
   if(event.choice==='guess')return fail('눈대중으로 덜지 말고 지거를 비운 뒤 다시 계량하세요.');
   if(event.choice==='reuse')return fail('떨어진 가니시는 다시 쓰지 않고 새로 준비하세요.');
   if(event.choice==='keepPouring')return fail('거품이 가라앉도록 멈춘 뒤 천천히 부으세요.');
   if(event.choice==='keepShaking')return fail('새는 셰이커는 멈추고 내용물을 비운 뒤 도구와 작업대를 정리하세요.');
   let r;
   if(event.choice==='empty'&&i.kind==='overpour')r=apply(s,{type:'emptyCup'},elapsed);
   else if(event.choice==='wipe'&&['overpour','shakerLeak'].includes(i.kind))r=apply(s,{type:'wipe',key:'work'},elapsed);
   else if(event.choice==='wash'&&i.kind==='shakerLeak'){
    r=apply(s,{type:'move',key:'t:shaker',zone:'sink',x:17,y:81},elapsed);
    if(r.ok)r=apply(r.state,{type:'wash',key:'t:shaker'},elapsed);
   }else if(event.choice==='discard'&&i.kind==='garnishDrop'){i.discarded=true;s.fruit=null;r=practiceLog(s,event,'떨어진 장식을 버렸습니다. 새 과일로 다시 준비하세요.',elapsed);}
   else if(event.choice==='wait'&&i.kind==='foam'){i.waited=true;r=practiceLog(s,event,'병을 세워 거품이 가라앉기를 기다렸습니다. 천천히 다시 부으세요.',elapsed);}
   else return fail('현재 돌발 상황에 맞는 대처를 고르세요.');
   if(!r.ok)return r;s=r.state;p=s.practice;
   if(event.choice==='empty')p.incident.emptied=true;
   if(event.choice==='wipe')p.incident.wiped=true;
   if(event.choice==='wash')p.incident.washed=true;
   completeEpisode(s,elapsed);return {state:s,ok:true,message:p.incident?r.message:'수습 완료 · 다시 작업하세요.'};
  }
  if(p.incident&&productive.has(event.type))return fail('돌발 상황을 먼저 수습하세요: '+p.incident.title);
  const needed=requirements(s,event);if(needed.length)return {...fail('먼저 확인: '+needed.map(k=>precautionNames[k]||'무거운 병을 잡는 방법').join(' · ')),needs:needed};
  if(event.type==='mix'&&['Shake','Blend'].includes(event.method)&&s.drink.pours.some(x=>x.location===s.drink.vessel&&D.ingredients[x.id]?.[2]==='탄산'))return fail('탄산은 흔들거나 블렌딩하지 않습니다. 탄산이 섞인 내용물을 비우고 탄산 전 단계부터 다시 준비하세요.');
  let r=apply(s,event,elapsed);if(!r.ok)return r;s=r.state;
  if(event.type==='reset'){s.practice=copy(p);s.practice.bottles={};s.practice.shake={};s.practice.strainer=false;if(s.practice.incident?.kind==='overpour')s.practice.incident.emptied=true;return {state:s,ok:true,message:r.message};}
  p=s.practice;
  if(event.type==='lid'&&event.id==='shaker'||event.type==='cap')p.shake={};
  if(event.type==='measure'){p.verified.measures++;if(needsLabel(s,event.id))p.verified.labels++;}
  if(event.type==='direct'&&needsLabel(s,event.id))p.verified.labels++;
  if(event.type==='mix'&&event.method==='Shake')p.verified.shakes++;
  if(event.type==='transfer'&&event.mode==='strain'){p.verified.strains++;p.strainer=false;}
  if(p.incident){
   if(event.type==='emptyCup'&&p.incident.kind==='overpour')p.incident.emptied=true;
   if(event.type==='wipe'&&event.key==='work')p.incident.wiped=true;
   if(event.type==='wash'&&event.key==='t:shaker')p.incident.washed=true;
   completeEpisode(s,elapsed);return {state:s,ok:true,message:r.message};
  }
  let candidate=null;
  if(event.type==='measure'&&heavyBottles.includes(event.id))candidate={kind:'overpour',title:'주스가 왈칵!',anchor:'b:'+event.id,rate:p.bottles[event.id]?.pace==='steady'?.035:.18};
  if(event.type==='mix'&&event.method==='Shake')candidate={kind:'shakerLeak',title:'셰이커가 벌어졌어요!',anchor:'t:shaker',rate:.04};
  if(['pickFruit','addCherry'].includes(event.type))candidate={kind:'garnishDrop',title:'가니시가 바닥에 떨어졌어요!',anchor:'f:'+s.fruit.kind,fruit:s.fruit.kind,rate:.05};
  if(['pour','direct'].includes(event.type)&&D.ingredients[event.id||input.drink.cup?.id]?.[2]==='탄산')candidate={kind:'foam',title:'탄산 거품이 갑자기 올라와요!',anchor:'b:'+(event.id||input.drink.cup.id),rate:.06};
  if(candidate){p.eligibleCount++;const random=options.random||Math.random;
   if(options.incidents!==false&&p.incidentCount<1&&p.eligibleCount-p.lastIncidentAt>=6&&random()<candidate.rate){
    const i={...candidate,at:elapsed,resolved:false};delete i.rate;
    if(i.kind==='overpour'){const cap=event.side==='large'?1.5:1;s.drink.cup.n=Math.min(cap,event.n+.125);i.requested=event.n;i.actual=s.drink.cup.n;i.ingredient=event.id;i.description='지거에 '+P.fmt(i.actual,'oz')+'가 담기고 작업대에도 흘렀습니다. 지거를 비워 다시 계량하고 흘린 곳을 닦으세요.';}
    if(i.kind==='shakerLeak'){
     s.drink.pours=s.drink.pours.filter(x=>x.location!=='shaker');s.drink.ice.shaker=false;s.drink.actions.pop();s.closed.shaker=false;s.capOff=false;p.shake={};i.description='음료가 쏟아져 혼합액과 얼음을 비웠습니다. 작업대를 닦고 셰이커를 헹군 뒤 얼음과 재료부터 다시 준비하세요.';
    }
    if(i.kind==='garnishDrop'){s.fruit=null;i.description='떨어진 장식은 사용할 수 없습니다. 버리고 새 과일로 다시 만드세요.';}
    if(i.kind==='foam'){s.drink=copy(input.drink);i.description='붓기를 멈췄습니다. 병을 세워 거품을 가라앉힌 뒤 천천히 다시 부으세요.';}
    p.incident=i;p.incidentCount++;p.lastIncidentAt=p.eligibleCount;
    // Replace the successful-action label when the operation was interrupted.
    if(['shakerLeak','foam'].includes(i.kind)){s.audit.at(-1).label=i.kind==='shakerLeak'?'셰이킹 중 쏟음 · 혼합액 폐기':'탄산을 붓다가 멈춤 · 아직 넣지 않음';}
    return {...practiceLog(s,{type:'incident',kind:i.kind},'돌발! '+i.title+' '+i.description,elapsed),incident:true};
   }
  }
  return {state:s,ok:true,message:r.message};
 }
 function trainingGrade(s){const g=grade(s),p=s.practice;if(!p)return g;
  const add=(key,label,expected,actual,ok)=>g.rows.push({key,label,expected,actual,ok:!!ok});
  add('prep-hands','작업 전 손 씻기','손 씻기 → 물기 닦기',p.prep.hands&&p.prep.dry?'완료':'미완료',p.prep.hands&&p.prep.dry);
  add('prep-attire','복장·액세서리','작업 전 확인',p.prep.attire?'확인함':'확인하지 않음',p.prep.attire);
  const checks=p.verified;
  if(checks.labels)add('label-show','기주 라벨 쇼잉','계량 전에 확인',checks.labels+'회 확인함',true);
  if(checks.measures)add('jigger-posture','계량 자세','지거 수평 · 몸 앞',checks.measures+'회 확인함',true);
  if(checks.shakes)add('shaker-grip','셰이커 확인','밀착 · 양손 파지 · 방향',checks.shakes+'회 확인함',true);
  if(checks.strains)add('strainer-hold','거르기','스트레이너 고정',checks.strains+'회 확인함',true);
  if(p.episodes.length||p.incident)add('incident-recovery','돌발 대처','상황을 수습하고 다시 준비',p.incident?'미수습: '+p.incident.title:p.episodes.map(i=>i.title+' 수습').join(' · '),!p.incident&&p.episodes.every(i=>i.resolved));
  g.correct=g.rows.filter(x=>x.ok).length;g.total=g.rows.length;g.passed=g.correct===g.total;return g;
 }

 Object.assign(precautionNames,{layout:'재료·도구 위치 확인',glassInspect:'잔의 금·이물 확인',ingredientRead:'재료명·라벨 확인',bottleOpen:'사용할 병만 열기',bottleClose:'병뚜껑 닫기',rinseJigger:'재료 바꾸기 전 지거 헹구기',toolInspect:'혼합 도구 안쪽 확인',iceTongs:'집게로 얼음 집기',boardStable:'도마가 밀리지 않게 고정',knifeHold:'손가락 오므리고 칼질 준비',garnishTongs:'장식은 집게·픽으로 잡기',stemHold:'잔의 스템·하단 잡기',finalReview:'잔·얼음·가니시 최종 확인',dryGlass:'잔 겉면 물기 닦기',closeBottles:'사용한 병뚜껑 닫기'});
 const expandedKeys=new Set(['layout','glassInspect','ingredientRead','bottleOpen','bottleClose','rinseJigger','toolInspect','iceTongs','boardStable','knifeHold','garnishTongs','stemHold','finalReview','dryGlass','closeBottles']);
 const newEpisodes=new Set(['glassChip','tongsDrop','wetBoard','corkBreak']);
 function expandedFresh(id){const s=trainingFresh(id);s.practice.version=2;s.practice.prep.layout=false;s.practice.extra={glassChecked:'',stemHeld:'',tools:{},iceTongs:false,boardStable:false,knifeHold:false,garnishTongs:false,finalReview:false,dryGlass:false,lastIngredient:null,rinses:0};return s;}
 function prepKeys(s){return s.practice?.version===2?[...preparation,'layout']:preparation;}
 function fullyPrepared(s){return prepared(s)&&(s.practice?.version!==2||s.practice.prep.layout);}
 function expandedRequirements(s,e){const old=requirements(s,e);if(s.practice?.version!==2)return old;const p=s.practice,x=p.extra,d=s.drink;
  if(productive.has(e.type)&&!fullyPrepared(s))return prepKeys(s).filter(k=>!p.prep[k]);
  const add=[];const b=p.bottles[e.id]||{};
  if(['chill','ice','pour','direct','transfer'].includes(e.type)&&d.glass&&x.glassChecked!==d.glass)add.push('glassInspect');
  if(e.type==='measure'||e.type==='direct'){
   if(!b.read)add.push('ingredientRead');if(!b.open&&e.id!=='sugar')add.push('bottleOpen');
   if(e.type==='measure'&&x.lastIngredient&&x.lastIngredient!==e.id)add.push('rinseJigger');
  }
  if(['ice','mix'].includes(e.type)&&d.vessel!=='glass'&&!x.tools[d.vessel])add.push('toolInspect');
  if(['chill','ice'].includes(e.type)&&!x.iceTongs)add.push('iceTongs');
  if(e.type==='cut'){if(!x.boardStable)add.push('boardStable');if(!x.knifeHold)add.push('knifeHold');}
  if(['pickFruit','addCherry','garnishFruit','wrap','twist'].includes(e.type)&&!x.garnishTongs)add.push('garnishTongs');
  if(['transfer','coaster'].includes(e.type)&&d.glass&&!['rocks','highball','collins'].includes(d.glass)&&x.stemHeld!==d.glass)add.push('stemHold');
  if(e.type==='submit'){if(!x.finalReview)add.push('finalReview');if(!x.dryGlass)add.push('dryGlass');if(Object.values(p.bottles).some(b=>b.open))add.push('closeBottles');}
  return [...new Set([...old,...add])];
 }
 function finishExtraEpisode(s,elapsed){const p=s.practice,i=p.incident;if(!i||!newEpisodes.has(i.kind))return;
  const done=i.kind==='glassChip'||i.kind==='corkBreak'?i.replaced:i.kind==='tongsDrop'?i.washed:i.knifeDown&&i.dried&&i.secured;
  if(done){p.episodes.push({...i,resolved:true,resolvedAt:elapsed});p.incident=null;practiceLog(s,{type:'incidentResolved',kind:i.kind},'돌발 수습 완료 · '+i.title,elapsed);}
 }
 function expandedApply(input,event,elapsed=0,options={}){
  if(input.practice?.version!==2)return trainingApply(input,event,elapsed,options);
  let s=copy(input),p=s.practice,x=p.extra,r;
  const fail=message=>practiceLog(s,event,message,elapsed,false);
  if(s.drink.submitted&&event.type!=='reset')return fail('이미 제출한 잔입니다. 다른 잔을 선택하세요.');
  if(event.type==='recover'&&newEpisodes.has(p.incident?.kind)){
   const i=p.incident;
   if(event.choice==='ignore')return fail('문제가 생긴 잔·도구·재료를 그대로 사용하지 말고 상태에 맞게 교체하거나 정리하세요.');
   if(event.choice==='replace'&&i.kind==='glassChip'){
    if(s.drink.pours.some(v=>v.location==='glass'))return fail('내용물이 든 잔은 먼저 비워 주세요.');
    i.replaced=true;s.drink.chilled=false;s.drink.ice.glass=false;x.glassChecked='';x.stemHeld='';
    r=practiceLog(s,event,'감독관에게 알리고 같은 종류의 새 잔으로 교체 · 다시 점검하고 칠링',elapsed);
   }else if(event.choice==='replace'&&i.kind==='corkBreak'){
    i.replaced=true;p.bottles[i.ingredient]={};r=practiceLog(s,event,'코르크가 부서진 병은 사용 중지 · 감독관에게 같은 재료의 병 교체 요청',elapsed);
   }else if(event.choice==='wash-tongs'&&i.kind==='tongsDrop'){
    r=apply(s,{type:'move',key:'t:tongs',zone:'sink',x:17,y:81},elapsed);if(r.ok)r=apply(r.state,{type:'wash',key:'t:tongs'},elapsed);if(r.ok)r.state.practice.incident.washed=true;
   }else if(event.choice==='knife-down'&&i.kind==='wetBoard'){i.knifeDown=true;r=practiceLog(s,event,'칼을 안전하게 내려놓고 칼질을 멈췄습니다.',elapsed);}
   else if(event.choice==='dry-board'&&i.kind==='wetBoard'){if(!i.knifeDown)return fail('칼을 먼저 안전하게 내려놓으세요.');r=apply(s,{type:'wipe',key:'t:board'},elapsed);if(r.ok)r.state.practice.incident.dried=true;}
   else if(event.choice==='secure-board'&&i.kind==='wetBoard'){if(!i.dried)return fail('도마의 물기를 먼저 닦으세요.');i.secured=true;x.boardStable=true;r=practiceLog(s,event,'도마 받침을 고정하고 흔들리지 않는지 다시 확인',elapsed);}
   else return fail('현재 상황에 맞는 수습을 고르세요.');
   if(!r.ok)return r;s=r.state;finishExtraEpisode(s,elapsed);return {state:s,ok:true,message:s.practice.incident?r.message:'수습 완료 · 필요한 준비부터 다시 진행하세요.'};
  }
  if(p.incident&&productive.has(event.type))return fail('돌발 상황을 먼저 수습하세요: '+p.incident.title);
  if(event.type==='precaution'&&expandedKeys.has(event.key)){
   const k=event.key;
   if(k==='layout')p.prep.layout=true;
   else if(['ingredientRead','bottleOpen','bottleClose'].includes(k)){
    if(!D.ingredients[event.id])return fail('병을 먼저 고르세요.');const b=p.bottles[event.id]||(p.bottles[event.id]={});if(k==='ingredientRead')b.read=true;else b.open=k==='bottleOpen';
   }else if(k==='rinseJigger'){
    if(s.drink.cup)return fail('지거에 든 재료를 먼저 붓거나 비우세요.');
    r=apply(s,{type:'move',key:'t:jigger',zone:'sink',x:17,y:81},elapsed);if(r.ok)r=apply(r.state,{type:'wash',key:'t:jigger'},elapsed);if(!r.ok)return r;s=r.state;p=s.practice;x=p.extra;x.lastIngredient=null;x.rinses++;
    const o=O.byKey['t:jigger'];r=apply(s,{type:'move',key:o.key,zone:'home',x:o.x,y:o.y},elapsed);s=r.state;p=s.practice;x=p.extra;
   }else if(k==='glassInspect'){if(!s.drink.glass)return fail('점검할 잔을 먼저 고르세요.');x.glassChecked=s.drink.glass;}
   else if(k==='stemHold'){if(!s.drink.glass)return fail('제공 잔을 먼저 고르세요.');x.stemHeld=s.drink.glass;}
   else if(k==='toolInspect')x.tools[s.drink.vessel]=true;
   else if(k==='closeBottles')Object.values(p.bottles).forEach(b=>b.open=false);
   else if(k==='dryGlass'){if(!s.drink.glass)return fail('제공 잔을 먼저 고르세요.');r=apply(s,{type:'wipe',key:'g:'+s.drink.glass},elapsed);if(!r.ok)return r;s=r.state;p=s.practice;x=p.extra;x.dryGlass=true;}
   else x[k]=true;
   r=practiceLog(s,event,(event.id?D.ingredients[event.id][0]+' · ':'')+precautionNames[k]+' ✓',elapsed);
  }else{
   const needed=expandedRequirements(s,event);if(needed.length)return {...fail('먼저 확인: '+needed.map(k=>precautionNames[k]||'병을 잡는 방법').join(' · ')),needs:needed};
   r=trainingApply(s,event,elapsed,options);if(!r.ok)return r;s=r.state;p=s.practice;x=p.extra;
   if(event.type==='reset'){p.extra=expandedFresh(s.drink.id).practice.extra;return r;}
   if(event.type==='measure')x.lastIngredient=event.id;
   if(event.type==='wash'&&event.key==='t:jigger'){x.lastIngredient=null;x.rinses++;}
   if(event.type==='fruitStart'){x.knifeHold=false;x.garnishTongs=false;}
   if(event.type==='glass'){x.dryGlass=false;x.finalReview=false;}
   if(productive.has(event.type)&&event.type!=='submit'){x.finalReview=false;x.dryGlass=false;}
   if(r.incident||p.incident)return r;
  }
  let candidate=null;
  if(event.type==='precaution'&&event.key==='glassInspect'&&!s.drink.pours.some(v=>v.location==='glass'))candidate={kind:'glassChip',title:'잔 가장자리에 금이 보여요!',anchor:'g:'+s.drink.glass,rate:.03,description:'입에 닿는 부분이 손상된 잔입니다. 사용하지 말고 감독관에게 알린 뒤 같은 종류의 새 잔으로 교체하세요.'};
  if(event.type==='precaution'&&event.key==='bottleOpen'&&['appleBrandy','drambuie'].includes(event.id))candidate={kind:'corkBreak',title:'코르크가 부스러졌어요!',anchor:'b:'+event.id,ingredient:event.id,rate:.035,description:'부스러진 코르크가 병 안으로 들어갔습니다. 걸러서 쓰지 말고 감독관에게 재료 교체를 요청하세요.'};
  if(['chill','ice'].includes(event.type)&&!event.crushed)candidate={kind:'tongsDrop',title:'집게가 바닥에 떨어졌어요!',anchor:'t:tongs',rate:.025,description:'얼음을 옮기기 전에 집게를 놓쳤습니다. 떨어진 집게를 싱크대에서 세척한 뒤 다시 얼음을 집으세요.'};
  if(event.type==='cut')candidate={kind:'wetBoard',title:'젖은 도마가 밀려요!',anchor:'t:board',rate:.025,description:'칼질을 멈추세요. 칼을 내려놓고 도마 물기를 닦은 뒤 받침을 고정해야 합니다.'};
  if(candidate){p.eligibleCount++;if(options.incidents!==false&&p.incidentCount<1&&p.eligibleCount-p.lastIncidentAt>=6&&(options.random||Math.random)()<candidate.rate){
   const i={...candidate,at:elapsed,resolved:false};delete i.rate;
   if(i.kind==='tongsDrop'){s.drink=copy(input.drink);x.iceTongs=false;s.audit.at(-1).label='집게를 떨어뜨려 얼음 넣기 중지';}
   if(i.kind==='wetBoard'){s.fruit=copy(input.fruit);x.boardStable=false;s.audit.at(-1).label='도마가 밀려 칼질 중지';}
   if(i.kind==='glassChip')x.glassChecked='';if(i.kind==='corkBreak')p.bottles[event.id].open=false;
   p.incident=i;p.incidentCount++;p.lastIncidentAt=p.eligibleCount;
   return {...practiceLog(s,{type:'incident',kind:i.kind},'돌발! '+i.title+' '+i.description,elapsed),incident:true};
  }}
  return {...r,state:s};
 }
 function expandedGrade(s){const g=trainingGrade(s);if(s.practice?.version!==2)return g;const p=s.practice,x=p.extra;
  const add=(key,label,expected,actual,ok)=>g.rows.push({key,label,expected,actual,ok:!!ok});
  add('station-location','재료·도구 위치','시작 전에 확인',p.prep.layout?'확인함':'미확인',p.prep.layout);
  add('glass-inspection','잔 점검','금·이물 없는 잔',x.glassChecked===s.drink.glass?'확인함':'미확인',!!s.drink.glass&&x.glassChecked===s.drink.glass);
  add('final-review','제출 전 점검','잔·얼음·가니시 및 겉면 물기',x.finalReview&&x.dryGlass?'완료':'미완료',x.finalReview&&x.dryGlass);
  add('bottle-caps','병 마무리','사용한 병의 뚜껑 닫기',Object.values(p.bottles).some(b=>b.open)?'열린 병 있음':'닫음',!Object.values(p.bottles).some(b=>b.open));
  if(x.rinses)add('jigger-rinse','재료 교체 시 세척','빈 지거를 헹구기',x.rinses+'회 헹굼',true);
  g.correct=g.rows.filter(row=>row.ok).length;g.total=g.rows.length;g.passed=g.correct===g.total;return g;
 }

 // Reactions depend only on actions and outcomes, never elapsed time.
 function examinerReaction(before,event,result,previous={kind:'neutral',label:''}){
  const s=result.state,c=recipe(s.drink.id),d=s.drink;
  if(s.practice?.incident)return {kind:'incident',label:'돌발 상황을 확인하는 중'};
  if(!result.ok)return {kind:'mistake',label:result.needs?.length?'필수 동작을 확인하세요':'작업을 멈추고 확인하세요'};
  if(before.practice?.incident&&!s.practice?.incident)return {kind:'attention',label:'수습 과정을 확인했어요'};
  if(event.type==='submit')return {kind:'submission',label:'제출한 음료를 확인하는 중'};
  if(event.type==='glass'&&d.glass!==c.glass)return {kind:'mistake',label:'잔 선택을 다시 확인하세요'};
  const same=(a,b)=>a===b||[a,b].every(id=>['orangeLiqueur','tripleSec'].includes(id));
  if(['measure','direct','spoon','dash','pour'].includes(event.type)){
   const id=event.id||before.drink.cup?.id;
   const expected=c.ingredients.find(i=>same(i.id,id));
   if(id&&!expected)return {kind:'mistake',label:'이 메뉴의 재료인지 확인하세요'};
   if(expected&&expected.verified!==false){
    const wanted=P.parse(expected.amount),pours=(d.pours||[]).filter(p=>same(p.id,id));
    const filled=d.cup&&same(d.cup.id,id)?d.cup:null;
    const total=pours.filter(p=>p.unit===wanted.unit).reduce((n,p)=>n+p.n,0)+(filled?.unit===wanted.unit?filled.n:0);
    if(wanted?.n>0&&total>wanted.n+0.001)return {kind:'mistake',label:'계량이 레시피보다 많아요'};
   }
  }
  if(event.type==='mix'){
   const methods=c.method.split('/');
   if(!methods.includes(event.method))return {kind:'mistake',label:'조주법을 다시 확인하세요'};
  }
  if(['move','undoMove','vessel','note'].includes(event.type))return previous;
  return {kind:'neutral',label:''};
 }

 return {examinerReaction,fresh,trainingFresh:expandedFresh,apply:expandedApply,grade:expandedGrade,onWork,fruitNames,forms,requirements:expandedRequirements,prepared:fullyPrepared,precautionNames,prepKeys};
});
