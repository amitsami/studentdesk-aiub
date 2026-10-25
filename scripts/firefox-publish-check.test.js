"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { compareVersions, submissionDecision, loadVersions, releaseMetadata } = require("./firefox-publish-check");

test("numeric version comparison, including double-digit components", () => {
  assert.equal(compareVersions("3.9.7", "3.9.6"), 1);
  assert.equal(compareVersions("3.10.0", "3.9.7"), 1);
  assert.equal(compareVersions("3.9.7", "3.9.7.0"), 0);
  assert.throws(() => compareVersions("3.9.8-beta", "3.9.7"));
});
test("submit latest phone update over approved 3.9.6", () => {
  assert.equal(submissionDecision("3.9.7", [{ version: "3.9.6" }]).submit, true);
});
test("repeat triggers skip even pending submissions", () => {
  assert.equal(submissionDecision("3.9.7", [{ version: "3.9.7", file: { status: "unreviewed" } }]).submit, false);
});
test("refuse downgrade and numerically equivalent versions", () => {
  assert.throws(() => submissionDecision("3.9.6", [{ version: "3.9.7" }]));
  assert.throws(() => submissionDecision("3.9.7", [{ version: "3.9.7.0" }]));
});
test("changelog metadata uses only the requested release", () => {
  const m = releaseMetadata("3.9.7", "# Changelog\n\n## 3.9.7 - Phone\n- Lower footer\n\n## 3.9.6 - Old\n- Old note\n");
  assert.equal(m.version.release_notes["en-US"], "- Lower footer");
  assert.throws(() => releaseMetadata("3.9.8", "## 3.9.7 - Phone\n- Fix\n"));
});
test("authenticated version check follows all pages", async () => {
  let calls = 0;
  const versions = await loadVersions("test-issuer", "test-secret", async (url, options) => {
    calls++;
    assert.match(options.headers.Authorization, /^JWT /);
    return { ok: true, json: async () => ({
      results: [{ version: calls === 1 ? "3.9.6" : "3.9.5" }],
      next: calls === 1 ? "https://addons.mozilla.org/api/v5/addons/addon/test/versions/?page=2" : null,
    }) };
  });
  assert.equal(versions.length, 2);
});
test("reject unsafe pagination hosts without sending credentials", async () => {
  await assert.rejects(loadVersions("issuer", "secret", async () => ({
    ok: true, json: async () => ({ results: [], next: "https://example.com/" }),
  })), /Unexpected Mozilla pagination/);
});
test("fail closed on missing listing or authentication errors", async () => {
  await assert.rejects(loadVersions("issuer", "secret", async () => ({
    ok: true, json: async () => ({ results: [], next: null }),
  })), /No existing versions/);
  await assert.rejects(loadVersions("issuer", "secret", async () => ({
    ok: false, status: 401,
  })), /HTTP 401/);
});
 test("long store notes fit AMO limit and preserve full-changelog link", () => {
  const body = Array.from({length: 9}, (_, i) => "### Group " + i + "\n- " + "Detailed change ".repeat(80)).join("\n");
  const notes = releaseMetadata("4.0.0", "## 4.0.0 - Studio\n" + body).version.release_notes["en-US"];
  assert.ok(notes.length <= 3000);
  assert.match(notes, /Group 8/);
  assert.match(notes, /releases\/tag\/v4\.0\.0/);
});
