# StudentDesk AIUB

Fast, modern app-style UI for the [AIUB Student Portal](https://portal.aiub.edu) on phone and PC. Your data never leaves your browser.

**[Install the userscript](https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js)** · **[Download the latest release](https://github.com/amitsami/studentdesk-aiub/releases/latest)** · **[Install guide](docs/INSTALL.md)**

**Windows PC (Microsoft Edge):** [Install from Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/studentdesk-aiub-%E2%80%94-modern/meogjhmphdkglfabjonfjbdjlfpcpbpa). Click **Get → Add extension**. No ZIP or Developer mode needed. The store delivers the version currently approved by Microsoft.

## Contents

- [Screenshots](#screenshots)
- [What is StudentDesk AIUB?](#what-is-studentdesk-aiub)
- [Which file should I download?](#which-file-should-i-download)
- [Step-by-step install](#step-by-step-install)
- [After installing: first use](#after-installing-first-use)
- [CGPA privacy](#cgpa-privacy)
- [Faculty reviews](#faculty-reviews)
- [Updating](#updating)
- [Turning it off or removing it](#turning-it-off-or-removing-it)
- [Troubleshooting](#troubleshooting)
- [Features](#features)
- [Privacy](#privacy)
- [For developers](#for-developers)

## Screenshots

| PC: Home | PC: Class routine |
| --- | --- |
| ![Home: next class, registration, weather](docs/screenshots/pc-home.jpg) | ![Class routine with free time and breaks](docs/screenshots/pc-class-routine.png) |
| **PC: Grades & CGPA** | **PC: Faculty reviews** |
| ![Grades & CGPA with what-if calculator](docs/screenshots/pc-grades-cgpa.png) | ![Anonymous faculty reviews](docs/screenshots/pc-faculty-reviews.jpg) |
| **PC: Settings** | **Phone: Home, routine, reviews** |
| ![Customize colors, glass, roundness, text size](docs/screenshots/pc-settings.png) | ![Your AIUB portal, redesigned for phone](docs/screenshots/phone-home-routine-reviews.jpg) |
| **Phone: Grades, notices, settings** | |
| ![Grades, AIUB notices and your own style](docs/screenshots/phone-grades-notices-settings.jpg) | |

## What is StudentDesk AIUB?

StudentDesk AIUB gives the official AIUB student portal (portal.aiub.edu) a modern, app-like look on your phone and PC. It does not replace the portal: you still sign in on portal.aiub.edu with your normal ID and password, and all buttons, forms and data come from the real portal. StudentDesk only changes how it looks and makes it faster to use.

There are two ways to use it:

- **Userscript** (works on phone and PC): a small script that runs inside a free helper app called **Tampermonkey** (or **Userscripts** on iPhone). It updates itself automatically. **Recommended for most students.**
- **Browser extension** (PC only): a zip file you load into Chrome, Edge or Brave. Use this if you do not want to install Tampermonkey.

You only need **one** of them. Do not install both at the same time.

## Which file should I download?

| Your device | Download this | How to use it |
| --- | --- | --- |
| **Android phone** | [StudentDesk-AIUB.user.js](https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js) (just open the link) | 1. Install **Firefox** from the Play Store.<br>2. Firefox -> Menu -> **Add-ons** -> install **Tampermonkey**.<br>3. Open the userscript link in Firefox -> tap **Install**.<br>4. Go to portal.aiub.edu and sign in. |
| **iPhone / iPad** | [StudentDesk-AIUB.user.js](https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js) | 1. Install the free **Userscripts** app from the App Store.<br>2. Settings -> Safari -> Extensions -> turn on **Userscripts** and allow portal.aiub.edu.<br>3. Open the userscript link in Safari -> tap the Userscripts icon -> **Install**.<br>4. Go to portal.aiub.edu. |
| **PC (easiest, auto-updates)** | [StudentDesk-AIUB.user.js](https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js) (just open the link) | 1. Install **Tampermonkey** from your browser's extension store (Chrome, Edge, Brave, Firefox, Opera).<br>2. Chrome / Edge: turn on **Developer mode** on the extensions page (Tampermonkey needs it).<br>3. Open the userscript link -> click **Install**.<br>4. Go to portal.aiub.edu. |
| **PC (no Tampermonkey)** | [StudentDesk-AIUB-extension.zip](https://github.com/amitsami/studentdesk-aiub/releases/latest/download/StudentDesk-AIUB-extension.zip) | 1. Download and **extract** (unzip) the file.<br>2. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`).<br>3. Turn on **Developer mode** -> **Load unpacked** -> choose the extracted folder.<br>4. Go to portal.aiub.edu. Do not delete the folder afterwards. |
| **Tampermonkey zip** (phone **and** PC) | [StudentDesk-AIUB-Tampermonkey.zip](https://github.com/amitsami/studentdesk-aiub/releases/latest/download/StudentDesk-AIUB-Tampermonkey.zip) | **Phone (Android, Firefox + Tampermonkey):** download the zip -> tap the Tampermonkey icon (Firefox menu -> Add-ons -> Tampermonkey) -> **Dashboard** -> **Utilities** -> **Import from file** -> choose the zip from Downloads -> **Install**.<br>**PC:** Tampermonkey icon -> **Dashboard** -> **Utilities** -> **Import from file** -> choose the zip -> **Install**.<br>Useful when the userscript link does not open an install page. Do not unzip it. |

> **If the `.js` link does not work on your phone, use the Tampermonkey zip instead - it works.** Download [StudentDesk-AIUB-Tampermonkey.zip](https://github.com/amitsami/studentdesk-aiub/releases/latest/download/StudentDesk-AIUB-Tampermonkey.zip) and import it in Tampermonkey (see [Tampermonkey zip import](#tampermonkey-zip-import-phone-and-pc)).

> `schema.sql` is only for the developer (review server database). Students do not need it.

**Updates:** the userscript updates itself through Tampermonkey. The extension zip does not update itself; download the new zip from [Releases](https://github.com/amitsami/studentdesk-aiub/releases) and click **Reload** on the extensions page.
## Step-by-step install

### Android phone

1. Open the **Play Store**, search for **Firefox** and install it. (Chrome on Android does not support add-ons, so Firefox is needed.)
2. Open Firefox, tap the **menu (three dots)** -> **Add-ons** -> **Add-ons Manager**.
3. Find **Tampermonkey** in the list (or search for it) and tap **+** -> **Add**.
4. In Firefox, open this link: [StudentDesk-AIUB.user.js](https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js)
5. Tampermonkey shows an install page. Tap **Install**.
6. Open https://portal.aiub.edu and sign in as usual. The new design appears automatically.

Tip: in Firefox, tap the menu -> **Add to Home screen** while on the portal to open it like an app.

> **If the `.js` link does not work on your phone, use the Tampermonkey zip instead - it works.** Download [StudentDesk-AIUB-Tampermonkey.zip](https://github.com/amitsami/studentdesk-aiub/releases/latest/download/StudentDesk-AIUB-Tampermonkey.zip) and import it in Tampermonkey (see [Tampermonkey zip import](#tampermonkey-zip-import-phone-and-pc)).

### iPhone / iPad

1. Open the **App Store**, search for **Userscripts** (free, by Justin Wasack) and install it.
2. Open **Settings -> Safari -> Extensions -> Userscripts**, turn it **on**, and set **portal.aiub.edu** (or All Websites) to **Allow**.
3. Open the Userscripts app once and choose a folder to save scripts (for example, "On My iPhone -> Userscripts").
4. In **Safari**, open this link: [StudentDesk-AIUB.user.js](https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js)
5. Tap the **puzzle / aA icon** in the address bar -> **Userscripts** -> **Install**.
6. Open https://portal.aiub.edu in Safari and sign in.

### PC with Tampermonkey (recommended, auto-updates)

Works in Chrome, Edge, Brave, Firefox and Opera.

1. Install **Tampermonkey** from your browser's store:
   - Chrome / Brave: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Edge: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
   - Firefox: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)
2. **Chrome / Edge / Brave only:** open the extensions page (`chrome://extensions`), turn on **Developer mode** (top right), then open Tampermonkey's **Details** and turn on **Allow User Scripts** if you see that option. Tampermonkey needs this to run scripts.
3. Open this link: [StudentDesk-AIUB.user.js](https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js)
4. Tampermonkey opens an install page. Click **Install**.
5. Open https://portal.aiub.edu and sign in.

### PC with the browser extension (no Tampermonkey)

Works in Chrome, Edge and Brave.

1. Download [StudentDesk-AIUB-extension.zip](https://github.com/amitsami/studentdesk-aiub/releases/latest/download/StudentDesk-AIUB-extension.zip).
2. **Extract** the zip: right-click -> **Extract All** (Windows) or double-click (Mac). You get a folder with `manifest.json` inside.
3. Move that folder somewhere safe (for example, Documents). **Do not delete it later** - the browser loads the extension from this folder.
4. Open `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`).
5. Turn on **Developer mode** (top right).
6. Click **Load unpacked** and choose the extracted folder (the one that contains `manifest.json`).
7. If the browser asks for permission for www.aiub.edu and api.open-meteo.com, allow it (used for public notices, the faculty list and campus weather).
8. Open https://portal.aiub.edu and sign in.

Firefox: open `about:debugging#/runtime/this-firefox` -> **Load Temporary Add-on** -> choose `manifest.json`. This lasts until Firefox restarts, so on Firefox the Tampermonkey method is better.

### Tampermonkey zip import (phone and PC)

The Tampermonkey zip works on **phones too**, not only on PC. **If the `.js` link does not work on your phone, this zip works** - use it if opening the userscript link does not show an install page, or if you want to install from a downloaded file. Do **not** unzip it - Tampermonkey reads the zip directly.

**On an Android phone (Firefox + Tampermonkey):**

1. Install Firefox and the Tampermonkey add-on (see [Android phone](#android-phone), steps 1-3).
2. Download [StudentDesk-AIUB-Tampermonkey.zip](https://github.com/amitsami/studentdesk-aiub/releases/latest/download/StudentDesk-AIUB-Tampermonkey.zip) in Firefox. It is saved to your **Downloads** folder.
3. Open Firefox **menu (three dots)** -> **Add-ons** -> **Tampermonkey** -> **Dashboard**.
4. Tap the **Utilities** tab.
5. Under **Import from file**, tap **Choose file** and select `StudentDesk-AIUB-Tampermonkey.zip` from Downloads.
6. Tap **Install** (or **Import**) on the page that opens.
7. Open https://portal.aiub.edu and sign in.

**On a PC:**

1. Download [StudentDesk-AIUB-Tampermonkey.zip](https://github.com/amitsami/studentdesk-aiub/releases/latest/download/StudentDesk-AIUB-Tampermonkey.zip).
2. Click the Tampermonkey icon -> **Dashboard** -> **Utilities**.
3. Under **Import from file**, choose the zip -> **Install**.

Scripts imported from the zip still auto-update from GitHub.

## After installing: first use

1. Go to https://portal.aiub.edu and sign in with your AIUB ID and password as usual. The login captcha is a security check, so you still solve it yourself.
2. After signing in, StudentDesk opens its home screen: greeting, quick actions, routine, grades, payments and more.
3. On a phone, use the **tab bar at the bottom**. On a PC, use the **sidebar on the left**.
4. Open **Settings** in StudentDesk to choose light / dark mode, accent color and your start page.
5. The first load reads your data from the portal. After that, pages open much faster because data is cached on your device.

## CGPA privacy

Your CGPA is blurred everywhere (Grades page, CGPA chart, semester cards, What-if calculator, More profile and the classic portal), so people near your screen cannot see it. **Tap the blurred CGPA to show it, tap again to hide it.** It hides again automatically when you open another page.

## Faculty reviews

- Open **Home -> Faculty review** (also in More / the sidebar).
- **Give review:** shows every faculty you took a course with, semester by semester. Pick 1-5 stars, add an optional comment and tap **Submit**. You can edit or remove your review any time.
- **All reviews:** see everyone's reviews with search and three views: **By faculty** (average rating), **Top rated** and **With comments**. Tap a faculty to see all of their reviews.
- Reviews are **anonymous**: your name and student ID are never shown or sent. Abusive reviews can be reported and are hidden after 3 reports.
- Faculty reviews are connected to the project's review server, kept online by a GitHub Actions workflow. You do not need to set anything up.

## Updating

When a new version is out, StudentDesk tells you automatically:

- **Home** shows an **Update available** banner with the first new feature (tap **What's new**, or **X** to hide it for a day).
- **More** gets a red dot and an **Update available** card with all new features and an **Update now** (Tampermonkey) or **Download update** (extension) button that opens GitHub.
- After you update, Home shows **Updated to vX** once, and More shows your version with **Up to date** and what's new.

- **Userscript (Tampermonkey):** updates automatically. To update right away: Tampermonkey -> **Dashboard** -> **Check for userscript updates**.
- **iPhone (Userscripts):** open the Userscripts app -> **Update** or open the userscript link again.
- **From a store (Edge Add-ons, Firefox Add-ons, Opera add-ons, Greasy Fork):** updates install automatically. Store links are added here once each store approves StudentDesk.
- **Browser extension (zip):** does not update itself. Download the new `StudentDesk-AIUB-extension.zip` from [Releases](https://github.com/amitsami/studentdesk-aiub/releases), extract it **into the same folder** (replace the old files), then click **Reload** on the extension's card in `chrome://extensions`.

## Turning it off or removing it

- **Tampermonkey:** click the Tampermonkey icon and switch **StudentDesk AIUB** off, or delete it in the Dashboard.
- **Extension:** `chrome://extensions` -> turn the switch off, or click **Remove**.
- To see the original portal layout without removing anything, open **Classic portal view** inside StudentDesk.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| The portal looks unchanged | Check that the script / extension is **on**, then reload the page. In Chrome, Edge or Brave, make sure **Developer mode** (and **Allow User Scripts** for Tampermonkey) is on. |
| The `.js` link does not work on my phone | Use the Tampermonkey zip instead - it works on phones. See [Tampermonkey zip import](#tampermonkey-zip-import-phone-and-pc). |
| Opening the userscript link only shows code | Tampermonkey is not installed or not enabled in this browser. Install it first, or use the Tampermonkey zip import. |
| "Manifest file is missing" when loading the extension | Choose the folder that directly contains `manifest.json`, not the zip and not a parent folder. |
| The extension stopped working | You probably moved or deleted the extracted folder. Load it again from its new location. |
| Faculty reviews do not load | Check your internet connection and tap **Refresh** on the Reviews page. |
| Something else | [Open an issue](https://github.com/amitsami/studentdesk-aiub/issues) with your device, browser and a screenshot. |

## Features

- App-style home with greeting, quick actions, class routine, grades, payments and mail
- Liquid Glass theme with light / dark mode and custom accent colors
- Phone layout with a bottom tab bar, PC layout with a sidebar
- Red update dots for new notices, notifications, grades, courses, routine and mail
- Exam routine detection with countdown
- Live campus weather for AIUB
- Faculty list with photos, rooms and emails
- Anonymous faculty reviews (1-5 stars + comment), shared between all StudentDesk users
- CGPA privacy: CGPA is blurred everywhere until you tap it
- "What's new" section in More with update alerts and a GitHub update link
- Fast loading with smart background caching

## Privacy

- StudentDesk only changes how the portal looks in your browser. All data comes directly from portal.aiub.edu.
- Your ID and password are typed into the real portal login page. StudentDesk never reads or stores them.
- Cached data stays on your device and is cleared when you sign out.
- Faculty reviews are anonymous: only the faculty, course, semester, stars, comment and a one-way scrambled code are sent. Your name and student ID are never sent.
- Full privacy policy: [PRIVACY.md](PRIVACY.md)

## For developers

| Path | Contents |
| --- | --- |
| `extension/` | Browser extension (Manifest V3) |
| `userscript/` | Generated Tampermonkey userscript |
| `server/schema.sql` | Review server database schema (developer only, students do not need it) |
| `scripts/build.js` | Builds the userscript from the extension sources |
| `update.json` | Latest version info shown in the app's What's new card (update it with every release) |
| `docs/INSTALL.md` | Install guide |

### Publishing an update (users are notified automatically)

1. Change the files in `extension/`.
2. Set the new version in `extension/manifest.json`.
3. Add an entry at the top of `CHANGELOG.md`: `## <version> - Short title` followed by `- feature` lines (these lines are what users see).
4. Run `node scripts/build.js` - it updates the userscript, the in-app version / What's new list and `update.json`.
5. Commit and push to `main` (and create a release with the files). Within about an hour every StudentDesk user sees **Update available** with the new features.

Build the userscript after changing files in `extension/`:

```bash
node scripts/build.js
node --check userscript/StudentDesk-AIUB.user.js
```

## Author

Amit Hasan Sami ([@amitsami](https://github.com/amitsami))

StudentDesk AIUB is an unofficial student project and is not affiliated with American International University-Bangladesh.

License: [MIT](LICENSE)
