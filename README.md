# Candid Upload

A static GitHub Pages upload form that saves submissions to a Google Drive folder through a Google Apps Script web app. Uploaders do not sign in; the script runs as the Drive owner.

## Configure Google Drive

1. Create a folder in the Google account that should receive uploads. Copy its folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID`.
2. Open [script.google.com](https://script.google.com/) while signed in to that account and create a project.
3. Replace the starter code with the contents of [`Code.gs`](Code.gs).
4. In **Project Settings → Script Properties**, add `DRIVE_FOLDER_ID` with the folder ID from step 1. The script uses the Drive service as the owner; no Drive ID or credential is placed in the public page.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as** to your account and **Who has access** to **Anyone**. Deploy, authorize the requested Drive access, and copy the web app URL ending in `/exec`.
6. In [`index.html`](index.html), replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with that `/exec` URL.
7. Push the repository to GitHub. In **Settings → Pages**, publish from the branch and folder containing `index.html` (usually `main` / `/(root)`).

Google Workspace administrators may disable anonymous web-app access. In that case, this design cannot accept uploads from users without Google sign-in until the administrator enables access or the backend is moved to another hosting service.

## Upload and privacy behavior

- The form accepts up to 5 files and 10 MB total per submission. Apps Script validates these limits again before writing.
- Each submission gets its own folder and a `submission.json` file containing the sender's name, email, note, timestamp, and filenames.
- New files inherit the destination folder's sharing permissions. The script does not make them public.
- The name, email, and note are personal data saved unencrypted in the Drive folder. Tell uploaders who can access it and how long it will be retained.

## Important: public endpoint

“Anyone” means anyone who discovers the page or its Apps Script URL can submit files, and the URL is visible in the page source. There is no uploader authentication or rate limiting here. The size and file-count limits reduce accidental large submissions but do not prevent abuse or protect Drive quota. Before collecting real uploads, consider adding a CAPTCHA with server-side verification, monitoring the folder and Apps Script quotas, and using a dedicated Drive account/folder. Never put Google credentials, API keys, or private tokens in `index.html`.
