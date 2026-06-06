/**
 * scrollAnimations.js
 *
 * Drop this module into your project and call initScrollAnimations()
 * from main.js AFTER the boot sequence reveals #app.
 *
 * What it does:
 *  1. Scroll-reveal  — observes .reveal-* elements and adds .is-visible
 *  2. Stagger        — auto-assigns --stagger-delay to sibling items inside cards
 *  3. Nav shrink     — adds .nav-scrolled to #main-nav after 60 px
 *  4. Progress bar   — drives --scroll-pct CSS variable (0–100)
 *  5. Active nav     — highlights the link matching the current section
 *  6. Parallax       — subtle Y movement on .ambient-light elements
 */

// ── Config ──────────────────────────────────────────────────

const REVEAL_THRESHOLD = 0.12;   // % of element visible before triggering
const REVEAL_ROOT_MARGIN = '0px 0px -48px 0px'; // trigger a bit before bottom edge
const STAGGER_STEP_MS = 90;     // delay increment per sibling
const STAGGER_MAX_MS = 500;    // cap so later items aren't too slow
const PARALLAX_FACTOR = 0.08;   // lower = more subtle ambient movement

// ── 1. Scroll Reveal ────────────────────────────────────────

function initReveal() {
    const observer = new IntersectionObserver(
        (entries, obs) => onReveal(entries, obs), // ✅ pasar observer
        {
            threshold: REVEAL_THRESHOLD,
            rootMargin: REVEAL_ROOT_MARGIN,
        }
    );

    const selector = '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade, .reveal-line';
    document.querySelectorAll(selector).forEach(el => observer.observe(el));
}
function onReveal(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
    });
}

// ── 2. Auto-stagger children inside bento cards ──────────────

function initStagger() {
    // Groups whose direct children should be staggered
    const STAGGER_GROUPS = [
        '.bento-card .timeline-item',
        '.bento-card .contact-item',

    ];

    // Collect all cards that contain staggerable children
    const cards = document.querySelectorAll('.bento-card');

    cards.forEach(card => {
        STAGGER_GROUPS.forEach(sel => {
            const items = card.querySelectorAll(sel);
            if (!items.length) return;

            // Add reveal class if not already present
            items.forEach((item, i) => {
                if (!item.classList.contains('reveal-up') &&
                    !item.classList.contains('reveal-left') &&
                    !item.classList.contains('reveal-right') &&
                    !item.classList.contains('reveal-scale')) {
                    item.classList.add('reveal-up');
                }

                const delay = Math.min(i * STAGGER_STEP_MS, STAGGER_MAX_MS);
                item.style.setProperty('--stagger-delay', `${delay}ms`);
            });
        });
    });

    // Cards themselves reveal with a slight scale
    const observer = new IntersectionObserver(
        (entries, obs) => onReveal(entries, obs),
        { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN }
    );

    cards.forEach(card => {
        if (!card.classList.contains('reveal-scale')) {
            card.classList.add('reveal-scale');
        }
        observer.observe(card);
    });



}

// ── 3. Nav shrink ────────────────────────────────────────────

function initNavShrink() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const toggle = () => {
        nav.classList.toggle('nav-scrolled', window.scrollY > 60);
    };

    window.addEventListener('scroll', toggle, { passive: true });
    toggle(); // run once on load in case page starts mid-scroll
}

// ── 4. Scroll progress bar ───────────────────────────────────

function initProgressBar() {
    const update = () => {
        const scrolled = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (scrolled / max) * 100 : 0;
        document.documentElement.style.setProperty('--scroll-pct', pct.toFixed(2));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
}

// ── 5. Active nav link ───────────────────────────────────────

function initActiveNav() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!navLinks.length) return;

    // Build a map: sectionId → <a> element
    const linkMap = new Map();
    navLinks.forEach(a => {
        const id = a.getAttribute('href').replace('#', '');
        linkMap.set(id, a);
    });

    const sectionIds = [...linkMap.keys()];
    const ioOptions = { rootMargin: '-30% 0px -60% 0px', threshold: 0 };

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove .is-active from all, add to current
                navLinks.forEach(a => a.classList.remove('is-active'));
                const activeLink = linkMap.get(entry.target.id);
                if (activeLink) activeLink.classList.add('is-active');
            }
        });
    }, ioOptions);

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });
}

// ── 6. Ambient light parallax ────────────────────────────────

function initParallax() {
    const lights = document.querySelectorAll('.ambient-light');
    if (!lights.length) return;

    // Each light gets a slightly different speed/direction
    const configs = [
        { speed: PARALLAX_FACTOR, dir: 1 },
        { speed: PARALLAX_FACTOR * 0.6, dir: -1 },
        { speed: PARALLAX_FACTOR * 0.4, dir: 1 },
    ];

    let ticking = false;

    const update = () => {
        const y = window.scrollY;

        lights.forEach((light, i) => {
            const cfg = configs[i % configs.length];
            light.style.transform = `translateY(${y * cfg.speed * cfg.dir}px)`;
        });

        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}

// ── Main export ──────────────────────────────────────────────

/**
 * Call this once, after #app is visible (end of boot sequence).
 *
 * Usage in main.js:
 *   import { initScrollAnimations } from './scrollAnimations.js';
 *   // … inside terminateBoot, after app is shown:
 *   setTimeout(() => initScrollAnimations(), 300);
 */
export function initScrollAnimations() {
    initStagger();   // must run before initReveal so stagger classes exist
    initReveal();
    initNavShrink();
    initProgressBar();
    initActiveNav();
    initParallax();
}