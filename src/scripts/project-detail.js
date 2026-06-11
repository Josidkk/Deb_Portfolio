/**
 * project-detail.js
 * Renders the Josidk ERP Template detail page.
 */

// ── Data ─────────────────────────────────────────

const projectData = {
    liveUrl: 'https://josidk-template.vercel.app/login',

    slides: [
        { src: './public/assets/Shot2.png', alt: 'Josidk ERP Template — Dashboard principal' }
    ],

    features: [
        {
            icon: 'fas fa-chart-line',
            title: 'Dashboard con Gráficas',
            desc: 'Panel principal con Chart.js, tabla de usuarios y módulo eCommerce con CRUD completo.'
        },
        {
            icon: 'fas fa-columns',
            title: 'Kanban con Drag & Drop',
            desc: 'Gestión visual de tareas con tablero Kanban y calendario de eventos integrado.'
        },
        {
            icon: 'fas fa-comments',
            title: 'Comunicación',
            desc: 'Interfaces de demostración para Chat y Email, listas para integrar con tu backend.'
        },
        {
            icon: 'fas fa-shield-halved',
            title: 'Autenticación',
            desc: 'Login + Register opcionales en el configurador. Protección de rutas con Auth Guard.'
        },
        {
            icon: 'fas fa-puzzle-piece',
            title: 'UI Components',
            desc: '6 páginas con ejemplos de Angular Material: tablas, formularios, cards, chips y más.'
        },
        {
            icon: 'fas fa-recycle',
            title: 'Componentes Reutilizables',
            desc: 'Sidebar, Navbar, Breadcrumb, ConfirmDialog y NotificationService listos para usar.'
        }
    ],

    customizations: [
        {
            icon: 'fas fa-swatchbook',
            title: 'Paletas de Color',
            desc: '6 temas predefinidos + editor personalizado con vista previa en vivo.'
        },
        {
            icon: 'fas fa-toggle-on',
            title: 'Módulos',
            desc: 'Activa o desactiva páginas. Login es obligatorio, Register opcional.'
        },
        {
            icon: 'fas fa-layer-group',
            title: 'Layout',
            desc: 'Ancho del sidebar, radio de bordes, velocidad de animación y tipografía.'
        },
        {
            icon: 'fas fa-circle-half-stroke',
            title: 'Tema Oscuro',
            desc: 'Claro, oscuro o seguir la preferencia del sistema. Por defecto: sistema.'
        }
    ],

    techStack: [
        { name: 'Angular', version: '18', icon: 'devicon-angularjs-plain', color: 'var(--color-accent-primary)' },
        { name: 'Angular Material', version: '18', icon: 'fas fa-cubes', color: 'var(--color-accent-primary)' },
        { name: 'Chart.js / ng2-charts', version: '4.5 / 6.0', icon: 'fas fa-chart-pie', color: 'var(--color-accent-primary)' },
        { name: 'Tabler Icons', version: 'CDN', icon: 'fas fa-shapes', color: 'var(--color-accent-primary)' },
        { name: 'Plus Jakarta Sans', version: 'Google Fonts', icon: 'fas fa-font', color: 'var(--color-accent-primary)' },
        { name: 'SCSS', version: '—', icon: 'devicon-sass-original', color: 'var(--color-accent-primary)' }
    ],

    structure: [
        { text: 'src/', type: 'dir' },
        { text: '├── app/', type: 'dir' },
        { text: '│   ├── core/config/app-config.ts', type: 'file', comment: '← Configuración centralizada', highlight: true },
        { text: '│   ├── core/services/', type: 'file', comment: '→ ThemeService, NotificationService' },
        { text: '│   ├── core/guards/auth.guard.ts', type: 'file', comment: '→ Protección de rutas' },
        { text: '│   ├── layouts/main-layout/', type: 'file', comment: '→ Sidebar + Navbar + Footer' },
        { text: '│   ├── pages/', type: 'file', comment: '→ 14 páginas (lazy loading)' },
        { text: '│   └── shared/', type: 'file', comment: '→ Sidebar, Navbar, Breadcrumb, diálogos' },
        { text: '└── styles.scss', type: 'file', comment: '← Variables CSS globales', highlight: true }
    ],

    commands: [
        { cmd: 'npm start', desc: 'Desarrollo con hot reload' },
        { cmd: 'npm run build', desc: 'Build de producción' },
        { cmd: 'npm test', desc: 'Ejecutar tests' },
        { cmd: 'ng generate component pages/mi-pagina', desc: 'Crear nueva página' }
    ]
};

// ── Toast ────────────────────────────────────────

function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pd-toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ── Render Functions ─────────────────────────────

function renderFeatures() {
    const grid = document.getElementById('features-grid');
    if (!grid) return;

    grid.innerHTML = projectData.features.map((f, i) => `
        <div class="pd-feature-card pd-reveal" style="transition-delay: ${i * 80}ms">
            <div class="pd-feature-icon">
                <i class="${f.icon}"></i>
            </div>
            <h3 class="pd-feature-title">${f.title}</h3>
            <p class="pd-feature-desc">${f.desc}</p>
        </div>
    `).join('');
}

