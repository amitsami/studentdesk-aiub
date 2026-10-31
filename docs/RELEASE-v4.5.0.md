# StudentDesk AIUB v4.5.0 — Refined Workspace


### Design and navigation
- Refine the warm color palette and illustrated workspace with clean surfaces, subtle depth, consistent spacing and clear focus states.
- Refine Home, navigation, cards, buttons, fields, segmented filters, dialogs and light/dark themes.
- Apply Times New Roman consistently across pages, sidebar and login; retain monospace course identifiers where appropriate.
- Improve phone, tablet and desktop layouts, touch targets, safe areas, compact-height views and tablet navigation.
- Restore the smooth capsule phone footer: Home, Routine, Courses, Notices and More, with a sliding active pill and reduced-motion fallback.
- Keep all existing pages, original illustrations, the two-part Home card and Course planner NEW badge.
- Add accessible illustration/icon motion controls, respecting reduced motion, Performance mode, hidden tabs and offscreen content.

### Login and routine
- Redesign the native login form with a desktop identity panel and compact phone header, visible field labels, clean inputs and accessible password reveal.
- Preserve native form actions, tokens, field names, captcha and authentication; no credential storage is added.
- Replace heavy gradient calendar blocks with flat, readable event surfaces without changing meeting-time geometry.

### Strict next-semester course planning
- Enable Add to plan only when confirmed curriculum rules are satisfied by passed results plus explicitly checked current-semester expected passes.
- Keep blocked and unverified courses locked, including stale click-handler checks; display prerequisite names, codes, ALL/ONE-OF groups and pass conditions.
- Adding a course for next semester never unlocks its successors within that same plan.
- Revalidate saved plans as assumptions/catalogs change; keep invalid historical references outside active totals and exports.
- Match department data from portal program details while keeping curriculum/batch confirmation separate.
- Preserve saved plans, offering snapshots, conflict checks, PDF/JPG exports and optional JSON backup. Planning is not registration approval; future offerings/seats are not guaranteed.

### Preview, reviews and accessibility
- Resolve declared same-origin attachment links when an HTML notes page wraps the actual file; bound file sizes and traversal, reject login/external/loop responses.
- Offer explicit choices for ambiguous files and actionable Retry, Open notes and Original download recovery.
- Preserve direct supported previews. DOCX/PPTX previews remain text-only: original layout, images and equations are not reproduced.
- Preserve review drafts across navigation/refresh, guard duplicate submissions and refine comment transitions.
- Improve search-dialog labels, focus trapping/restoration, keyboard interaction and live status announcements.

### Validation and distribution
- Passed 688 local Chromium fixture/UI/functional checks plus 333 footer checks, generated-userscript checks and planner/publishing/transport unit suites.
- Tests use synthetic local data and mocked review traffic. Live authenticated portal, physical phones and native Safari/Firefox engines were not verified.
- Existing v4.5.1-v4.5.3 development builds are consolidated into public v4.5.0. Users of those higher-numbered local builds must replace the existing entry manually; do not clear storage or run duplicate installations.
- Firefox/Edge updates require each store's acceptance and normal update checks. Safari package is developer source, not a signed App Store application.

## Install
- PC: use the existing Firefox/Edge store listing once its update is approved, or extract the Chromium package for manual installation.
- Phone: install StudentDesk-AIUB.user.js, or import the Tampermonkey ZIP if your manager supports ZIP import.
- Keep the same extension/userscript entry and storage. Never enable duplicate copies.

Full changelog: https://github.com/amitsami/studentdesk-aiub/blob/main/CHANGELOG.md
Firefox: https://addons.mozilla.org/en-US/firefox/addon/studentdesk-aiub/
Edge: https://microsoftedge.microsoft.com/addons/detail/studentdesk-aiub-%E2%80%94-modern/meogjhmphdkglfabjonfjbdjlfpcpbpa

GitHub publication does not mean store approval.
