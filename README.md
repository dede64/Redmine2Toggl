# Redmine2Toggl (Safari extension)

Copy the current Redmine ticket as `#1234: [Ticket title]` with one click.
Primarily designed to be used together with [**Toggl2Redmine**]( https://github.com/LukasHromadnik/Toggl2Redmine) tool.

## Why
[Toggl2Redmine](https://github.com/LukasHromadnik/Toggl2Redmine) expects time entry titles to start with `#{issue-id}: ...`.  
This extension copies exactly that pattern for the currently open Redmine issue page, so you can paste it straight into Toggl (or anywhere).

## How it works (under the hood)
- The toolbar button is enabled only on Redmine issue pages (e.g. domains that include `redmine` and a path with `/issues/`).
- When you click the button, the extension injects a tiny script into the current tab that:
  1. Extracts the **issue ID** from the URL (`/issues/1234`),
  2. Reads the **title** from `.issue .subject h3`,
  3. Copies `#1234: [Ticket title]` to your clipboard,
  4. Shows a small “Copied” toast on the page.
- Nothing is sent anywhere; it only reads the current page and writes to your clipboard.


## Installation (macOS Safari)

1. Open the Xcode project and **set your development team** in project settings.
2. **Run** the app target to install the extension host app.
3. Open **Safari → Settings → Extensions** and **enable** _Redmine Ticket Copier_.
4. _(Important)_ **Grant website access** (one-time):
   - Click your extension in the list → **Edit Websites…**
   - Add/allow your Redmine domains.


## Usage
- Open a Redmine ticket page (e.g. `https://redmine.example.com/issues/1234`).
- Click the toolbar button → clipboard gets: `#1234: [Ticket title]`.
- Paste the content into your Toggl timer


## Permissions

The extension needs:
- **Website access** (your Redmine site) — so it can read the page URL and title on issue pages.
- **Clipboard write** — to copy the formatted string for you.
- **Active tab** — to run only when you click the button on the current tab.

No analytics, no network requests, and nothing leaves your machine.


## Contributing
PRs welcome! Please file bugs via **Issues** with your Safari + macOS version.

## License
MIT