function renderCustomizations() {
    const grid = document.getElementById('custom-grid');
    if (!grid) return;

    grid.innerHTML = projectData.customizations.map((c, i) => `
        <div class="pd-custom-card pd-reveal" style="transition-delay: ${i * 80}ms">
            <div class="pd-custom-icon"><i class="${c.icon}"></i></div>
            <h3 class="pd-custom-title">${c.title}</h3>
            <p class="pd-custom-desc">${c.desc}</p>
        </div>
    `).join('');
}

function renderTechStack() {
    const table = document.getElementById('tech-table');
    if (!table) return;

    table.innerHTML = projectData.techStack.map(t => `
        <div class="pd-tech-row">
            <div class="pd-tech-icon" style="color: ${t.color}">
                <i class="${t.icon}"></i>
            </div>
            <div class="pd-tech-info">
                <span class="pd-tech-name">${t.name}</span>
                <span class="pd-tech-version">${t.version}</span>
            </div>
        </div>
    `).join('');
}

function renderStructure() {
    const tree = document.getElementById('structure-tree');
    if (!tree) return;

    tree.innerHTML = projectData.structure.map(line => {
        let cls = line.type === 'dir' ? 'tree-dir' : 'tree-file';
        if (line.highlight) cls = 'tree-highlight';
        const comment = line.comment ? `<span class="tree-comment"> ${line.comment}</span>` : '';
        return `<div class="tree-line"><span class="${cls}">${line.text}</span>${comment}</div>`;
    }).join('');
}

function renderCommands() {
    const list = document.getElementById('commands-list');
    if (!list) return;

    list.innerHTML = projectData.commands.map(c => `
        <div class="pd-cmd-card" data-cmd="${c.cmd}">
            <span class="pd-cmd-text">$ ${c.cmd}</span>
            <span class="pd-cmd-desc">${c.desc}</span>
            <button class="pd-cmd-copy" title="Copiar comando">
                <i class="far fa-copy"></i>
            </button>
        </div>
    `).join('');

    list.addEventListener('click', (e) => {
        const btn = e.target.closest('.pd-cmd-copy');
        if (!btn) return;

        const card = btn.closest('.pd-cmd-card');
        const cmd = card.getAttribute('data-cmd');

        navigator.clipboard.writeText(cmd).then(() => {
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check"></i>';
            showToast(`Comando copiado: ${cmd}`);

            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = '<i class="far fa-copy"></i>';
            }, 2000);
        });
    });
}

// ── Slider ──────────────────────────────────────

let currentSlide = 0;
let slideInterval = null;

function initSlider() {
    const track = document.getElementById('pd-slider-track');
    const dotsContainer = document.getElementById('pd-slider-dots');
    const prevBtn = document.getElementById('pd-slider-prev');
    const nextBtn = document.getElementById('pd-slider-next');
    const slider = document.getElementById('pd-slider');

    if (!track || !projectData.slides.length) return;

    // Render slides
    track.innerHTML = projectData.slides.map((s, i) => `
        <div class="pd-slider-slide">
            <img src="${s.src}" alt="${s.alt}" loading="${i === 0 ? 'eager' : 'lazy'}">
            <div class="pd-slider-slide-overlay"></div>
        </div>
    `).join('');

    // Render dots
    if (projectData.slides.length > 1) {
        dotsContainer.innerHTML = projectData.slides.map((_, i) => `
            <button class="pd-slider-dot${i === 0 ? ' active' : ''}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>
        `).join('');
    }

    function goTo(index) {
        currentSlide = (index + projectData.slides.length) % projectData.slides.length;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update dots
        dotsContainer.querySelectorAll('.pd-slider-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function next() { goTo(currentSlide + 1); }
    function prev() { goTo(currentSlide - 1); }

    function startAutoplay() {
        stopAutoplay();
        slideInterval = setInterval(next, 4000);
    }

    function stopAutoplay() {
        if (slideInterval) clearInterval(slideInterval);
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

    dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.pd-slider-dot');
        if (!dot) return;
        goTo(parseInt(dot.dataset.slide));
        startAutoplay();
    });

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    // Touch / swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? next() : prev();
        }
        startAutoplay();
    }, { passive: true });

    // Keyboard
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
        if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    });

    // Start
    startAutoplay();
}

// ── Scroll Reveal ────────────────────────────────

function initScrollReveal() {
    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.pd-reveal').forEach(el => observer.observe(el));
}

// ── Scroll Progress ──────────────────────────────

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

// ── Init ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    renderFeatures();
    renderCustomizations();
    renderTechStack();
    renderStructure();
    renderCommands();
    initSlider();
    initHamburger();

    requestAnimationFrame(() => {
        initScrollReveal();
        initProgressBar();
    });
});

// ── Hamburger Menu ──────────────────────────────

function initHamburger() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');

    if (!hamburgerBtn || !navLinks) return;

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = hamburgerBtn.classList.toggle('is-open');
        navLinks.classList.toggle('is-open');
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('is-open');
            navLinks.classList.remove('is-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}
