# Automatic Firefox updates

The `Publish Firefox update` GitHub Actions workflow submits new versions to the
existing public Mozilla listing, `studentdesk-aiub`. It runs on extension-related
pushes to `main`, published GitHub releases, and manual runs.

## One-time setup

1. Sign in to https://addons.mozilla.org/developers/addon/api/key/ as an owner of
   StudentDesk AIUB and generate Mozilla API credentials.
2. Open https://github.com/amitsami/studentdesk-aiub/settings/secrets/actions.
3. Add these **repository secrets** (not variables):
   - `AMO_JWT_ISSUER`: the Mozilla JWT issuer / API key.
   - `AMO_JWT_SECRET`: the Mozilla JWT secret.
4. Open Actions → **Publish Firefox update** → **Run workflow** on `main` to
   submit the latest version already in the repository.

Never paste credentials into the repository, workflow YAML, issues, or chat.
These credentials authorize submissions under your Mozilla account. Rotate
them if exposed. The workflow never prints their values.

## Each update

1. Make and test the changes.
2. Increase `extension/manifest.json` → `version` (for example, `3.9.7` → `3.9.8`).
3. Add the matching top entry in `CHANGELOG.md`, then run `node scripts/build.js`.
4. Push the complete update to `main`. The workflow packs the Firefox-specific
   manifest, validates it, and submits the new version with changelog notes.
5. Check the Actions run and Mozilla Developer Hub for validation/review status.

Validation errors block submission. Validator warnings remain visible in the
Actions logs for review; the existing package currently has warnings about DOM
HTML assignments, so warnings alone are not treated as publishing failures.

No GitHub release is required. Repeated triggers for an already-submitted
version are skipped, including versions awaiting review. Older version numbers
are rejected. Changing code without increasing the version does **not** update
the installed Firefox extension. Fix a rejected submission with a new version.

The add-on ID remains `aiub-portal-plus@student.local`; changing it would create
a different extension and break existing users' update path. Packaging uses
`scripts/pack.js`, not the mixed Chromium/Firefox development manifest.

## What “automatic” means

GitHub push → automatic Mozilla submission → Mozilla validation/signing/review
as required → Firefox's normal automatic update check.

Submission is not approval. This workflow does not bypass Mozilla's policies
and cannot guarantee immediate approval or immediate installation on every
device. Existing approved versions stay available while a new version is
reviewed. Users must have automatic add-on updates enabled.

No Microsoft Edge publishing is configured by this workflow.