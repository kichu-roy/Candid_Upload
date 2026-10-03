# Candid Upload

A static GitHub Pages upload form that saves submissions to a Google Drive folder through a Google Apps Script web app. Uploaders do not sign in; the script runs as the Drive owner.

## Configure Google Drive

1. Create a folder in the Google account that should receive uploads. Copy its folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID`.
2. Open [script.google.com](https://script.google.com/) while signed in to that account and create a project.
3. Replace the starter code with the contents of [`Code.gs`](Code.gs).
4. In **Project Settings → Script Properties**, add `DRIVE_FOLDER_ID` with the folder ID from step 1. The script uses the Drive service as the owner; no Drive ID or credential is placed in the public page.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as** to your account and **Who has access** to **Anyone**. Deploy, authorize the requested Drive access, and copy the web app URL ending in `/exec`.
6. In [`index.html`](index.html), set `UPLOAD_ENDPOINT` to that `/exec` URL if it changes.
7. Push the repository to GitHub. In **Settings → Pages**, publish from the branch and folder containing `index.html` (usually `main` / `/(root)`).

Google Workspace administrators may disable anonymous web-app access. In that case, this design cannot accept uploads from users without Google sign-in until the administrator enables access or the backend is moved to another hosting service.

## Upload and privacy behavior

- The form requires a name and at least one image or video. It accepts up to 10 files and 25 MB total per submission; Apps Script validates these limits again before writing.
- Files go directly into one `YYYY-MM-DD GMT` folder under the configured Drive folder, based on the server upload date in GMT. A short script lock prevents simultaneous first uploads from creating duplicate date folders.
- Each uploaded filename is prefixed with the sanitized name entered in the form. No per-submission folder or JSON receipt is created. Existing folders and receipt files from earlier uploads are not removed.
- New files inherit the destination folder's sharing permissions. The script does not make them public.
- The entered name is included in every filename. Tell guests who can access the Drive folder and how long uploads will be retained.

## Important: public endpoint

“Anyone” means anyone who discovers the page or its Apps Script URL can submit files, and the URL is visible in the page source. There is no uploader authentication or rate limiting here. The size and file-count limits reduce accidental large submissions but do not prevent abuse or protect Drive quota. Before collecting real uploads, consider adding a CAPTCHA with server-side verification, monitoring the folder and Apps Script quotas, and using a dedicated Drive account/folder. Never put Google credentials, API keys, or private tokens in `index.html`.

Apps Script is not an upload queue. It allows at most 30 simultaneous executions per user, with a 6-minute limit per execution; a burst of hundreds of guests can be throttled or fail. Free personal Google accounts have 15 GB shared across Drive, Gmail, and Photos. At 500 submissions of 25 MB each, uploads could consume 12.5 GB before accounting for existing storage, so check available Drive space and lower the cap if needed. The 25 MB limit is for modest batches, not long/high-resolution videos. This endpoint sends a single base64-encoded request, so it does not provide resumable chunks or byte-level progress and cannot make slow mobile networks faster. For reliable 250 MB files or large simultaneous bursts, this free Apps Script approach is not sufficient.
