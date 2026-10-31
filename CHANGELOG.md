# Changelog

## 4.5.0 - Refined Workspace

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

## 4.0.0 - Academic Studio

### New: next-semester Course planner
- Added a dedicated Course planner in desktop navigation, More, and a Home invitation card on phone and PC.
- Uses the student's portal curriculum and registration data with source-attributed official AIUB catalog snapshots.
- Matches courses by exact unique code/name rather than guessing a department or borrowing another program's prerequisites.
- Shows verified prerequisite groups (ALL / ONE OF), course names, passed/missing/current status, credit thresholds and source wording/links.
- Explains each course's priority: retake, direct prerequisite bottleneck or curriculum sequence.
- Lists named direct successor courses and any other requirements still missing. A prerequisite relationship is not a promise of future availability.
- Requires the user to check the catalog/version against their own batch for academic recommendations. Missing, ambiguous or unavailable rules remain unverified.

### This semester → next semester
- Excludes passed and currently enrolled courses from the remaining-course suggestions.
- Lets students mark current courses they expect to pass; dependent suggestions are labeled conditional, not currently eligible.
- Unticking a dropped/uncertain current course recalculates dependent status immediately; it does not submit a portal drop.
- Separates completed, running and projected credits. Registration credit values are preferred where available; missing credits stay unverified.
- Does not chain suggested future courses together as if they were already passed.

### Saved course plan and PDF/JPG downloads
- Every remaining-course card has Add to plan, including blocked/unverified courses saved as reminders.
- Keeps up to 30 saved courses in this browser across navigation/reloads. Changes in eligibility do not silently delete reminders.
- Preserves older saved entries for rechecking if they are no longer in the remaining-course list.
- Shows prerequisite, verification, unknown-credit and over-target warnings without blocking manual reminder saves.
- Added direct Download PDF (paginated, image-backed A4) and Download JPG (styled plan image).
- Downloads include course codes, names, known credits, status warnings, current-pass conditions and planned section details when available.
- PDF/JPG generation happens locally; no third-party document service receives student data.
- Moved JSON export to Optional backup. Automatic starting-plan replacement asks before replacing existing reminders.

### Offered courses, sections and seats
- Added a read-only registration/availability panel with portal start-page status and an official-registration entry point.
- Shows exact-matched sections on each course card: reported status, remaining/total seats, theory/lab meetings and room.
- Distinguishes available, full, closed and unknown seat counts; invalid/missing counts are not invented as zero.
- Displays the offering term and snapshot time. Saved/current-term data is not represented as a guaranteed next-semester offering.
- Added In loaded offerings and Sections reporting seats filters.
- Optional offering-scoped starting plans require checking the displayed term; the setting resets if the source term changes.
- Bounded manual refresh and focus-return refresh avoid continuous polling. Seats are snapshots, not reservations.

### Conflict-free timetable and offering history
- Uses the supplied portal offering snapshot, not invented sections.
- Checks every lab/theory meeting, section capacity, overlaps, preferred time range and a hard blocked day.
- Blocks automatic section search for unverified/ineligible reminders or an invalid search load. Saving a course never grants registration eligibility.
- Saves explicitly confirmed complete semester offering snapshots locally.
- Shows historical frequency only after at least three distinct comparable-season snapshots; no fabricated opening probability or guarantee.

### Major phone and desktop presentation update
- Introduced a warm editorial Academic Studio design, clearer typography, restrained borders and a consistent light/dark palette.
- Added original lightweight section illustrations; navigation/action icons remain functional and distinct from artwork.
- Redesigned planner setup, current-course controls, eligibility summaries, course cards and saved-plan presentation for touch and desktop.
- Collapsible setup/current-course sections reduce clutter; PDF/JPG controls are visible in the saved plan.
- Added a native mobile Home planner invitation and persistent desktop access.
- Kept a readable frosted header with solid/reduced-effect fallbacks, reduced-motion support and Performance mode.
- Removed the legacy Appearance customization panel; retained a simple Light / Dark / System theme.
- Fixed reminder labels/select layout being squeezed on desktop and phone, artwork/action overlap and dark-mode contrast issues.

