// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const highResSelect = document.getElementById('res-high');
    const lowResSelect = document.getElementById('res-low');
    const cameraToggle = document.getElementById('camera-toggle');
    const sensitivitySlider = document.getElementById('sensitivity');
    const sensLabel = document.getElementById('sens-label');
    const zoneInfo = document.getElementById('zone-info');

    function updateZoneDisplay(val) {
        // Sensitivity 1 = zone 25%-75% (very relaxed)
        // Sensitivity 10 = zone 48%-52% (ultra strict, barely move = trigger)
        const halfZone = 25 - (val - 1) * (23 / 9); // 25% down to ~2%
        const left = Math.round(50 - halfZone);
        const right = Math.round(50 + halfZone);
        zoneInfo.innerText = left + '% – ' + right + '%';
    }

    // Load saved preferences
    chrome.storage.local.get(['highRes', 'lowRes', 'cameraEnabled', 'sensitivity'], (result) => {
        if (result.highRes) highResSelect.value = result.highRes;
        if (result.lowRes) lowResSelect.value = result.lowRes;
        if (result.cameraEnabled !== undefined) cameraToggle.checked = result.cameraEnabled;
        if (result.sensitivity !== undefined) {
            sensitivitySlider.value = result.sensitivity;
            sensLabel.innerText = result.sensitivity;
        }
        updateZoneDisplay(parseInt(sensitivitySlider.value));
    });

    sensitivitySlider.addEventListener('input', () => {
        sensLabel.innerText = sensitivitySlider.value;
        updateZoneDisplay(parseInt(sensitivitySlider.value));
    });

    function saveAndSync() {
        const s = {
            highRes: highResSelect.value,
            lowRes: lowResSelect.value,
            cameraEnabled: cameraToggle.checked,
            sensitivity: parseInt(sensitivitySlider.value)
        };

        chrome.storage.local.set(s, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_SETTINGS', data: s });
                }
            });
        });
    }

    highResSelect.addEventListener('change', saveAndSync);
    lowResSelect.addEventListener('change', saveAndSync);
    cameraToggle.addEventListener('change', saveAndSync);
    sensitivitySlider.addEventListener('change', saveAndSync);
});
