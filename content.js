// content.js v3.2 — With sensitivity control

let settings = { highRes: 'hd1080', lowRes: 'medium', cameraEnabled: false, sensitivity: 5 };
let isLooking = true;
let camVideo = null;
let loopTimer = null;
let modelLoaded = false;
let lastSetQuality = null;

// ===== Send quality to player.js =====
function setYoutubeQuality(qualityKey) {
    if (qualityKey === lastSetQuality) return;
    lastSetQuality = qualityKey;
    window.postMessage({
        source: 'smartyt-content',
        type: 'SET_QUALITY',
        quality: qualityKey
    }, '*');
}

// ===== Overlay =====
function showOverlay(text, color) {
    let ov = document.getElementById('smartyt-overlay');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'smartyt-overlay';
        ov.style.cssText = 'position:fixed;top:70px;right:20px;padding:10px 16px;background:rgba(0,0,0,0.92);font-weight:800;font-family:sans-serif;border-radius:8px;z-index:2147483647;font-size:14px;pointer-events:none;box-shadow:0 0 20px rgba(0,0,0,0.5);';
        document.body.appendChild(ov);
    }
    ov.innerText = text;
    ov.style.color = color;
    ov.style.borderLeft = '4px solid ' + color;
}

function applyQuality() {
    const q = isLooking ? settings.highRes : settings.lowRes;
    setYoutubeQuality(q);
    showOverlay(
        isLooking ? '👁 WATCHING → ' + q.toUpperCase() : '💤 AWAY → ' + q.toUpperCase(),
        isLooking ? '#00ff00' : '#ff0000'
    );
}

// ===== Calculate detection zone from sensitivity =====
function getZoneBounds() {
    // Sensitivity 1  → zone = 25% to 75% (very relaxed, big "looking" zone)
    // Sensitivity 5  → zone = 37% to 63% (moderate)
    // Sensitivity 10 → zone = 48% to 52% (ultra strict, barely move = away)
    const sens = settings.sensitivity || 5;
    const halfZone = 0.25 - (sens - 1) * (0.23 / 9);
    const minX = 0.50 - halfZone;
    const maxX = 0.50 + halfZone;
    return { minX, maxX };
}

// ===== Load Model =====
async function loadModel() {
    if (modelLoaded) return true;
    if (typeof faceapi === 'undefined') {
        showOverlay('⚠ face-api.js missing', '#ff0000');
        return false;
    }
    try {
        showOverlay('⏳ Loading AI...', '#ffa600');
        const modelPath = chrome.runtime.getURL('models');
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
        modelLoaded = true;
        console.log('[SmartYT] ✅ Model loaded!');
        return true;
    } catch (err) {
        console.error('[SmartYT] Model error:', err);
        showOverlay('⚠ Model failed', '#ff0000');
        return false;
    }
}

// ===== Camera =====
async function startCamera() {
    if (camVideo) return;
    const loaded = await loadModel();
    if (!loaded) return;

    try {
        camVideo = document.createElement('video');
        camVideo.setAttribute('autoplay', '');
        camVideo.setAttribute('playsinline', '');
        camVideo.muted = true;
        camVideo.style.cssText = 'position:fixed;bottom:10px;left:10px;width:180px;height:135px;z-index:2147483647;border:3px solid #555;border-radius:10px;background:#000;transform:scaleX(-1);object-fit:cover;';
        document.body.appendChild(camVideo);

        const lbl = document.createElement('div');
        lbl.id = 'smartyt-label';
        lbl.style.cssText = 'position:fixed;bottom:150px;left:10px;color:#fff;font-size:11px;font-weight:bold;padding:4px 10px;z-index:2147483647;border-radius:5px;font-family:sans-serif;background:#555;';
        lbl.innerText = '⏳ Starting...';
        document.body.appendChild(lbl);

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' }
        });
        camVideo.srcObject = stream;
        await camVideo.play();
        console.log('[SmartYT] Camera active!');
        showOverlay('📷 AI Active', '#00ff00');
        startDetectionLoop();
    } catch (err) {
        console.error('[SmartYT] Camera error:', err);
        showOverlay('❌ Camera denied', '#ff0000');
    }
}

function stopCamera() {
    if (camVideo && camVideo.srcObject) camVideo.srcObject.getTracks().forEach(t => t.stop());
    if (camVideo) camVideo.remove();
    camVideo = null;
    const lbl = document.getElementById('smartyt-label');
    if (lbl) lbl.remove();
    clearInterval(loopTimer);
}

// ===== Detection Loop =====
function startDetectionLoop() {
    clearInterval(loopTimer);
    loopTimer = setInterval(async () => {
        if (!camVideo || camVideo.paused || camVideo.readyState < 2) return;
        try {
            const detections = await faceapi.detectAllFaces(
                camVideo,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 })
            );
            let nowLooking = false;
            const lbl = document.getElementById('smartyt-label');
            const zone = getZoneBounds();

            if (detections.length > 0) {
                const box = detections[0].box;
                const vw = camVideo.videoWidth || 320;
                const cx = box.x + box.width / 2;
                const ratio = cx / vw;

                nowLooking = ratio > zone.minX && ratio < zone.maxX;

                const pct = Math.round(ratio * 100);
                const zMin = Math.round(zone.minX * 100);
                const zMax = Math.round(zone.maxX * 100);

                if (lbl) {
                    lbl.innerText = nowLooking
                        ? '👁 WATCHING (' + pct + '%)'
                        : '💤 AWAY (' + pct + '% outside ' + zMin + '-' + zMax + '%)';
                    lbl.style.background = nowLooking ? '#00aa00' : '#ff0000';
                }
                camVideo.style.borderColor = nowLooking ? '#00ff00' : '#ff0000';
            } else {
                nowLooking = false;
                if (lbl) { lbl.innerText = '❌ NO FACE'; lbl.style.background = '#888'; }
                camVideo.style.borderColor = '#555';
            }

            if (nowLooking !== isLooking) {
                isLooking = nowLooking;
                lastSetQuality = null;
                applyQuality();
            }
        } catch (err) {
            console.error('[SmartYT] Detection error:', err);
        }
    }, 600);
}

// ===== Init =====
chrome.storage.local.get(['highRes', 'lowRes', 'cameraEnabled', 'sensitivity'], (result) => {
    settings = { ...settings, ...result };
    console.log('[SmartYT] Settings:', settings);
    if (settings.cameraEnabled) startCamera();
    applyQuality();
});

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'UPDATE_SETTINGS') {
        const wasCamera = settings.cameraEnabled;
        settings = request.data;
        if (settings.cameraEnabled && !wasCamera) startCamera();
        else if (!settings.cameraEnabled && wasCamera) { stopCamera(); isLooking = true; }
        lastSetQuality = null;
        applyQuality();
    }
});

console.log('[SmartYT] Content script v3.2 loaded!');
