# BrightMouth Therapy Coach

BrightMouth is a browser-based assistive practice app for children working on facial-motor, speech, and chewing exercises at home. It uses webcam-based facial landmark tracking to guide child-friendly therapy-style activities with real-time feedback, progress scoring, gamified rewards, and caregiver summaries.

## What It Does

- Tracks facial landmarks around the mouth, lips, cheeks, jaw, eyes, and eyebrows.
- Measures movement signals such as mouth opening, lip symmetry, jaw range, cheek movement, movement consistency, and left-right balance.
- Guides children through exercises like smiling evenly, opening/closing the mouth, jaw side-to-side movement, puffing cheeks, lip closure, sound shapes, and chewing-like rhythm practice.
- Adds gamification with XP, levels, stars, combo streaks, helper unlocks, daily challenges, badges, and milestone tracking.
- Provides parent/therapist summaries, caregiver notes, session history, exportable reports, and a milestone calendar.

## Important Disclaimer

BrightMouth is an assistive home-practice and engagement tool. It does not diagnose, treat, or replace guidance from a speech-language pathologist, occupational therapist, dentist, orthodontist, physician, or other licensed clinician.

## Tech Stack

- React
- Vite
- MediaPipe Tasks Vision Face Landmarker
- Local browser storage for session history
- Webcam APIs running in the browser

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

Then:

1. Click `Start camera`.
2. Allow camera permission.
3. Click `Calibrate`.
4. Start practicing exercises.

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Privacy Notes

- Webcam processing runs in the browser.
- No backend is required.
- Session history is stored locally in the browser.
- Exported reports are generated locally as text files.

## Deployment

The app can be deployed as a static Vite app on Vercel or any static hosting platform.

If using Vercel with GitHub, commit and push changes to the connected branch:

```bash
git add .
git commit -m "Update BrightMouth app"
git push origin main
```

Vercel should redeploy automatically if the project is connected.
