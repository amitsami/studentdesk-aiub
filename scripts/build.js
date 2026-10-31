#!/usr/bin/env node
/*
 * StudentDesk AIUB build script
 * Generates userscript/StudentDesk-AIUB.user.js from the extension/ sources:
 *   header (from manifest.json) + CSS (theme.css, shell.css, glass.css) + app.js + shell.js
 * Usage: node scripts/build.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ext = (f) => fs.readFileSync(path.join(root, "extension", f), "utf8");
const manifest = JSON.parse(ext("manifest.json"));
const RAW = "https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js";

const header = [
  "// ==UserScript==",
  "// @name         " + manifest.name,
  "// @namespace    aiub-portal-plus",
  "// @version      " + manifest.version,
  "// @description  " + manifest.description,
  "// @author       amitsami",
  "// @homepageURL  https://github.com/amitsami/studentdesk-aiub",
  "// @supportURL   https://github.com/amitsami/studentdesk-aiub/issues",
  "// @license      MIT",
  "// @updateURL    " + RAW,
  "// @downloadURL  " + RAW,
  "// @match        https://portal.aiub.edu/*",
  "// @match        https://www.aiub.edu/*",
  "// @run-at       document-start",
  "// @grant        GM_xmlhttpRequest",
  "// @grant        GM.xmlHttpRequest",
  "// @grant        GM_getValue",
  "// @grant        GM_setValue",
  "// @grant        GM.getValue",
  "// @grant        GM.setValue",
  "// @connect      www.aiub.edu",
  "// @connect      api.open-meteo.com",
  "// ==/UserScript==",
].join("\n");

// Version + "What's new": manifest.json is the version, the top CHANGELOG.md entry is the feature list.
// The build writes both into shell.js (PP_VER / PP_NEW) and update.json, so pushing a new build to GitHub
// is enough for every StudentDesk user to see "Update available" with the new features.
const top = /^## ([0-9][0-9.]*)\s*-?\s*(.*)\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8"));
if (!top || top[1] !== manifest.version) {
  console.error("CHANGELOG.md must start with an entry for " + manifest.version + ' (for example "## ' + manifest.version + ' - Short title").');
  process.exit(1);
}
const notes = top[3].split("\n").filter((l) => /^\s*[-*] /.test(l)).map((l) => l.replace(/^\s*[-*] /, "").replace(/\*\*|`/g, "").trim()).filter(Boolean);
const asciiJson = (v) => JSON.stringify(v).replace(/[\u007f-\uffff]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
const shellPath = path.join(root, "extension", "shell.js");
let shell = fs.readFileSync(shellPath, "utf8");
const shell2 = shell
  .replace(/var PP_VER = "[^"]*";/, "var PP_VER = " + JSON.stringify(manifest.version) + ";")
  .replace(/  var PP_NEW = \[[\s\S]*?\n  \];/, () => "  var PP_NEW = [\n" + notes.map((n) => "    " + asciiJson(n)).join(",\n") + "\n  ];");
if (!/var PP_VER = /.test(shell2) || !/var PP_NEW = \[/.test(shell2)) { console.error("PP_VER / PP_NEW not found in shell.js"); process.exit(1); }
if (shell2 !== shell) fs.writeFileSync(shellPath, shell2);
const today = new Date().toISOString().slice(0, 10);
let prevUpd = {}; try { prevUpd = JSON.parse(fs.readFileSync(path.join(root, "update.json"), "utf8")); } catch (e) {}
const upd = { version: manifest.version, date: prevUpd.version === manifest.version && prevUpd.date ? prevUpd.date : today, title: top[2].trim(), notes: notes, release: "https://github.com/amitsami/studentdesk-aiub/releases/latest" };
fs.writeFileSync(path.join(root, "update.json"), JSON.stringify(upd, null, 2) + "\n");

const css = ["theme.css", "shell.css", "glass.css", "v4.css", "studio-motion.css", "apple-ui.css"].map(ext).join("\n");
const style =
  '(function(){var s=document.createElement("style");s.id="ap-css";s.textContent=' +
  JSON.stringify(css) +
  ";(document.head||document.documentElement).appendChild(s);})();";

const out = [header, '(function(){if(location.hostname === "www.aiub.edu"){', ext("public-reader.js"), 'return;}', style, ext("zip-inflate.js"), ext("curricula.js"), ext("public-snapshot.js"), ext("planner-engine.js"), ext("studio-art.js"), ext("plan-export.js"), ext("planner-view.js"), ext("app.js"), ext("shell.js"), '}());'].join("\n");
const dest = path.join(root, "userscript", "StudentDesk-AIUB.user.js");
fs.writeFileSync(dest, out);
// Compatibility copy: older installs check this path for updates. Remove after everyone has updated.
fs.writeFileSync(path.join(root, "userscript", "AIUB-Portal-Plus.user.js"), out);
console.log("Built " + path.relative(root, dest) + " (v" + manifest.version + ", " + Buffer.byteLength(out) + " bytes)");
