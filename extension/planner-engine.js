/* StudentDesk 4 · deterministic, local academic planning. No external AI calls.
 * Official prerequisites are evidence, not permission to register. Unknown stays unknown. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.StudentDeskPlanner = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function code(v) { return String(v || "").toUpperCase().replace(/[\s.-]/g, ""); }
  function name(v) { return String(v || "").toUpperCase().replace(/&/g, " AND ").replace(/[^A-Z0-9]+/g, " ").trim(); }
  function passed(c) {
    var grades = (c.tries || []).map(function (t) { return String(t.g || "").trim().toUpperCase(); });
    if (!grades.length) grades = [String(c.grade || "").trim().toUpperCase()];
    return grades.some(function (g) { return /^(A\+?|A-|B\+?|B-|C\+?|C-|D\+?|D-|P|PASS|S|EX|TR)$/.test(g); }) ||
      (!c.grade && !grades.some(Boolean) && c.status === "done");
  }
  function match(course, catalog) {
    var byCode = catalog.filter(function (c) { return code(c.code) === code(course.code); });
    if (byCode.length === 1) return byCode[0];
    var byName = catalog.filter(function (c) { return name(c.name) === name(course.name); });
    return byName.length === 1 ? byName[0] : null;
  }
  function check(rule, completed, credits) {
    if (!rule || rule.type === "unknown") return { state: "unknown", missing: [], reason: "Prerequisite not verified in the selected official source." };
    if (rule.type === "none") return { state: "eligible", missing: [] };
    if (rule.type === "course") return { state: completed.has(code(rule.code)) ? "eligible" : "blocked", missing: completed.has(code(rule.code)) ? [] : [rule.code] };
    if (rule.type === "credits") return {
      state: credits == null ? "unknown" : credits >= rule.min ? "eligible" : "blocked",
      missing: credits == null || credits < rule.min ? [rule.min + " completed credits"] : []
    };
    if (!Array.isArray(rule.items) || !rule.items.length) return { state: "unknown", missing: [] };
    var results = rule.items.map(function (r) { return check(r, completed, credits); });
    if (rule.type === "any") {
      if (results.some(function (r) { return r.state === "eligible"; })) return { state: "eligible", missing: [] };
      return { state: results.some(function (r) { return r.state === "unknown"; }) ? "unknown" : "blocked",
        missing: ["One of: " + results.map(function (r) { return r.missing.join(" + "); }).join(" / ")] };
    }
    if (rule.type !== "all") return { state: "unknown", missing: [] };
    return { state: results.some(function (r) { return r.state === "blocked"; }) ? "blocked" : results.some(function (r) { return r.state === "unknown"; }) ? "unknown" : "eligible",
      missing: [].concat.apply([], results.map(function (r) { return r.missing; })) };
  }
  function refs(rule) {
    if (!rule) return [];
    if (rule.type === "course") return [code(rule.code)];
    return [].concat.apply([], (rule.items || []).map(refs));
  }
  function detectProgram(fields) {
    fields=fields||{};var keys=Object.keys(fields).filter(function(k){return /program|department|degree|curriculum/i.test(k);}).sort(function(a,b){function rank(k){return /program|degree/i.test(k)?0:/curriculum/i.test(k)?1:2;}return rank(a)-rank(b);});
    for(var i=0;i<keys.length;i++){
      var hint=name(fields[keys[i]]), rules=[[/COMPUTER SCIENCE|\bCSE\b/,"cse"],[/COMPUTER NETWORK.*CYBER|\bCNCS\b/,"cncs"],[/DATA SCIENCE/,"ds"],[/COMPUTER ENGINEERING|\bCOE\b/,"coe"],[/ELECTRICAL.*ELECTRONIC|\bEEE\b/,/SEMESTER PLAN|ALTERNATE/.test(hint)?"eee-sem":"eee-obe"],[/INDUSTRIAL.*PRODUCTION|\bIPE\b/,"ipe"],[/ARCHITECTURE|\bBARCH\b/,"arch"],[/BIOCHEMISTRY|MOLECULAR BIOLOGY|\bBMB\b/,"bmb"],[/MICROBIOLOGY/,"microbiology"],[/PHARMACY|\bPHARM\b/,"pharm"],[/JOURNALISM|MASS COMMUNICATION|\bJMC\b/,"jmc"],[/ECONOMICS/,"economics"],[/\bLLB\b|\bLAW\b/,"llb"],[/BUSINESS ADMINISTRATION|\bBBA\b/,"bba-2022"],[/\bENGLISH\b/,"english"]];
      var ids=rules.filter(function(r){return r[0].test(hint);}).map(function(r){return r[1];});
      if(ids.length)return ids.length===1?ids[0]:"";
    }return "";
  }
  function evaluate(portal, program, options) {
    options = options || {};
    var catalog = program && program.courses || [], completed = new Set(), unmatched = [];
    portal.forEach(function (c) {
      if (!passed(c)) return;
      var m = match(c, catalog);
      if (m) completed.add(code(m.code)); else unmatched.push(c.code || c.name);
    });
    var currentMap = new Map(), excluded = new Set((options.excludeCurrent || []).map(code));
    (options.current || []).concat(portal.filter(function(c){return c.status === "running" && !passed(c);})).forEach(function(c){
      var m=match(c,catalog), id=m?code(m.code):code(c.code)||code(name(c.name));
      if(!id || completed.has(id))return;
      if(!currentMap.has(id))currentMap.set(id,{code:m?m.code:c.code||"",name:c.name,credits:(Number(c.cr||c.credit||c.credits)>0?Number(c.cr||c.credit||c.credits):m&&m.credits),matched:!!m,assumed:options.assumeCurrent!==false&&!excluded.has(id)});
    });
    var projected = new Set(completed), projectedCredits = options.credits == null ? null : options.credits;
    currentMap.forEach(function(c,id){if(c.assumed&&c.matched){projected.add(id);if(projectedCredits!=null){if(c.credits>0)projectedCredits+=c.credits;else projectedCredits=null;}}});
    var seenRemaining = new Set();
    var rows = portal.filter(function (c) {
      var m=match(c,catalog), id=m?code(m.code):code(c.code)||code(name(c.name));
      if(passed(c)||(m&&completed.has(code(m.code)))||currentMap.has(id)||seenRemaining.has(id))return false;
      seenRemaining.add(id);return true;
    }).map(function (c) {
      var m = match(c, catalog), r = check(m && m.rule, completed, options.credits);
      var future=check(m&&m.rule,projected,projectedCredits);
      function requiredPasses(rule){
        if(!rule)return [];
        if(rule.type==="course"){var active=currentMap.get(code(rule.code));return !completed.has(code(rule.code))&&active&&active.assumed&&active.matched?[rule.code+" ("+active.name+")"]:[];}
        if(rule.type==="credits")return check(rule,completed,options.credits).state!=="eligible"&&check(rule,projected,projectedCredits).state==="eligible"?["reach "+rule.min+" completed credits after passing checked current courses"]:[];
        var parts=rule.items||[];if(rule.type==="any"){var metNow=parts.filter(function(x){return check(x,completed,options.credits).state==="eligible";});if(metNow.length)return [];parts=parts.filter(function(x){return check(x,projected,projectedCredits).state==="eligible";}).slice(0,1);}
        return [].concat.apply([],parts.map(requiredPasses));
      }
      var conditions=Array.from(new Set(requiredPasses(m&&m.rule)));
      if(r.state!=="eligible" && future.state==="eligible")r={state:"conditional",missing:[],reason:"Available next semester only if you pass: "+conditions.join(" + ")+". This is not a final result or registration approval."};
      var academicStatus=r.state, academicReason=r.reason||"", nextSemesterEligible=future.state==="eligible";
      if (!options.confirmed) r = { state: "unknown", missing: [], reason: "Confirm that this curriculum version matches your batch." };
      var canPlan=!!options.confirmed&&nextSemesterEligible;
      function namedMissing(text){return catalog.reduce(function(out,x){return out.split(x.code).join(x.code+" ("+x.name+")");},String(text));}
      var lockReason=!options.confirmed?"Confirm your curriculum and batch first.":future.state==="unknown"?"Prerequisite rule or completed-credit evidence is unverified. Check the official rule/advisor.":"Complete first: "+future.missing.map(namedMissing).join(" · ");
      var dependentSeen=new Set(), dependentCourses=m?portal.filter(function(p){
        if(passed(p))return false;var t=match(p,catalog);if(!t||currentMap.has(code(t.code))||dependentSeen.has(code(t.code))||refs(t.rule).indexOf(code(m.code))<0)return false;dependentSeen.add(code(t.code));return true;
      }).map(function(p){var t=match(p,catalog),after=new Set(projected);after.add(code(m.code));var q=check(t.rule,after,projectedCredits!=null&&m.credits>0?projectedCredits+m.credits:null);return {code:t.code,name:p.name,status:q.state,missing:q.missing};}):[];
      var dependents=dependentCourses.length;
      function describe(rule){
        if(!rule)return {type:"unknown",status:"unknown"};
        if(rule.type==="course"){var id=code(rule.code),t=catalog.filter(function(x){return code(x.code)===id;})[0],active=currentMap.get(id);return {type:"course",code:rule.code,name:t&&t.name||"",status:completed.has(id)?"passed":active&&active.assumed?"current-pass-required":active?"current-not-assumed":"not-passed"};}
        if(rule.type==="credits")return {type:"credits",min:rule.min,completed:options.credits,projected:projectedCredits,status:check(rule,completed,options.credits).state};
        return {type:rule.type,status:check(rule,completed,options.credits).state,nextStatus:check(rule,projected,projectedCredits).state,items:(rule.items||[]).map(describe)};
      }
      var sem = Number(c.sem || m && m.semester || 99);
      var retake = c.status === "retake";
      return { portal: c, official: m, code: m ? m.code : c.code, name: c.name, status: r.state, missing: r.missing,
        reason: r.reason || "", academicStatus:academicStatus, academicReason:academicReason, academicMissing:future.missing, nextSemesterEligible:nextSemesterEligible, canPlan:canPlan, lockReason:canPlan?"":lockReason, prerequisite:describe(m&&m.rule), dependentCourses:dependentCourses, conditions:conditions, credits: m && m.credits, unlocks: dependents, elective: !!c.elective,
        score: (retake ? 150 : 0) + (r.state==="conditional"?24:0) + dependents * 18 + Math.max(0, 12 - sem) * 3,
        explanation: retake ? "Retake priority" : dependents ? "Prerequisite for " + dependents + " remaining course" + (dependents > 1 ? "s" : "") : "Earlier curriculum sequence" };
    }).sort(function (a, b) { return b.score - a.score || String(a.code).localeCompare(String(b.code)); });
    return { rows: rows, completed: Array.from(completed), current:Array.from(currentMap.values()), runningCredits:Array.from(currentMap.values()).every(function(c){return c.credits>0;})?Array.from(currentMap.values()).reduce(function(n,c){return n+c.credits;},0):null, projectedCredits:projectedCredits, unmatched: unmatched };
  }
  function canAddToPlan(c){return !!c&&c.canPlan===true&&c.nextSemesterEligible===true&&["eligible","conditional"].indexOf(c.status)>=0;}
  function validSlot(t) { return t && /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/.test(t.day) && Number.isFinite(t.start) && Number.isFinite(t.end) && t.start >= 0 && t.end <= 1440 && t.end > t.start; }
  function conflicts(a, b) { return a.some(function (x) { return b.some(function (y) { return validSlot(x) && validSlot(y) && x.day === y.day && x.start < y.end && y.start < x.end; }); }); }
  function sectionOpen(s) { return s && !/closed|cancel|full|inactive/i.test(s.status || "") && Number.isFinite(s.cap) && Number.isFinite(s.cnt) && s.cap > s.cnt && s.times && s.times.length && s.times.every(validSlot); }
  function sectionsFor(c, offered) {
    return offered.filter(function (s) {
      return s.code && c.code ? code(s.code) === code(c.code) : name(s.name) === name(c.name);
    });
  }
  function availability(c, offered) {
    var sections=sectionsFor(c,offered||[]).map(function(s){
      var known=Number.isFinite(s.cap)&&Number.isFinite(s.cnt)&&s.cap>=0&&s.cnt>=0&&s.cnt<=s.cap;
      var remaining=known?s.cap-s.cnt:null,closed=/closed|cancel|inactive/i.test(s.status||"");
      return Object.assign({},s,{remaining:remaining,availability:closed?"closed":remaining===0||/full/i.test(s.status||"")?"full":remaining>0?"seats-reported":"unknown"});
    });
    return {sections:sections,available:sections.filter(function(s){return s.availability==="seats-reported";}).length,full:sections.filter(function(s){return s.availability==="full";}).length,seats:sections.filter(function(s){return s.availability==="seats-reported";}).reduce(function(n,s){return n+s.remaining;},0)};
  }
  function sectionCost(s, options) {
    var cost = 0;
    s.times.forEach(function (t) {
      if (t.start < options.earliest) cost += (options.earliest - t.start) * 2;
      if (t.end > options.latest) cost += (t.end - options.latest) * 2;
    });
    return cost - Math.min(20, s.cap - s.cnt);
  }
  function schedule(courses, offered, options) {
    if(courses.some(function(c){return c.canPlan===false;}))return {ok:false,reason:"Locked courses cannot be used in a next-semester timetable."};
    options = Object.assign({ earliest: 480, latest: 1080, blocked: [], maxNodes: 10000 }, options);
    if (courses.length > 10) return { ok: false, reason: "Choose up to 10 courses per plan." };
    var groups = courses.map(function (c) { return { course: c, sections: sectionsFor(c, offered).filter(sectionOpen).sort(function (a, b) { return sectionCost(a, options) - sectionCost(b, options); }) }; });
    var missing = groups.filter(function (g) { return !g.sections.length; }).map(function (g) { return g.course.name; });
    if (missing.length) return { ok: false, missing: missing, reason: "No open section with a complete timetable in this offering snapshot." };
    groups.sort(function (a, b) { return a.sections.length - b.sections.length; });
    var best = null, bestCost = Infinity, nodes = 0, limit = false;
    function visit(i, slots, chosen, cost) {
      if (++nodes > options.maxNodes) { limit = true; return; }
      if (i === groups.length) { if (cost < bestCost) { bestCost = cost; best = chosen.slice(); } return; }
      groups[i].sections.forEach(function (s) {
        if (limit || conflicts(s.times, slots) || conflicts(s.times, options.blocked)) return;
        // Overlap between a section's own lab/theory slots is not a valid plan.
        if (s.times.some(function (t, n) { return conflicts([t], s.times.slice(n + 1)); })) return;
        visit(i + 1, slots.concat(s.times), chosen.concat([{ course: groups[i].course, section: s }]), cost + sectionCost(s, options));
      });
    }
    visit(0, [], [], 0);
    return best ? { ok: true, choices: best, examined: nodes, limited: limit, reason: limit ? "Conflict-free option found; search limit reached, so not guaranteed optimal." : "Conflict-free within the supplied snapshot. Seats can change." } :
      { ok: false, examined: nodes, limited: limit, reason: limit ? "Search limit reached; reduce the course selection." : "No conflict-free combination for these courses and blocked times." };
  }
  function recommend(rows, creditLimit, includeElectives) {
    var credits = 0, selected = [];
    rows.forEach(function (r) {
      if (r.canPlan===false || !["eligible","conditional"].includes(r.status) || (r.elective && !includeElectives) || !(r.credits > 0)) return;
      if (credits + r.credits <= creditLimit && selected.length < 10) { selected.push(r); credits += r.credits; }
    });
    return { selected: selected, credits: credits };
  }
  function offeringEvidence(c, history, season) {
    var seen = new Set(), samples = (history || []).filter(function (s) {
      if (!s.term || seen.has(s.term) || s.complete !== true || s.season !== season || !Array.isArray(s.courses)) return false;
      seen.add(s.term); return true;
    });
    if (samples.length < 3) return { available: false, samples: samples.length, label: "Not enough comparable history. No opening prediction." };
    var hits = samples.filter(function (s) { return s.courses.some(function (x) { return x.code && c.code ? code(x.code) === code(c.code) : name(x.name) === name(c.name); }); }).length;
    return { available: true, samples: samples.length, hits: hits, label: "Observed in " + hits + " of " + samples.length + " saved " + season + " offerings. Historical frequency, not a guarantee or calibrated probability." };
  }
  return { canAddToPlan:canAddToPlan, detectProgram: detectProgram, code: code, name: name, passed: passed, match: match, check: check, evaluate: evaluate, refs: refs, conflicts: conflicts, validSlot: validSlot, sectionOpen: sectionOpen, sectionsFor: sectionsFor, availability:availability, schedule: schedule, recommend: recommend, offeringEvidence: offeringEvidence };
});