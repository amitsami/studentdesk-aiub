/* Public-page cache bridge. No portal records or credentials are stored here.
 * The cache can only be written by our content script on the official site.
 * All HTML is independently sanitized by the portal reader before display. */
(function () {
  "use strict";
  var promiseAPI = typeof browser !== "undefined" && browser.runtime, api = promiseAPI ? browser : chrome;
  function origin(url) { try { return new URL(url).origin; } catch (e) { return ""; } }
  function pathName(path) { return path.split("?")[0].replace(/\/+$/, "") || "/"; }
  function validPath(path) { return typeof path === "string" && /^\/[\w/%.?-][\w/%.?=&-]*$/.test(path) && path.length < 1500 && !path.startsWith("//"); }
  function get(key) {
    if (!api.storage || !api.storage.local) return Promise.resolve({});
    if (promiseAPI) return api.storage.local.get(key);
    return new Promise(function (resolve,reject) { api.storage.local.get(key, function(v){if(api.runtime.lastError)reject(Error(api.runtime.lastError.message));else resolve(v);}); });
  }
  function set(value) {
    if (!api.storage || !api.storage.local) return Promise.reject(Error("Extension storage unavailable"));
    if (promiseAPI) return api.storage.local.set(value);
    return new Promise(function (resolve,reject) { api.storage.local.set(value, function(){if(api.runtime.lastError)reject(Error(api.runtime.lastError.message));else resolve();}); });
  }
  api.runtime.onMessage.addListener(function (msg, sender, reply) {
    if (!msg || !/^sd-public-cache-(get|put)$/.test(msg.t)) return;
    if (sender && sender.id && api.runtime.id && sender.id !== api.runtime.id) return;
    var from = origin(sender && sender.url || sender && sender.tab && sender.tab.url);
    var task;
    if (!validPath(msg.path)) task = Promise.resolve({err:"Invalid public path"});
    else if (msg.t === "sd-public-cache-put") {
      if (from !== "https://www.aiub.edu" || !sender || !sender.url || pathName(new URL(sender.url).pathname) !== pathName(msg.path)) return;
      var data = msg.data, raw;
      try { raw = JSON.stringify(data); } catch (e) { return; }
      if (!data || !["list","detail"].includes(data.kind) || raw.length > 1000000) return;
      var value = {}; value["sd.public."+msg.path] = {at:Date.now(),data:data};
      task = set(value).then(function () { return {ok:true}; });
    } else {
      if (from !== "https://portal.aiub.edu") return;
      var key = "sd.public."+msg.path;
      task = get(key).then(function (v) { return {cached:v[key] || null}; });
    }
    if (promiseAPI) return task.catch(function (e) { return {err:e.message}; });
    task.then(reply, function (e) { reply({err:e.message}); }); return true;
  });
})();