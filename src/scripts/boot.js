/**
 * boot.js — SVG draw boot animation.
 *
 * Sequence:
 *  1. > (chevron) traces itself via stroke-dashoffset
 *  2. D traces itself
 *  3. _ stamps in with a blink
 *  4. Pink ambient glow + logo drop-shadow
 *  5. "from Deyby" fades in
 *  6. terminateBoot() → fade-out, reveal app
 *
 * CSS lives in main.css under "BOOT SCREEN"
 */

import { initScrollAnimations } from './scrollAnimations.js';

// ─── Timing (ms) ────────────────────────────────────────────────────────────
const T = {
    chevronStart: 600,
    chevronDur: 1000,
    dStart: 1800,
    dDur: 1200,
    glowStart: 3200,
    underscoreStart: 3400,
    logoGlow: 3900,
    terminate: 5000,
};
// ─── Public entry point ──────────────────────────────────────────────────────
export function startBootSequence() {
    document.body.style.overflow = 'hidden';

    // Vaciar el layer ANTES del primer paint para evitar el flash del <img> anterior.
    // El #loading-layer viene vacío desde el HTML, así que esto es solo por seguridad.
    const layer = document.getElementById('loading-layer');
    if (!layer) return;

    layer.innerHTML = `
        <div id="boot-ambient"></div>

        <div id="boot-stage">

            <svg id="boot-logo"
                 viewBox="80 200 780 620"
                 xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(-35 0) scale(1.20 1)">

                    <path id="boot-chevron" class="boot-stroke" d="
                        M 137.2 531.8
                        l 0.3 -52.3
                        10.5 -6.1
                        c 182.1 -106.1 196.3 -114.5 196.1 -115.9
                        -0.1 -1 -2.5 -2.4 -38.1 -22.9
                        -10.7 -6.2 -36.8 -21.3 -58 -33.6
                        -36.7 -21.2 -97.7 -56.4 -106.8 -61.7
                        l -4.2 -2.4
                        0.2 -48.7
                        0.3 -48.7
                        5.1 -0.3
                        c 5.5 -0.3 3.3 -1.5 87.4 47
                        9.1 5.2 22.4 12.9 29.7 17.1
                        7.3 4.2 22.8 13.2 34.5 20
                        11.7 6.8 36.4 21 54.8 31.7
                        51.2 29.5 58.6 34 65.4 39.6
                        11.6 9.5 20.2 23.2 24.8 39
                        2 7 2.3 10 2.2 26.4
                        0 17.2 -0.2 19.1 -2.8 27.5
                        -6.2 20.3 -17.4 34.2 -37.3 46.1
                        -9.7 5.8 -42.2 24.8 -82.8 48.4
                        -19.2 11.2 -57.9 33.7 -86 50
                        -88.9 51.8 -89.3 52 -92.5 52
                        l -3 0 0.2 -52.2 z
                    "/>

                    <path id="boot-d" class="boot-stroke" d="
                        M 137 747.1
                        c 0 -26.9 0.4 -49.2 1.1 -53.8
                        2.4 -17.7 10.1 -33.3 23.2 -47
                        12.1 -12.6 22.2 -19.8 52.4 -37.1
                        11.4 -6.6 14.9 -8.2 18.2 -8.2
                        l 4.1 0 0.1 49.3
                        c 0.1 27 0.4 50.3 0.8 51.7
                        l 0.7 2.5 37.4 0
                        c 31.7 -0.1 38.9 -0.3 46.5 -1.8
                        38.8 -7.6 67.9 -22.7 92.1 -47.8
                        26.6 -27.7 40.9 -59.9 44.5 -100.3
                        1.9 -21.6 -1.3 -46.3 -9.2 -69.8
                        -2.1 -6.5 -3.9 -12.7 -3.9 -13.8
                        0 -1.2 4.3 -6.3 11.3 -13.3
                        15.5 -15.3 24.7 -29.8 31.1 -48.9
                        3 -9 6.2 -24.7 7.1 -35
                        l 0.7 -7.8 4.3 0 4.3 0
                        6.7 10.1
                        c 27.9 42.1 43.2 88.5 46.5 141.7
                        1.1 17.8 0.2 46.4 -2 61.3
                        -8.8 59.6 -31.2 106.2 -70 144.9
                        -36.6 36.7 -78.1 57.6 -131.4 66.3
                        -12.6 2 -16.7 2.1 -114.8 2.4
                        l -101.8 0.4 0 -46 z
                    "/>

                    <path id="boot-underscore" d="
                        M 564 750
                        l 0 -43
                        143 0 143 0
                        0 43 0 43
                        -143 0 -143 0
                        0 -43 z
                    "/>

                </g>
            </svg>

            <div id="boot-from">
                <span class="boot-from-text">from</span>
                <span class="boot-deyby-text">Deyby</span>
            </div>

        </div>
    `;

    runSequence();
}

// ─── Animation helpers ───────────────────────────────────────────────────────
function drawPath(el, durationMs) {
    const len = el.getTotalLength();
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    el.getBoundingClientRect(); // force reflow
    el.style.transition = `stroke-dashoffset ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    el.style.strokeDashoffset = '0';
}

function blinkStamp(el, times, intervalMs, onDone) {
    let count = 0;
    const iv = setInterval(() => {
        el.style.opacity = count % 2 === 0 ? '0' : '1';
        count++;
        if (count >= times * 2) {
            clearInterval(iv);
            el.style.opacity = '1';
            onDone?.();
        }
    }, intervalMs);
}

// ─── Main sequence ───────────────────────────────────────────────────────────
function runSequence() {
    const chevron = document.getElementById('boot-chevron');
    const pathD = document.getElementById('boot-d');
    const underscore = document.getElementById('boot-underscore');
    const logo = document.getElementById('boot-logo');
    const ambient = document.getElementById('boot-ambient');
    const fromLabel = document.getElementById('boot-from');

    // Pre-hide stroked paths
    [chevron, pathD].forEach(p => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
    });

    // 1 — draw >
    setTimeout(() => drawPath(chevron, T.chevronDur), T.chevronStart);

    // 2 — draw D
    setTimeout(() => drawPath(pathD, T.dDur), T.dStart);

    // 3 — pink ambient
    setTimeout(() => ambient.classList.add('expand'), T.glowStart);

    // 4 — _ blink-stamp → "from Deyby" aparece
    setTimeout(() => {
        blinkStamp(underscore, 3, 110, () => {
            fromLabel.classList.add('show');
        });
    }, T.underscoreStart);

    // 5 — logo glow
    setTimeout(() => logo.classList.add('lit'), T.logoGlow);

    // 6 — terminate
    setTimeout(() => terminateBoot(), T.terminate);
}

// ─── Terminate ───────────────────────────────────────────────────────────────
function terminateBoot() {
    const loadingLayer = document.getElementById('loading-layer');
    const app = document.getElementById('app');

    loadingLayer.classList.add('fade-out');

    setTimeout(() => {
        loadingLayer.style.display = 'none';
        app.classList.remove('hidden');
        app.classList.add('fade-in');

        window.dispatchEvent(new Event('resize'));

        setTimeout(() => {
            document.body.style.overflow = '';
        }, 1200);

        setTimeout(() => {
            initScrollAnimations();
        }, 40);

    }, 700);
}