### Reliability fixes
- Authenticated root redirects are no longer automatically treated as expired sessions; actual login responses still require normal sign-in.
- Unavailable/redirected registration pages are not parsed as successful empty course lists.
- Failed forced registration/offering refreshes preserve existing information and show actionable, durable recovery rather than a raw SESSION-only toast.
- Improved bounded public-page transport, typed HTTP/network failures, public-tab notice synchronization and cache boundaries.
- Bundled a clearly labeled saved official notice snapshot so the bulletin is usable when the public server does not respond. Live refresh remains dependent on the official site.
- Added bundled public faculty thumbnails with remote/initial fallback for All reviews.
- Regression-checked real compressed DOCX preview fixtures, offline notice labeling, faculty photos and performance/theme controls. Existing file-type limits remain unchanged.

### Privacy, safety and compatibility
- Academic recommendations are local/deterministic; no grades are sent to an external AI service.
- Plans, pass assumptions, imported rules, credit confirmations and offering history remain local to the browser. Clearing site data removes them.
- No automatic registration, course submission, drop action, login/CAPTCHA bypass or queue/wait bypass was added.
- Source coverage varies by department/intake. Incomplete catalogs are explicitly unverified; advisor/official portal approval remains authoritative.
- Release fixtures were checked in Chromium at 320, 390, 820 and 1440px. Real authenticated Safari/iPhone and an active pre-registration session still require on-device verification.
- Firefox and Microsoft Edge distribution depends on each store's validation/review. A submitted update is not necessarily approved or live.


## 3.9.9 - Workspace tools and Liquid Glass
- Safari-specific nonpersistent background page, native public-page requests and bounded runtime responses fix the public notice transport compatibility path.
- portable bounded DOCX/PPTX decoder and native ArrayBuffer attachment reads replace Safari-sensitive stream APIs.
- Rebuilt Notices: dedicated in-app bulletin, search, pagination and sanitized article details. A temporary offscreen official-site bridge supports compatible userscript managers; the full website is never displayed inside Notices. No third-party proxy.
- Portal Mail uses absolute same-origin JSON requests with session validation, readable recovery and persistent Outlook access.
- New Focus interface: gradient header with a light content deck, navigation groups, launchpad shortcuts, file workspace and short reduced-motion-aware transitions. Off-day calendar remains red.
- Customize and reorder Home quick actions separately for desktop and touch devices.
- Optional class and exam reminders while the portal tab is open; optional desktop notifications.
- Export the current routine as PNG, print/Save as PDF, or an 8-week calendar file.
- Liquid Glass header with glossy edges and a readable frosted surface on scroll in light/dark themes; solid fallback in Performance mode.
- Phone rendering avoids stacked blur and repeated card animations; navigation uses one brief opacity fade. Footer position is unchanged.
- Data freshness badges distinguish cached data and offline snapshots.
- Preview teacher attachments in memory: PDF, images, plain text, and text-only DOCX/PPTX, with download fallback.
- Bounded retries for temporary read failures; failed refresh keeps saved data and clearly labels it.
- Notices stay usable when one page fails, with Retry and official-site fallback.
- Added developer Facebook profile.
- Portal login and server-side captcha validation remain unchanged.

## 3.9.8 - Quick actions, smoother navigation and Microsoft Edge Add-ons
- Courses & Result moved from More → Academics to Home → Quick actions.
- PC: Courses & Result replaces Password; Change password remains in More → Account.
- Phone and tablet: Courses & Result replaces Outlook; Outlook remains in Mail.
- Lighter page changes, immediate result numbers, and transform-based bottom navigation highlighting.
- Quick actions adapt when the screen size changes; the existing footer position is preserved.
- Windows PC: install StudentDesk AIUB directly from Microsoft Edge Add-ons. The in-app update log now includes a clickable store link; no ZIP extraction or Developer mode is needed.

## 3.9.7 - Smoother phone app
- Phone: the bottom tab bar now stays perfectly still while you scroll
- Phone: smoother, faster scrolling and quicker taps
- Phone: the tab bar sits a little lower, closer to the screen edge

## 3.9.6 - New GitHub home
- The GitHub project is now github.com/amitsami/studentdesk-aiub, with new download file names
- Updates keep working for everyone, nothing to do on your side

