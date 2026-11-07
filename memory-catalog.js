(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.JojuMemoryCatalog=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const groups=[
  {id:'first',label:'먼저 외운 9종',numbers:[2,4,11,10,40,9,22,5,28]},
  {id:'zero',label:'논알코올 2종',numbers:[38,39]},
  {id:'vodka',label:'보드카 5종',numbers:[7,26,18,25,19]},
  {id:'rum',label:'럼 6종',numbers:[24,29,23,16,12,15]}
 ];
 const numbers=groups.flatMap(g=>g.numbers);
 const notes={'jj-38':'lemon-squash','jj-39':'virgin-punch','jj-07':'black-russian','jj-26':'moscow-mule','jj-18':'seabreeze','jj-25':'cosmopolitan','jj-19':'apple-martini','jj-24':'pina-colada','jj-29':'blue-hawaiian','jj-23':'mai-tai','jj-16':'cuba-libre','jj-12':'daiquiri','jj-15':'bacardi'};
 return {groups,numbers,notes};
});
