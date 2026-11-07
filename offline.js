(() => {
 const el=document.getElementById('offline-status');
 if(location.protocol==='file:'){el.textContent='로컬 파일 모드 · 실행 파일 이용 권장';return;}
 if(!('serviceWorker' in navigator)){el.textContent='로컬 서버로 오프라인 사용 가능';return;}
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>{
   el.textContent='✓ 오프라인 준비 완료';
 }).catch(()=>{el.textContent='로컬 서버 실행 중 · 캐시 사용 불가';});
})();
