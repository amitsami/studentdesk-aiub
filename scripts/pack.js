/* Store packages: node scripts/pack.js [outDir]
 *   StudentDesk-AIUB-chromium.zip  -> Microsoft Edge Add-ons, Opera Add-ons, Chrome Web Store
 *   StudentDesk-AIUB-firefox.zip   -> Firefox Add-ons (PC + Android)
 * Same code as extension/, only the manifest is adjusted for each store. */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const root = path.join(__dirname, ".."), src = path.join(root, "extension"), out = path.resolve(process.argv[2] || path.join(root, "store-dist"));
const base = JSON.parse(fs.readFileSync(path.join(src, "manifest.json"), "utf8"));
fs.mkdirSync(out, { recursive: true });
function pack(name, edit) {
  const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "pp-"));
  fs.cpSync(src, tmp, { recursive: true, filter: (p) => !path.basename(p).startsWith(".") });
  const m = edit(JSON.parse(JSON.stringify(base)));
  fs.writeFileSync(path.join(tmp, "manifest.json"), JSON.stringify(m, null, 2) + "\n");
  const zip = path.join(out, name); try { fs.unlinkSync(zip); } catch (e) {}
  cp.execSync('zip -qrX "' + zip + '" .', { cwd: tmp });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("Packed " + zip);
}
pack("StudentDesk-AIUB-chromium.zip", (m) => { delete m.browser_specific_settings; m.background = { service_worker: "bg.js" }; return m; });
pack("StudentDesk-AIUB-firefox.zip", (m) => {
  m.background = { scripts: ["bg.js", "public-sync.js"] };
  m.browser_specific_settings = { gecko: { id: "aiub-portal-plus@student.local", strict_min_version: "140.0",
    // Only a faculty review you choose to submit is sent (anonymous). Nothing is collected automatically.
    data_collection_permissions: { required: ["none"] } }, gecko_android: { strict_min_version: "142.0" } };
  return m;
});

// Safari: avoid service-worker lifecycle differences in temporary folder installs.
pack("StudentDesk-AIUB-safari.zip", (m) => {
  m.name = "StudentDesk AIUB — Safari";
  m.background = { scripts: ["bg.js", "public-sync.js"], persistent: false, preferred_environment: "document" };
  m.browser_specific_settings = { safari: { strict_min_version: "15.4" } };
  return m;
});
