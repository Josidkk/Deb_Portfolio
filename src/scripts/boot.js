/**
 * boot.js — updated to wire in scroll animations after reveal.
 *
 * Changes from original:
 *  - Imports initScrollAnimations
 *  - Calls it at the right moment (after #app is visible + transition settles)
 *  - Slightly tighter timing (0.15 s delay instead of 0.2 s in CSS)
 */

import { initScrollAnimations } from './scrollAnimations.js';

export function startBootSequence() {
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        terminateBoot();
    }, 2000);
}

function terminateBoot() {
    const loadingLayer = document.getElementById('loading-layer');
    const app = document.getElementById('app');

    loadingLayer.classList.add('fade-out');

    setTimeout(() => {
        loadingLayer.style.display = 'none';
        app.classList.remove('hidden');
        app.classList.add('fade-in');

        window.dispatchEvent(new Event('resize'));

        // Restore scroll after fade-in completes
        setTimeout(() => {
            document.body.style.overflow = '';
        }, 1200);

        // Init scroll animations once the app is visible.
        // A short delay lets the DOM paint and the fade-in begin
        // before the IntersectionObserver fires.
        setTimeout(() => {
            initScrollAnimations();
        }, 300);

    }, 400);
}