/* Official AIUB public-page bridge. Runs only in a frame requested by the portal.
   Shares only public notice text with its verified portal parent; no private portal
   data is sent to aiub.edu. The temporary offscreen frame is removed after extraction or timeout. */
(function () {
  "use strict";
  if (location.origin !== "https://www.aiub.edu" || window.parent === window) return;
  var PARENT = "https://portal.aiub.edu";
  function text(e) { return e ? e.textContent.replace(/\s+/g," ").trim() : ""; }
  function noticePath(href) { try { var u=new URL(href,location.href); return u.origin===location.origin && /^\/[\w\-\/.%]+$/.test(u.pathname) ? u.pathname : ""; } catch(e) { return ""; } }
  function extract() {
    var items=[];
    document.querySelectorAll(".notification").forEach(function(n) {
      var a=n.closest("a[href]") || n.querySelector("a[href]"), path=a && noticePath(a.getAttribute("href"));
      if (!path || /^\/category\//.test(path)) return;
      var date=text(n.querySelector(".date-custom")).split(/\s+/);
      items.push({u:path,title:text(n.querySelector(".title")).slice(0,2000),desc:text(n.querySelector(".desc")).slice(0,4000),day:date[0]||"",mon:date[1]||"",year:date[2]||""});
    });
    if (items.length) {
      var last=1;document.querySelectorAll(".pagination a[href]").forEach(function(a){var m=/pageNo=(\d+)/.exec(a.getAttribute("href"));if(m)last=Math.max(last,Math.min(1000,+m[1]));});
      return {kind:"list",items:items.slice(0,100),last:last};
    }
    var columns=document.querySelectorAll(".col-md-8 .question-column"),body=columns.length>1?columns[1]:columns[0];
    if (!body || /^\/category\//.test(location.pathname)) return null;
    // Remove active elements here; the parent independently sanitizes again.
    var clone=body.cloneNode(true);clone.querySelectorAll("script,style,iframe,object,embed,form,input,button,link,meta").forEach(function(e){e.remove();});
    return {kind:"detail",title:text(document.querySelector("#dynamicHeading")||document.querySelector("h1")).slice(0,2000),date:text(document.querySelector(".date-box")).slice(0,120),body:clone.innerHTML.slice(0,600000)};
  }
  function send() {var data=extract();if(data)window.parent.postMessage({t:"studentdesk:public-notice:v1",path:location.pathname,search:location.search,data:data},PARENT);}
  window.addEventListener("message",function(e){if(e.origin!==PARENT || e.source!==window.parent || !e.data || e.data.t!=="studentdesk:read-public:v1")return;send();});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",send,{once:true});else send();
})();
