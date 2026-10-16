# 🎧 HEARLY

**HEARLY** is a browser-based progressive web app (PWA) designed to help users stay aware of important sounds in their environment. This repository contains the React/TypeScript web app, including support for installation on compatible Android browsers.

It is especially useful for:

* Deaf and hard-of-hearing individuals
* People wearing headphones
* Students, workers, and gamers
* Anyone who wants extra safety and awareness

## Demo Live

Live demo:

https://mirora95.github.io/SmartHear/

## Local development

Use Node.js 22 (the version used by CI) and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open **http://localhost:3000/SmartHear/app.html**. The source entry is `app.html`; the root `index.html` is a checked-in built page, so use the app URL when developing. Vite is configured with the `/SmartHear/` base path.

No API key or `.env` file is required for the local sound-classification fallback. Leave `GEMINI_API_KEY` unset for this mode; copying the placeholder from `.env.example` enables an attempted Gemini request instead.

### Checks and production preview

```sh
npm run lint
npm run build
npm run preview
```

`lint` runs TypeScript checking (`tsc --noEmit`). There is currently no automated test script. Open **http://localhost:4173/SmartHear/app.html** for the production preview, or use the port printed by Vite if that port is busy. The build writes to `dist/`, which contains tracked generated files; review those changes before committing.

### Browser checks and current limits

* Allow microphone access, start monitoring from the Dashboard, confirm that the level changes, then stop monitoring. Microphone access requires a secure context: use `localhost` on your computer or HTTPS on another device, rather than an HTTP LAN address.
* Open Settings and adjust the sound threshold; return to the Dashboard to try it. The displayed "dB" value is a relative 0-100 level calculated from microphone frequency data, not a calibrated sound-pressure measurement.
* Without an API key, sound labels come from local frequency/volume heuristics. They are not a trained sound-recognition model or a reliable emergency alarm detector.
* Alerts use visual feedback and vibration where the browser supports it. The current code does not control the phone flashlight.
* History and analytics use in-memory events and reset when the page reloads.
* Comm Mode uses the browser's `SpeechRecognition` or `webkitSpeechRecognition` API. Availability and network requirements depend on the browser; this feature is separate from local sound classification.

### Optional Gemini classification

`src/lib/gemini.ts` can send the relative level and the first ten frequency bins to Gemini when `GEMINI_API_KEY` is set. `vite.config.ts` substitutes that key into the frontend bundle at build time. Do not put a real key into a publicly served build; see [Deployment Notes](DEPLOYMENT.md) for the backend requirement before using Gemini in production.

---

## 🚀 Problem

Many people miss important sounds like:

* alarms
* sirens
* door knocks
* baby crying
* someone calling them

This can lead to safety risks, stress, and communication problems.

---

## 💡 Solution

HEARLY uses the browser's microphone input to:

* detect sounds in real time
* classify what the sound is
* alert the user visually and, where supported, with vibration

---

## ✨ Features

### 🔊 Real-Time Sound Detection

* Detects sound using microphone
* Shows a relative sound level (displayed as "dB")
* Estimates sound types using local heuristics or optional Gemini classification

---

### 📊 Smart Dashboard

* Live sound level display
* Detected sound label
* Color alerts:

  * 🟢 Safe
  * 🟡 Warning
  * 🔴 Danger

---

### ⚙️ Custom Sensitivity

* Users can set sound threshold
* Works in different environments

---

### 🚨 Alert System

* Visual alerts
* Phone vibration where supported by the browser

---

### 🕒 Event History

* Keeps detected sound events in memory until the page reloads
* Includes:

  * sound type
  * time
  * decibel level

---

### 🗣️ Communication Mode

* Speech-to-text feature
* Converts speech into readable text

---

### 🌙 Sleep Mode

* Only alerts for critical sounds
* Perfect for nighttime use

---

### 📈 Analytics

* Shows sound trends
* Helps understand environment

---

## 🤖 AI Component

HEARLY uses local frequency/volume heuristics by default, with optional Gemini classification to:

* classify environmental sounds
* detect meaningful events
* prioritize important alerts

---

## 🛠️ Tech Stack

* React 19 and TypeScript
* Vite, Tailwind CSS, and PWA support
* Web Audio API and browser microphone access
* Local sound-classification heuristics; optional Gemini integration
* Browser speech-recognition API

---

## 🌍 Impact

HEARLY improves:

* accessibility
* safety
* independence

It helps users feel more confident and aware in daily life.

---

## 📱 Future Improvements

* Custom sound training
* Smartwatch integration
* Cloud sync
* Multi-language support

---

## 👩‍💻 Team

Built for Technovation Challenge 💡

---

## 📌 License

MIT License 
