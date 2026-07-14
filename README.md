 GVCC Learning Portal

A responsive learning portal built with HTML, CSS, and JavaScript for the GVCC assignment. It demonstrates video playback, persistent bookmarks, resume playback, screenshot-discouragement techniques, and student-friendly UI behavior without requiring a backend setup.

## Features

- Student login stored locally for demo purposes.
- Learning video catalog with an HTML5 video player.
- Multiple bookmarks per video.
- Optional bookmark names or notes.
- Exact timestamp resume from any bookmark.
- Edit and delete bookmarks.
- Persistent bookmark storage using `localStorage`.
- Continue Watching progress per video.
- Recently watched video list.
- Responsive desktop and mobile layout.
- Screenshot-discouragement layer while viewing protected learning content.

## Screenshot Protection Approach

Browsers cannot fully block screenshots because operating systems control screen capture. This project implements the strongest practical web-only discouragement mechanisms:

- Watermark overlay showing the logged-in student's email and video ID.
- Hide/cover the video when the tab loses focus or becomes hidden.
- Disable right-click/copy actions on the protected video area.
- Intercept common keys such as Print Screen, save, print, and developer tool shortcuts where browsers allow it.
- Disable video download and picture-in-picture controls using supported video attributes.

For production-grade protection, this should be paired with authenticated streaming, DRM such as Widevine/FairPlay/PlayReady, signed URLs, server-side access logs, and legal/user-policy controls.

## Project Structure

```text
gvcc-learning-portal/
  index.html
  styles.css
  app.js
  README.md
```

## Run Locally

Open `index.html` directly in a browser, or run a local static server:

```bash
node server.cjs
```

Then visit:

```text
http://localhost:5173
```

## Test Flow

1. Sign in with any student name and email.
2. Select a video from the sidebar.
3. Play or seek to a timestamp.
4. Add a bookmark with or without a title.
5. Click `Resume` on any bookmark to jump to the saved timestamp.
6. Refresh the page and confirm bookmarks/progress remain saved.
7. Switch tabs or press Print Screen while the video is visible to see the privacy shield behavior.

## Notes for Submission

This implementation uses browser `localStorage` as persistent storage. The bookmark data model is:

```json
{
  "id": "uuid",
  "videoId": "html-foundations",
  "name": "Important section",
  "timestamp": 122.4,
  "createdAt": "2026-07-14T00:00:00.000Z"
}
```

The app can be deployed as a static site on GitHub Pages, Netlify, Vercel, or any static hosting provider.
