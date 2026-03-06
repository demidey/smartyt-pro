// player.js — Runs in YouTube's MAIN world (declared in manifest)
// Receives quality commands from content.js via window.postMessage
// Has DIRECT access to YouTube's movie_player object

(function () {
    'use strict';

    const QUALITY_MAP = {
        'hd2160': 'highres', 'hd1440': 'hd1440', 'hd1080': 'hd1080',
        'hd720': 'hd720', 'large': 'large', 'medium': 'medium',
        'small': 'small', 'tiny': 'tiny'
    };

    function setQuality(qualityKey) {
        const q = QUALITY_MAP[qualityKey] || qualityKey;
        const player = document.getElementById('movie_player');
        if (!player) {
            console.warn('[SmartYT Player] movie_player not found');
            return;
        }

        try {
            const avail = player.getAvailableQualityLevels();
            let target = q;

            if (avail && avail.length > 0 && !avail.includes(q)) {
                const order = ['highres', 'hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny'];
                const idx = order.indexOf(q);
                for (let i = idx; i < order.length; i++) {
                    if (avail.includes(order[i])) { target = order[i]; break; }
                }
            }

            player.setPlaybackQualityRange(target, target);
            player.setPlaybackQuality(target);
            console.log('[SmartYT Player] Quality set to:', target, '(available:', avail.join(','), ')');
        } catch (e) {
            console.error('[SmartYT Player] Error:', e);
        }
    }

    // Listen for commands from content.js
    window.addEventListener('message', function (event) {
        if (event.source !== window) return;
        if (!event.data || event.data.source !== 'smartyt-content') return;

        if (event.data.type === 'SET_QUALITY') {
            setQuality(event.data.quality);
        }
    });

    console.log('[SmartYT Player] player.js loaded in MAIN world!');
})();
