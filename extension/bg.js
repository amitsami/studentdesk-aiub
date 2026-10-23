/* Public-only background transport. Safari's dedicated build uses a nonpersistent
   document with native XHR; Chrome uses fetch from its service worker.
   No cookies, private portal URLs, third-party proxy, or stored student data. */
(function(){
  "use strict";
  var promiseAPI=typeof browser!=="undefined"&&browser.runtime;
  var api=promiseAPI?browser:chrome, inflight=Object.create(null), LIMIT=4*1024*1024;
  function allowed(value){try{var u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&(u.origin==="https://www.aiub.edu"||u.origin==="https://api.open-meteo.com");}catch(e){return false;}}
  function responseError(code,message){return {code:code,err:message};}
  function request(url){
    if(inflight[url])return inflight[url];
    var job=new Promise(function(resolve){
      var done=false,timer,req,ctl;
      function finish(value){if(done)return;done=true;clearTimeout(timer);resolve(value);}
      timer=setTimeout(function(){finish(responseError("PUBLIC_TIMEOUT","Public page did not respond within 6 seconds"));try{if(req)req.abort();if(ctl)ctl.abort();}catch(e){}},6000);
      if(typeof XMLHttpRequest!=="undefined"){
        try{
          req=new XMLHttpRequest();req.open("GET",url,true);req.timeout=5800;req.withCredentials=false;
          req.onprogress=function(e){if(e.loaded>LIMIT){finish(responseError("PUBLIC_SIZE","Public page exceeds the safe size limit"));req.abort();}};
          req.onload=function(){if(req.responseURL&&!allowed(req.responseURL)){finish(responseError("PUBLIC_REDIRECT","Public page redirected outside the allowed hosts"));return;}if(req.status<200||req.status>=400){finish(responseError("PUBLIC_HTTP","Official server returned HTTP "+req.status));return;}var text=req.responseText;if(typeof text!=="string"||text.length>LIMIT){finish(responseError("PUBLIC_SIZE","Invalid or oversized public response"));return;}finish({text:text,via:"background-xhr"});};
          req.onerror=function(){finish(responseError("PUBLIC_NETWORK","Safari/background could not read the official public page"));};
          req.ontimeout=function(){finish(responseError("PUBLIC_TIMEOUT","Official public page timed out"));};
          req.onabort=function(){finish(responseError("PUBLIC_ABORT","Public request was cancelled"));};req.send();
        }catch(e){finish(responseError("PUBLIC_REQUEST",String(e&&e.message||e)));}
        return;
      }
      try{
        ctl=new AbortController();fetch(url,{credentials:"omit",cache:"no-store",signal:ctl.signal}).then(function(r){
          if(r.url&&!allowed(r.url))throw new Error("Redirect outside allowed public hosts");
          if(!r.ok)throw new Error("Official server returned HTTP "+r.status);
          var size=Number(r.headers.get("content-length"));if(size>LIMIT)throw new Error("Public page exceeds safe size limit");
          return r.text();
        }).then(function(text){finish(text.length>LIMIT?responseError("PUBLIC_SIZE","Public page exceeds safe size limit"):{text:text,via:"background-fetch"});},function(e){finish(responseError(e&&e.name==="AbortError"?"PUBLIC_TIMEOUT":"PUBLIC_NETWORK",String(e&&e.message||e)));});
      }catch(e){finish(responseError("PUBLIC_REQUEST",String(e&&e.message||e)));}
    });
    inflight[url]=job;job.then(function(){delete inflight[url];},function(){delete inflight[url];});return job;
  }
  api.runtime.onMessage.addListener(function(msg,sender,reply){
    if(!msg||msg.t!=="xget")return;
    if(sender&&sender.id&&api.runtime.id&&sender.id!==api.runtime.id)return;
    var task=typeof msg.url==="string"&&allowed(msg.url)?request(msg.url):Promise.resolve(responseError("PUBLIC_URL","Only approved public HTTPS hosts may be read"));
    if(promiseAPI)return task;
    task.then(reply,function(){reply(responseError("PUBLIC_REQUEST","Public request failed"));});return true;
  });
})();