## 3.9.5 - New name: StudentDesk AIUB
- New name: StudentDesk AIUB
- New logo with the StudentDesk name
- Everything else works the same, and your settings are kept

## 3.9.4 - Store versions and new logo
- New StudentDesk logo (AIUB logo with "StudentDesk")
- StudentDesk is now available from browser stores (Edge, Firefox, Opera) and Greasy Fork, with automatic updates
- Installed from a store: updates install by themselves, so the "Update available" banner is not shown
- Tampermonkey: "Update now" opens the update from where you installed it (GitHub or Greasy Fork)

## 3.9.3 - Faculty comments, faster Give review, live Customize
- Faculty review → All reviews: each faculty card now has a 💬 dropdown next to the name that shows all comments for that faculty
- The list now shows how many faculty have been reviewed (for example "52 faculty reviewed · 140 reviews")
- The "With comments" tab was removed (comments are now in each faculty's dropdown)
- Give review: reviews you gave in earlier semesters show as reviewed again, even if a course name is written a little differently
- Give review is faster: closed semesters load when opened, fewer redraws while loading, and failed faculty pages are retried
- Settings → Customize: Glass blur, Roundness and Text size now change live while you move the slider, with a live preview and value labels

## 3.9.2 - Update notice, Give review and Registration fixes.

- When a new version is out, Home and More show "Update available" with the new features and a GitHub update link.
- After you update, More shows your version, "Up to date" and what's new.
- Give review: this semester's faculty show again (running courses were hidden during the drop/withdraw period).
- Go to Registration -> Cancel now returns to the StudentDesk home instead of the old portal.

## 3.9.1 - Faculty photos load reliably.

- Faculty review: when www.aiub.edu is slow or busy, faculty photos are retried automatically (3 times), then the portal photo or initials are shown and tried again later (on refresh, when the connection comes back, or after 10 minutes). No more broken photo boxes.
- The faculty list (used for photos) is also retried automatically if aiub.edu does not respond.

## 3.9 - CGPA privacy, cleaner review sorting and update alerts.

- CGPA is now hidden (blurred) everywhere: Grades page, CGPA trend chart, semester cards, What-if calculator, More profile and the classic portal. Tap it to show, tap again to hide. It hides again when you change page.
- Faculty review -> All reviews: the "Latest" sort was removed. By faculty (default), Top rated and With comments remain.
- New "What's new" section in More. It shows the new features of your version, and when a newer version is out it shows the update details with a GitHub update link (plus a red dot on More).

## 3.8.2 - Faculty review search now finds all reviews.

- Searching in Faculty review -> All reviews now also searches the review server, so matching reviews are found even when there are more than 1000 reviews. Same page, same design.

## 3.8.1 - Faculty review server connected.

- Faculty reviews are now connected to the built-in review server out of the box (Supabase, kept online by a GitHub Actions workflow). No setup needed.
- Tampermonkey auto-update from GitHub (`@updateURL` / `@downloadURL`).

## 3.8

```text
- Go to Registration shows "Open now" only when the portal's registration page
  really shows the Next and Cancel buttons. Otherwise it shows "Done" (registration
  completed) or "Closed".
- Faculty review button moved into the greeting box on Home.
- Registration status and reviews load in the background without slowing scrolling.
- Supports both Supabase key types (legacy anon key and new publishable key).
- Code comments are English only.
```

## 3.7

```text
- Faculty review (Home -> "Faculty review", also in More / sidebar):
  * Give review: every faculty you took a course with — running AND completed,
    semester by semester (read from your own portal: course list -> section ->
    course teacher). 1-5 stars + optional comment, Submit, edit or remove any time.
  * All reviews: everyone's reviews with faculty photo + name, stars, course,
    semester, comment. Search, By faculty (average rating), Top rated, With comments.
    Updates live every 20 s; your own review appears instantly after Submit.
  * Anonymous: your name / student ID are never shown or sent. Only a one-way
    scrambled code is sent so one student = one review per faculty+course+semester.
    Abusive reviews can be reported (hidden after 3 reports).
- Speed: faster first load, background loading paced so it never blocks scrolling.
```

## 3.6

```text
- Speed pass: background loading now waits until you stop touching/scrolling,
  the portal's own heavy scroll script is blocked, links open instantly (no fade
  delay), phones get flatter rendering (no shadows/transitions/blur), badges paint
  after the page is shown.
- Developer info card in More (Amit Hasan Sami, email, GitHub).
- Removed the "Made with love" footer.
- Bug fixes: "Good noon" -> "Good afternoon", red dots no longer show on courses
  you have not taken, text fixes, smoother resize handling.
```

## 3.5

```text
- Exam routine: before every term exam the portal publishes the routine — StudentDesk
  checks for it automatically and shows it on Home ("Exam routine is out") and in
  Class Routine -> Exams, with a countdown and a red dot when it appears.
- Live campus weather on Home for AIUB (Kuratoli, Dhaka): temperature, feels like,
  humidity, wind, rain chance, next 6 hours, and a tip (umbrella / carry water).
  Data from Open-Meteo (free, no account). Refreshes every 10 minutes.
- Faculty list (More -> Faculty list): every AIUB faculty from aiub.edu with photo,
  position, department, room, email and profile link; search and filter by faculty.
- Tab bar / sidebar switch on finger-down (lower latency); more data preloaded.
(The extension may ask permission for www.aiub.edu and api.open-meteo.com.)
```

## 3.4

```text
- Much smoother on phones: no live blur while scrolling (the top bar uses a frosted
  fill instead), no per-item animations, Firefox gets its own light rendering path
- "Go to Registration" now finds the portal's own red Registration button while
  registration is open and takes you straight to it (button turns red, "Open now").
  When registration is closed it opens the normal Registration page.
- Notifications list loads 30 at a time (Show more)
```

## 3.3

```text
- AIUB logo in the sidebar (PC) and the top bar (phone)
- "Go to Registration" button on Home
- Notifications: your portal notifications (bell button + own page), tap to open
- Red update dots: a number on Notices, Notifications, Grades, Courses, Routine,
  Financials and Mail when something new arrives, and a red dot on the exact item
  inside the page. (The first run only remembers what is already there.)
- Top bar turns into frosted glass when you scroll (PC and phone)
- Quick actions are now unique (no copies of the tab bar / sidebar):
  Free time, Week view, Offered for me, CGPA calculator, Outlook, Drop course, ...
- Faster: data starts loading the moment you touch a tab, long pages draw only
  what is on screen
```

## 3.2

```text
- Notices: every official notice from aiub.edu inside the app — read the full
  notice, search, load older notices, "New" badge, latest notices on Home
  (The extension may ask permission to read www.aiub.edu — that is only for notices.)
```

## 3.1

```text
- Clean off-white light mode by default (dark mode in Settings)
- Minimal Home: greeting, next-class countdown, quick actions, today and coming up
- Settings on Home (quick action + gear button on phone)
- Much faster: pages open instantly after the first visit, data refreshes quietly in the background
- Smooth native scrolling on phones, lighter effects, 60 fps
- Whole interface in English
FEATURES
- Home, Class Routine (day / week / free time), Courses (completed / running /
  remaining / offered for me / all offered / electives), Grades & CGPA (trend,
  distribution, what-if calculator), Financials, Mail (portal mail + Outlook),
  More (all portal pages), Settings
- Quick search: search button, Ctrl+K or "/"
- Phone: swipe left/right to switch tabs
- Settings: Light / Dark / Auto, accent colour, background, animations, start page.
  Turn off "StudentDesk App layout" to go back to the original portal layout.
INSTALL
Remove any older version first.
Chrome / Edge / Brave (PC)
 1. Extract StudentDesk-AIUB-extension.zip
 2. Open chrome://extensions (edge://extensions, brave://extensions)
 3. Turn on Developer mode -> Load unpacked -> choose the extracted folder
Firefox (PC or Android) with Tampermonkey
 - Tampermonkey -> Dashboard -> Utilities -> Import from file ->
   choose StudentDesk-AIUB-Tampermonkey.zip -> Install
 - Or create a new script and paste the code from StudentDesk-AIUB-code.txt
iPhone / iPad
 - Install the "Userscripts" app, enable it in Safari, and add the .user.js file.
NOTE
The login math captcha is a security check, so it is not auto-solved.
```
