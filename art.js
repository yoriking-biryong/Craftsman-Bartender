/* Original code-drawn study diagrams. Shapes illustrate categories, not official sizes. */
(function(root){
 const shapes={
  cocktail:'M29 32 L91 32 L60 74 Z M60 74 V111 M42 112 H78',
  rocks:'M33 54 L37 112 Q60 119 83 112 L87 54 Z',
  highball:'M39 25 L42 114 Q60 118 78 114 L81 25 Z',
  collins:'M42 17 L44 114 Q60 118 76 114 L78 17 Z',
  pilsner:'M36 22 Q37 71 52 88 L52 102 Q52 107 60 107 Q68 107 68 102 L68 88 Q83 71 84 22 Z M60 107 V116 M42 118 H78',
  liqueur:'M44 42 L47 77 Q60 91 73 77 L76 42 Z M60 84 V112 M45 114 H75',
  sherry:'M41 38 Q43 75 60 83 Q77 75 79 38 Z M60 83 V112 M42 114 H78',
  sour:'M36 35 Q39 73 60 80 Q81 73 84 35 Z M60 80 V109 M41 112 H79',
  saucer:'M25 44 Q27 69 60 69 Q93 69 95 44 Z M60 69 V110 M40 113 H80',
  wine:'M39 26 Q21 78 60 84 Q99 78 81 26 Z M60 84 V111 M40 114 H80',
  flute:'M45 18 L46 73 Q46 87 60 89 Q74 87 74 73 L75 18 Z M60 89 V112 M44 115 H76'
 };
 let serial=0;
 function glass(type,color='#d4dfe5',garnish='none',filled=true,showIce=true){
  const id='drink-'+(++serial),path=shapes[type]||shapes.cocktail;
  const cherry='<path d="M83 30 Q83 18 91 16" fill="none" stroke="#5c825d" stroke-width="2"/><circle cx="81" cy="34" r="6" fill="#c66d6f"/>';
  const citrus='<circle cx="78" cy="29" r="12" fill="'+(garnish==='orangeCherry'?'#efb765':'#f7df91')+'" stroke="#d7b66b" stroke-width="2"/><path d="M78 17v24m-12-12h24m-20-8 16 16m0-16-16 16" stroke="#fff5ce" stroke-width="1.5"/>';
  const pineapple='<path d="M66 13L90 21L70 40Z" fill="#e5c66d" stroke="#b69a45" stroke-width="1.5"/><path d="M69 17l12 5m-12 2 8 3m-8 3 4 2" stroke="#f9e8a3" stroke-width="1.5"/>';
  let g='';
  if(filled){
    if(garnish==='cherry')g=cherry;
    else if(['orangeCherry','lemonCherry'].includes(garnish))g=citrus+cherry;
    else if(['pineappleCherry','maiTai'].includes(garnish))g=pineapple+cherry;
    else if(garnish==='olive')g='<path d="M44 48 L86 22" stroke="#aa936c" stroke-width="2"/><ellipse cx="65" cy="35" rx="7" ry="5" fill="#8d9c64"/>';
    else if(garnish.includes('Twist'))g='<path d="M80 26 Q99 29 82 37 Q71 44 88 48" stroke="'+(garnish==='orangeTwist'?'#dda049':'#e3c354')+'" fill="none" stroke-width="4" stroke-linecap="round"/>';
    else if(garnish==='nutmeg')g='<path d="M50 47h1m8-3h1m9 3h1m-5 5h1" stroke="#a77953" stroke-width="3"/>';
    else if(garnish==='apple')g='<path d="M69 18Q94 19 93 44L69 18Z" fill="#f3dfb0" stroke="#b96a69" stroke-width="2.5"/>';
    else if(garnish.includes('Wedge'))g='<path d="M68 17L95 29Q84 46 68 17Z" fill="#f3dc8a" stroke="#bfa753" stroke-width="2"/>';
    else if(garnish!=='none'&&garnish!=='salt')g=citrus;
  }
  const layers=filled&&['liqueur','sherry'].includes(type)?'<rect x="20" y="45" width="80" height="13" fill="#bf874d"/><rect x="20" y="58" width="80" height="13" fill="'+(type==='liqueur'?'#639a68':'#d5b68c')+'"/><rect x="20" y="71" width="80" height="18" fill="'+(type==='liqueur'?'#bc5165':'#775041')+'"/>':'';
  return '<svg viewBox="0 0 120 140" class="glass-art" aria-hidden="true"><defs><clipPath id="'+id+'"><path d="'+path+'"/></clipPath></defs><ellipse cx="60" cy="125" rx="32" ry="5" fill="#76552a12"/><path d="'+path+'" fill="#ffffff9c" stroke="#827b65" stroke-width="2.1" stroke-linejoin="round"/><g clip-path="url(#'+id+')"><rect x="20" y="'+(type==='rocks'?70:type==='saucer'?51:45)+'" width="80" height="70" fill="'+(filled?color:'#eee9d9')+'" opacity=".85"/>'+layers+(filled&&showIce&&['rocks','highball','collins','pilsner'].includes(type)?'<path d="M46 69l14-3 3 14-14 3zM61 87l13 3-3 14-13-3z" fill="#fff5" stroke="#fff9"/>':'')+'<path d="M45 25l3 72" stroke="#fff" stroke-width="3" opacity=".6"/></g><path d="'+path+'" fill="none" stroke="#827b65" stroke-width="2" stroke-linejoin="round"/>'+g+(garnish==='salt'&&filled?'<path d="M29 31H91" stroke="#e8e6d9" stroke-width="5" stroke-dasharray="2 2"/>':'')+'</svg>';
 }
 function ingredient(id){
   if(root.JojuBottles&&root.JojuBottleData?.[id])return root.JojuBottles.photo(id);
   const x=root.JojuData.ingredients[id],color=x?.[3]||'#b8b193',type=x?.[2];
   if(id==='freshLemon')return '<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="86" rx="26" ry="4" fill="#76552a12"/><path d="M26 45Q28 22 49 25Q80 25 78 54Q76 76 51 75Q24 75 26 45Z" fill="#e4cb63"/><circle cx="60" cy="57" r="23" fill="#f8e9a6" stroke="#d6bb4f" stroke-width="3"/><path d="M60 35v44m-22-22h44m-38-16 32 32m0-32-32 32" stroke="#fff9d6" stroke-width="2"/></svg>';
   if(id==='sugar')return '<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="85" rx="26" ry="4" fill="#76552a12"/><path d="M27 49Q27 82 50 82Q73 82 73 49Z" fill="#e6e9e6" stroke="#a8b3b6" stroke-width="2"/><ellipse cx="50" cy="49" rx="23" ry="8" fill="#faf8ed" stroke="#a8b3b6" stroke-width="2"/><path d="M33 48Q50 29 67 48" fill="#fffdf3"/></svg>';
   if(type==='탄산')return '<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="88" rx="22" ry="4" fill="#76552a12"/><rect x="30" y="21" width="40" height="64" rx="8" fill="'+color+'"/><ellipse cx="50" cy="23" rx="20" ry="5" fill="#e9e4d7" stroke="#998b6d"/><path d="M45 23h10" stroke="#998b6d" stroke-width="3"/><path d="M37 34v41" stroke="#fff8" stroke-width="3"/><circle cx="50" cy="55" r="13" fill="#fff9"/><path d="M45 55h10m-5-5v10" stroke="'+color+'" stroke-width="2"/></svg>';
   return '<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="89" rx="24" ry="4" fill="#76552a12"/><path d="M41 15H59V33Q59 38 69 43V82Q69 87 64 87H36Q31 87 31 82V43Q41 38 41 33Z" fill="'+color+'" stroke="#81745055" stroke-width="1.5"/><rect x="40" y="11" width="20" height="11" rx="3" fill="#68684e"/><path d="M37 47v32" stroke="#ffffff66" stroke-width="4" stroke-linecap="round"/><rect x="32" y="48" width="36" height="27" rx="2" fill="#f8f7ed"/><path d="M40 56h20m-16 6h12m-9 6h6" stroke="'+color+'" stroke-width="3" stroke-linecap="round"/></svg>';
 }
 function logo(){return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 10h22L20 23Z M20 23v10M13 33h14" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="m23 15 9-10" stroke="currentColor" stroke-width="1.5"/><circle cx="28" cy="10" r="3" fill="#d1b55c"/></svg>';}
 function hero(){
  const framed=(type,color,garnish,x,y,w,h)=>glass(type,color,garnish).replace('<svg viewBox=',`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox=`);
  return '<svg class="bar-illustration" viewBox="0 0 520 280" aria-hidden="true"><path d="M140 252V128a110 110 0 0 1 220 0v124Z" fill="#dfdfc9"/><circle cx="375" cy="104" r="69" fill="#edc7aa"/><path d="M65 254H473" stroke="#9b8b70" stroke-width="2"/><path d="M62 264H475" stroke="#d1c3ac" stroke-width="1"/>'+framed('cocktail','#d69664','citrusTwist',171,31,196,221)+framed('rocks','#c18750','orangeTwist',327,114,132,145)+'<g stroke="#82775e" stroke-width="2" stroke-linejoin="round"><path d="M92 94h23v40q0 10 14 16v90q0 9-9 9H87q-9 0-9-9v-90q14-6 14-16Z" fill="#b6bb8e"/><rect x="91" y="84" width="25" height="17" rx="3" fill="#657054"/><rect x="81" y="165" width="45" height="47" rx="2" fill="#f8efdb"/><path d="M91 180h24m-20 9h16m-15 9h14" stroke="#9b9775"/><path d="M156 184h49l-15 33 15 32h-49l15-32Z" fill="#d8c7a9"/><path d="M164 198h33m-32 39h32" stroke="#ae9a78"/></g><g transform="translate(409 42) rotate(18)"><path d="M0 0v24M-12 12h24" stroke="#bd724e" stroke-width="1.5"/></g><g transform="translate(150 62)"><path d="M0 0v16M-8 8h16" stroke="#9c9f76" stroke-width="1.5"/></g><ellipse cx="305" cy="252" rx="29" ry="8" fill="#d1b280"/><path d="M279 250q25-29 51 0Z" fill="#efcf83" stroke="#ac925c" stroke-width="1.5"/><path d="M305 232v18m-13-15 13 15m13-15-13 15" stroke="#fff1c6" stroke-width="1.5"/></svg>';
 }
 root.JojuArt={glass,ingredient,logo,hero};
})(globalThis);
