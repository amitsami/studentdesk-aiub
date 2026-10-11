# Changelog

## 3.9.7 - Smoother phone app
- Phone: the bottom tab bar now stays perfectly still while you scroll
- Phone: smoother, faster scrolling and quicker taps

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
