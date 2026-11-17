// Python-futtató kezelő a tananyag kódfeladataihoz – a DKT 1.1 runner.js-éből: egy Worker, futás közben nincs új indítás,
// 5 mp futási / 90 mp betöltési korlát, 60 mp tétlenség után felszabadítás. Kiegészítés: segédfájlok átadása.
(function(root){
'use strict';
function createRunner(options={}){
 // fájlként (file://) megnyitva külön fájlból nem indítható Worker: ha az oldal betöltötte a pyworker.js-t, a függvény szövegéből Blob-Worker készül
 const blobWorker=()=>new Worker(URL.createObjectURL(new Blob(['('+root.TPyWorkerFo.toString()+')()'],{type:'text/javascript'})));
 const create=options.workerFactory||(()=>{if(root.TPyWorkerFo&&(root.location||{}).protocol==='file:')return blobWorker();try{return new Worker(options.workerUrl||'pyworker.js?v=1');}catch(e){if(root.TPyWorkerFo)return blobWorker();throw e;}});
 const setTimer=options.setTimeout||setTimeout,clearTimer=options.clearTimeout||clearTimeout;
 const loadTimeout=options.loadTimeout??90000,runTimeout=options.runTimeout??5000,idleTimeout=options.idleTimeout??60000;
 const byteLimit=65536,encoder=new TextEncoder();
 let worker=null,ready=false,pending=null,timer=null,idleTimer=null,sequence=0;
 function clear(){if(timer!==null)clearTimer(timer);timer=null;}
 function clearIdle(){if(idleTimer!==null)clearTimer(idleTimer);idleTimer=null;}
 function terminate(){clear();clearIdle();if(worker)worker.terminate();worker=null;ready=false;}
 function fail(message){const request=pending;pending=null;terminate();if(request)request.reject(new Error(message));}
 function send(){const request=pending;if(!request||!worker||!ready)return;clear();request.onState('running');timer=setTimer(()=>fail('A futtatás 5 másodperc után leállt. Ellenőrizd a ciklusokat!'),runTimeout);try{worker.postMessage({type:'run',id:request.id,code:request.code,inputs:request.inputs,files:request.files||null});}catch(e){fail('A program nem indítható: '+String(e));}}
 function start(){
  try{worker=create();}catch(e){fail('A Python futtató nem indult el ebben a böngészőben. Nyisd meg az oldalt Chrome-ban vagy Edge-ben!');return;}
  const instance=worker;
  worker.onmessage=({data:d})=>{
   if(instance!==worker)return;
   if(d.type==='ready'){ready=true;send();}
   else if(d.type==='done'&&pending&&d.id===pending.id){clear();const request=pending;pending=null;if(d.recycle)terminate();else idleTimer=setTimer(terminate,idleTimeout);request.resolve({output:d.output||'',error:d.error||null});}
   else if(d.type==='error')fail('A Python futtató hibája: '+String(d.message));
  };
  worker.onerror=()=>{if(instance===worker)fail('A Python futtató nem tölthető be vagy váratlanul leállt. Ellenőrizd az internetkapcsolatot!');};
 }
 return {
  run(code,inputs=[],onState=()=>{},files=null){
   if(pending)return Promise.reject(new Error('Már folyamatban van egy futtatás.'));
   if(typeof code!=='string'||code.length>byteLimit||encoder.encode(code).length>byteLimit)return Promise.reject(new Error('A program legfeljebb 64 KiB lehet.'));
   if(!Array.isArray(inputs)||inputs.length>byteLimit)return Promise.reject(new Error('A bemenet legfeljebb 64 KiB lehet.'));
   let inputBytes=0;for(const line of inputs){if(typeof line!=='string'||line.length>byteLimit||(inputBytes+=encoder.encode(line).length+1)>byteLimit)return Promise.reject(new Error('A bemenet legfeljebb 64 KiB lehet.'));}
   clearIdle();
   return new Promise((resolve,reject)=>{pending={id:++sequence,code,inputs,onState,resolve,reject,files};if(ready&&worker){send();return;}onState('loading');timer=setTimer(()=>fail('A Python betöltése 90 másodpercen belül nem sikerült.'),loadTimeout);if(!worker)start();});
  },
  cancel(reason='A futtatás megszakadt.'){fail(reason);},
  dispose(){fail('A Python futtató leállt.');},
  get busy(){return pending!==null;},
  get loaded(){return ready;}
 };
}
if(typeof module!=='undefined'&&module.exports)module.exports={createRunner};else root.TPyRunner={createRunner};
})(typeof window==='undefined'?globalThis:window);
