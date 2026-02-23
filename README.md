# 🎂 Happy 20th Birthday Khushi

A premium animated birthday surprise website for Khushi's 20th Birthday (25 February).

## Setup – where to put your files

Put your files in these folders **next to index.html** (same level as the HTML file):

| Folder   | What to put |
|----------|-------------|
| **music/**  | `birthday.mp3` (background song) |
| **voice/**  | `message.MP3` or `message.mp3` (your voice note) |
| **images/** | Slideshow: `11.jpeg`, `2jpeg`, `3 jpeg`, `54 jpeg`, `5 jpeg` (exact names) |

So your project should look like:

```
birthday/
  index.html
  style.css
  script.js
  music/
    birthday.mp3
  voice/
    message.MP3           ← or message.mp3
  images/
    11.jpeg
    2jpeg
    3 jpeg                ← filename has a space
    54 jpeg
    5 jpeg
```

- **Background music** starts when the user clicks “START MISSION” (browsers block autoplay).
- If a file is missing, the site still works: no music/voice until you add the file, and images show a placeholder.

## Run locally

Use a local server so paths work:

```bash
npx serve .
```

Then open the URL shown (e.g. http://localhost:3000).

## Deploy on Vercel

Push this folder to GitHub, import the repo in [Vercel](https://vercel.com), and deploy. No build step needed.

## Features

- BGMI intro, fake lockscreen (swipe up), neon “KHUSHI”, floating balloons
- 3D cake with 20 candles, make a wish box, voice message (music pauses while it plays)
- Why Khushi Is Special, Things Khushi Loves, Dhoni section
- Photo slideshow with fireworks ending, romantic message, final surprise
- Music toggle, custom cursor, mobile responsive
