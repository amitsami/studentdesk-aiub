#!/usr/bin/env node
"use strict";

// No dependencies; credentials are read only from GitHub Actions secrets.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const API = "https://addons.mozilla.org/api/v5/addons/addon/";
const ADDON_ID = "aiub-portal-plus@student.local";

function compareVersions(a, b) {
  const parse = (s) => {
    if (!/^\d+(?:\.\d+){0,3}$/.test(s)) {
      throw new Error(`Unsupported version format: ${s}. Use numeric release versions.`);
    }
    return s.split(".").map(Number);
  };
  const aa = parse(a), bb = parse(b);
  for (let i = 0; i < 4; i++) {
    const diff = (aa[i] || 0) - (bb[i] || 0);
    if (diff) return Math.sign(diff);
  }
  return 0;
}

function submissionDecision(version, versions) {
  compareVersions(version, version);
  if (versions.some((v) => v.version === version)) {
    return { submit: false, reason: `v${version} already exists on Mozilla (including pending submissions). Increase manifest.version for changed code.` };
  }
  if (versions.some((v) => compareVersions(version, v.version) <= 0)) {
    throw new Error(`v${version} is not newer than all existing Mozilla versions. Increase extension/manifest.json version.`);
  }
  return { submit: true, reason: `v${version} is new; submit to the existing Firefox listing.` };
}

function token(issuer, secret) {
  const now = Math.floor(Date.now() / 1000);
  const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${enc({ alg: "HS256", typ: "JWT" })}.${enc({
    iss: issuer, jti: crypto.randomUUID(), iat: now, exp: now + 60,
  })}`;
  return `${unsigned}.${crypto.createHmac("sha256", secret).update(unsigned).digest("base64url")}`;
}

async function loadVersions(issuer, secret, fetcher = fetch) {
  let url = `${API}${encodeURIComponent(ADDON_ID)}/versions/?filter=all_with_unlisted&page_size=50`;
  const versions = [];
  while (url) {
    // Never forward the API credential to an unexpected pagination host.
    if (!url.startsWith(API)) throw new Error("Unexpected Mozilla pagination URL.");
    const response = await fetcher(url, {
      headers: { Authorization: `JWT ${token(issuer, secret)}` },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Mozilla version check failed (HTTP ${response.status}). Check AMO secrets and add-on ownership.`);
    const data = await response.json();
    if (!Array.isArray(data.results)) throw new Error("Unexpected Mozilla versions response.");
    versions.push(...data.results);
    url = data.next;
  }
  if (!versions.length) throw new Error("No existing versions found. Refusing to create a new listing.");
  return versions;
}

function releaseMetadata(version, changelog) {
  const sections = changelog.split(/^## /m).slice(1);
  const entry = sections.find((s) => s.split(/\s/)[0] === version);
  if (!entry) throw new Error(`CHANGELOG.md needs an entry for ${version}.`);
  const notes = entry.split("\n").slice(1).join("\n").trim();
  if (!notes) throw new Error("Release notes cannot be empty.");
  return {
    version: {
      release_notes: { "en-US": notes },
      approval_notes: "Update to the existing StudentDesk AIUB add-on. Human-readable, unminified source is included in the extension package. The signed-in portal pages require an AIUB student account; reviewer credentials are not provided. The enhanced login page can be checked at https://portal.aiub.edu/. Source: https://github.com/amitsami/studentdesk-aiub",
    },
  };
}

async function main() {
  const issuer = process.env.WEB_EXT_API_KEY;
  const secret = process.env.WEB_EXT_API_SECRET;
  if (!issuer || !secret) throw new Error("Add repository Actions secrets AMO_JWT_ISSUER and AMO_JWT_SECRET. See docs/firefox-publishing.md.");
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "extension/manifest.json"), "utf8"));
  if (manifest.browser_specific_settings?.gecko?.id !== ADDON_ID) throw new Error("Firefox add-on ID changed; refusing to publish to a different listing.");
  const decision = submissionDecision(manifest.version, await loadVersions(issuer, secret));
  console.log(decision.reason);
  if (decision.submit) {
    const metadata = releaseMetadata(manifest.version, fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8"));
    fs.mkdirSync(path.join(ROOT, "store-dist"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "store-dist/firefox-metadata.json"), JSON.stringify(metadata, null, 2) + "\n");
  }
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `submit=${decision.submit}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${decision.reason}\n\nMozilla review/signing still applies. Firefox delivers approved updates on its normal update-check schedule, not instantly.\n`);
}

module.exports = { compareVersions, submissionDecision, loadVersions, releaseMetadata };
if (require.main === module) main().catch((err) => { console.error(err.message); process.exitCode = 1; });