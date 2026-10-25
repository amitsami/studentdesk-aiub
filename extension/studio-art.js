/* Original StudentDesk editorial line illustrations. Tiny inline vectors; no external assets. */
(function(){"use strict";var scenes={
 home:'<path d="M15 56c12-5 21-4 25 0 6-4 16-5 26 0V30c-10-4-19-3-26 2-7-5-16-6-25-2Z"/><path d="M40 32v24M22 38l10 2m-10 6 10 2m16-8 10-2m-10 10 10-2M52 21c2-10 11-12 16-8-1 8-6 12-13 11"/>',
 planner:'<path d="m22 17 37-3 4 50-38 3Z"/><path d="m28 28 23-2m-21 12 3 2 5-7m4 4 12-1m-23 13 3 2 5-7m4 4 12-1M30 12l1 10m16-12 1 10"/><path d="M13 49c-7-9-8-15-1-20 7 7 8 14 1 20Zm0 0 3 15"/>',
 weather:'<circle cx="48" cy="29" r="13"/><path d="M48 8V3m0 52v-6m21-20h7M24 29h-7m45-14 5-5m-34 5-5-5m35 34 5 5"/><path d="M21 61c-17 1-17-22-2-23 4-17 28-15 31 1 19-3 23 23 5 23Z" fill="var(--sd-surface,#fffdf9)"/>' ,
 routine:'<circle cx="46" cy="36" r="21"/><path d="M46 22v15l10 6M32 12l-8 7m39-7 8 7M25 58l-5 7m46-7 5 7M11 32l7-1m-6 9 7-1"/>',
 notices:'<path d="m19 17 33-2 11 10 2 37-43 3Z"/><path d="m51 15 1 12 11-2M29 34l24-2m-23 10 24-1m-23 10 15-1"/><path d="m15 28-6-3m7 12H8m10 9-6 3"/>',
 courses:'<path d="M13 25c11-5 20-4 27 2 7-6 17-7 28-2v35c-12-5-21-5-28 0-7-5-16-5-27 0Z"/><path d="M40 27v33M21 35l11 2m-11 7 11 2m16-9 12-2m-12 11 12-2M53 22V12l8 2v11"/>',
 grades:'<path d="m20 59 1-38 39-2 2 40Z"/><path d="m28 48 9-10 9 5 10-15M28 29l9-1"/><circle cx="59" cy="58" r="10"/><path d="m54 66-2 9 7-4 6 3-1-9"/>',
 finance:'<rect x="14" y="23" width="49" height="33" rx="5" transform="rotate(-5 39 39)"/><path d="m15 33 48-4m-40 18 13-1"/><circle cx="58" cy="58" r="12"/><path d="M59 51c-10-3-10 7-2 7 8 0 4 9-4 5m5-15v19"/>',
 mail:'<path d="m12 30 53-3 3 34-53 3Z"/><path d="m13 31 28 18 24-21M16 60l16-18m32 16L49 43M25 25l-1-12 31-2 1 14m-24-6 15-1"/>',
 settings:'<path d="m12 63 58-3M20 54l-2-34 27-2 3 35Zm5-25 13-1m-12 8 12-1m-11 9 9-1M54 52l-5-12 18-2-3 14Z"/><path d="M58 40V21m0 12c-10 0-13-7-11-13 8 0 13 6 11 13Zm0-7c0-10 7-14 13-11-1 8-6 12-13 11M10 58l-3-16 4-1 4 16"/>',

 more:'<rect x="15" y="16" width="22" height="21" rx="5" transform="rotate(-5 26 26)"/><rect x="45" y="17" width="21" height="21" rx="5" transform="rotate(5 55 27)"/><rect x="16" y="45" width="21" height="21" rx="5"/><path d="M46 55h20m-10-10v20"/>'
};window.StudentDeskArt=function(type){return '<svg class="sd-art" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path class="sd-art-wash" d="M9 35C7 15 23 4 45 9c19-1 31 16 25 34 1 23-19 31-37 25C13 69 5 52 9 35Z" stroke="none"/>'+(scenes[type]||scenes.planner)+'<g opacity=".45"><path d="M12 72c17-2 39-2 56-5M7 15l3-4m55 59 4 2"/><circle cx="72" cy="44" r="1.3"/><circle cx="15" cy="10" r="1"/></g></svg>';};})();
