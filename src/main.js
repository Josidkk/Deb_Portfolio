import { startBootSequence } from './scripts/boot.js';
import { HyperspaceSystem } from './scripts/hyperspace.js';
import { cvData } from './data.js';
import { TronRace } from './scripts/tron-race.js';
import { showToast } from './scripts/toast.js';
import { KonamiCode } from './scripts/konami.js';

document.addEventListener('DOMContentLoaded', () => {
    startBootSequence();
    renderContent();
    setupInteractions();
    new HyperspaceSystem('bg-canvas');
    new TronRace('tron-race-canvas');

    new KonamiCode(() => {
        document.body.classList.toggle('overdrive-mode');
        const isActive = document.body.classList.contains('overdrive-mode');
        showToast(isActive ? "⚠️ CYBER OVERDRIVE ACTIVATED ⚠️" : "System Re-stabilized");
    });

    // Universal Copy Logic
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            const url = copyBtn.getAttribute('data-copy');
            const label = copyBtn.getAttribute('data-label') || 'Enlace';
            navigator.clipboard.writeText(url).then(() => {
                showToast(`¡${label} copiado al portapapeles!`);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    });

    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');

    if (hamburgerBtn && navLinks) {
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
});

// Helper to map simpler names to devicon classes
const getIconClass = (name) => {
    const map = {
        'c#': 'csharp-plain',
        'asp.net framework': 'dotnetcore-plain',
        'mvc': 'dotnetcore-plain',
        'asp.net core': 'dotnetcore-plain',
        'javascript': 'javascript-plain',
        'jquery': 'jquery-plain',
        'ajax': 'javascript-plain',
        'bootstrap': 'bootstrap-plain',
        'html 5': 'html5-plain',
        'html5': 'html5-plain',
        'css 3': 'css3-plain',
        'css3': 'css3-plain',
        'react': 'react-original',
        'angular': 'angularjs-plain',
        'sql server': 'microsoftsqlserver-plain',
        'flutter': 'flutter-plain',
        'scrum': 'jira-plain',
        'github': 'github-original',
        'git': 'git-plain',
        'power bi': 'yun-plain'
    };
    const key = name.toLowerCase().trim();
    return `devicon-${map[key] || 'devicon-plain'}`;
};

function renderContent() {
    const contentDisplay = document.getElementById('content-display');
    contentDisplay.className = 'bento-grid';

    // ─── BUILD MARQUEE HTML BEFORE aboutCard ───────────────────────────────
    const allSkills = [
        ...cvData.skills.web,
        ...cvData.skills.database,
        ...cvData.skills.mobile,
        ...cvData.skills.tools
    ];
    const uniqueSkills = [...new Set(allSkills)];
    const loopedSkills = [...uniqueSkills, ...uniqueSkills, ...uniqueSkills];

    const skillsGridHtml = loopedSkills.map(skill => `
        <div class="skill-item" data-skill="${skill}">
            <i class="${getIconClass(skill)}"></i>
            <span class="skill-name">${skill}</span>
        </div>
    `).join('');

    // ─── 1. ABOUT CARD (con marquee embebido debajo del párrafo) ───────────
    const aboutCard = createBentoCard({
        id: 'about-card',
        title: '',
        icon: '',
        content: `
        <section class="about-section">

            <div class="about-top">

               
                    <div class="avatar-ring">
                        <img
                            src="./assets/Foto_Formal_DeybyDeras.jpeg"
                            alt="Mi foto"
                            class="avatar-photo"
                        >
                        <svg viewBox="0 0 130 130" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="rg" x1="0%" y1="0%"
                                                x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="rgba(255,255,255,0.5)" />
                                    <stop offset="50%" stop-color="#ff79c6" />
                                    <stop offset="100%" stop-color="rgba(255,255,255,0.3)" />
                                </linearGradient>
                            </defs>
                            <circle cx="65" cy="65" r="62"
                                    stroke="url(#rg)"
                                    stroke-width="1.5"
                                    fill="none"
                                    opacity="0.6"/>
                            <circle cx="65" cy="65" r="55"
                                    fill="rgba(255,255,255,0.02)"/>
                            <circle cx="65" cy="3" r="2"
                                    fill="rgba(255,255,255,0.5)"/>
                            <circle cx="65" cy="127" r="2"
                                    fill="#ff79c6"
                                    opacity="0.8"/>
                            <circle cx="3" cy="65" r="2"
                                    fill="rgba(255,255,255,0.3)"/>
                            <circle cx="127" cy="65" r="2"
                                    fill="rgba(255,255,255,0.3)"/>
                        </svg>
                    </div>
                

                <div class="about-content">
                    <span class="about-label">• SOBRE MÍ</span>

                    <h2 class="about-heading">
                        Construyendo
                        soluciones<span> web</span></br> y
                        <span>móviles</span>
                    </h2>

                    <p class="about-description">
                        Me apasiona desarrollar software que resuelve problemas reales
                        y genera impacto. Enfocado en crear aplicaciones escalables,
                        seguras y mantenibles, utilizando tecnologías modernas y
                        buenas prácticas de desarrollo. </p>
                     
                   <p class="about-description">
                        Tengo experiencia colaborando en equipos multidisciplinarios,
                    participando en el diseño, desarrollo y mejora continua de
                    soluciones digitales enfocadas en rendimiento y experiencia
                    de usuario.
                    </p>

                </div>

            </div>

            <!-- ✅ STACK AQUÍ, ocupando todo el ancho debajo de la imagen y el texto -->
            <div class="marquee-row">
                <div class="marquee-container">
                    <div class="marquee-content">
                        ${skillsGridHtml}
                    </div>
                </div>
                <a href="#" class="ver-mas-btn" id="view-all-skills">
                    Ver más <i class="fas fa-arrow-right"></i>
                </a>
            </div>

            <div class="about-footer">
                <p>
                    
                </p>
                <div class="about-status">
                    <span class="location">
                         ● Honduras
                    </span>
                    <span class="availability">
                        ● Disponible para proyectos 
                    </span>
                </div>
            </div>

        </section>
        `
    });

    // ─── MODAL SETUP ───────────────────────────────────────────────────────
    const modal = document.getElementById('skill-modal');
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const modalContent = modal.querySelector('.modal-content');

    const getSkillCategory = (skillName) => {
        for (const [cat, list] of Object.entries(cvData.skills)) {
            if (list.includes(skillName)) {
                const names = {
                    web: 'Desarrollo Web',
                    database: 'Bases de Datos',
                    mobile: 'Desarrollo Móvil',
                    desktop: 'Desktop',
                    methodologies: 'Metodología',
                    tools: 'Herramientas'
                };
                return names[cat] || cat;
            }
        }
        return 'Tecnología';
    };

    const openSkillModal = (skillName) => {
        const description = cvData.skillDetails[skillName] || "Especialista en esta tecnología con enfoque en soluciones escalables.";
        const category = getSkillCategory(skillName);
        const iconClass = getIconClass(skillName);

        modalContent.innerHTML = `
            <div class="modal-header">
                <div class="modal-icon-box">
                    <i class="${iconClass}"></i>
                </div>
                <div class="modal-title-box">
                    <h2>${skillName}</h2>
                    <span class="skill-category">${category}</span>
                </div>
            </div>
            <div class="modal-body">
                <p>${description}</p>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const openAllSkillsModal = () => {
        const allSkillsHtml = Object.entries(cvData.skillDetails).map(([name, desc]) => `
            <div class="skill-list-item">
                <div class="skill-list-icon">
                    <i class="${getIconClass(name)}"></i>
                </div>
                <div class="skill-list-info">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                </div>
            </div>
        `).join('');

        modalContent.innerHTML = `
            <div class="modal-header full-list-header">
                <h2>Tecnologías y Lenguajes</h2>
                <span class="skill-category">Vista Completa</span>
            </div>
            <div class="modal-body all-skills-body">
                <div class="skills-full-list">
                    ${allSkillsHtml}
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    document.addEventListener('click', (e) => {
        const skillItem = e.target.closest('.skill-item');
        if (skillItem) {
            const skillName = skillItem.getAttribute('data-skill');
            openSkillModal(skillName);
            return;
        }

        const viewAllBtn = e.target.closest('#view-all-skills');
        if (viewAllBtn) {
            e.preventDefault();
            openAllSkillsModal();
            return;
        }
    });

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ─── 2. EDUCATION CARD ─────────────────────────────────────────────────
    const eduHtml = cvData.education.map(edu => `
        <div class="timeline-item">
            <span class="timeline-date">${edu.year}</span>
            <span class="timeline-company">${edu.institution}</span>
            <h4 class="timeline-role">${edu.degree}</h4>
            ${edu.description ? `<p style="font-size: 0.9rem; color: #8b949e; margin-top: 0.5rem; margin-bottom: 0.5rem;">${edu.description}</p>` : ''}
            ${edu.link ? `
                <a href="${edu.link}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; color: var(--primary-color); text-decoration: none; font-size: 0.9rem; margin-top: 0.5rem; padding: 0.3rem 0.8rem; border: 1px solid var(--primary-color); border-radius: 4px; transition: 0.3s;">
                    <i class="fas fa-external-link-alt"></i> Ver Noticia
                </a>
            ` : ''}
        </div>
    `).join('');

    const eduCard = createBentoCard({
        id: 'edu-card',
        title: 'Educación',
        icon: '',
        content: `<div class="timeline-wrapper">${eduHtml}</div>`
    });

    // ─── 3. EXPERIENCE CARD ────────────────────────────────────────────────
    const expHtml = cvData.experience.map(job => `
        <div class="timeline-item">
            <span class="timeline-date">${job.period}</span>
            <span class="timeline-company">${job.company}</span>
            <h4 class="timeline-role">${job.role}</h4>
            <p style="font-size: 0.9rem; color: #8b949e; margin-top: 0.5rem;">${job.description}</p>
        </div>
    `).join('');

    const expCard = createBentoCard({
        id: 'exp-card',
        title: 'Experiencia',
        icon: '',
        content: `<div class="timeline-wrapper">${expHtml}</div>`
    });

    // ─── 4. CONTACT CARD ───────────────────────────────────────────────────
    const contactHtml = `
        <div class="contact-wrapper">
            <div class="contact-item">
                <div class="icon-box">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="contact-info">
                    <span class="label">Email</span>
                    <span class="value">${cvData.contact.email}</span>
                </div>
                <div class="contact-actions">
                    <a href="mailto:${cvData.contact.email}" class="action-btn" title="Send Email">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="action-btn copy-btn" data-copy="${cvData.contact.email}" data-label="Correo" title="Copy Email">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            </div>

            <div class="contact-item">
                <div class="icon-box">
                    <i class="fab fa-whatsapp"></i>
                </div>
                <div class="contact-info">
                    <span class="label">Whatsapp</span>
                    <span class="value">${cvData.contact.phone}</span>
                </div>
                <div class="contact-actions">
                    <a href="https://wa.me/${cvData.contact.phone.replace(/[^0-9]/g, '')}" target="_blank" class="action-btn" title="Chat on WhatsApp">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="action-btn copy-btn" data-copy="${cvData.contact.phone}" data-label="Número" title="Copy Phone">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            </div>

            <div class="contact-item">
                <div class="icon-box">
                    <i class="fab fa-linkedin-in"></i>
                </div>
                <div class="contact-info">
                    <span class="label">LinkedIn</span>
                    <span class="value">Deyby Josue</span>
                </div>
                <div class="contact-actions">
                    <a href="https://www.linkedin.com/in/deyby-josue-deras-cardenas-2534a2390/" target="_blank" class="action-btn" title="Open Profile">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="action-btn copy-btn" data-copy="https://www.linkedin.com/in/deyby-josue-deras-cardenas-2534a2390/" data-label="Perfil de LinkedIn" title="Copy URL">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            </div>

            <div class="contact-item">
                <div class="icon-box">
                    <i class="fab fa-github"></i>
                </div>
                <div class="contact-info">
                    <span class="label">GitHub</span>
                    <span class="value">Josidkk</span>
                </div>
                <div class="contact-actions">
                    <a href="https://github.com/Josidkk" target="_blank" class="action-btn" title="Open Profile">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="action-btn copy-btn" data-copy="https://github.com/Josidkk" data-label="Perfil de GitHub" title="Copy URL">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            </div>

            <div class="location-badge">
                <div class="loc-icon">
                    <div class="pulse-dot"></div>
                </div>
                <span class="loc-text">SERVER LOCATION: <span class="highlight-loc">${cvData.contact.location}</span></span>
                <span class="loc-coords"> [ ONLINE ] </span>
            </div>
        </div>
    `;

    const contactCard = createBentoCard({
        id: 'contact-card',
        title: 'Contacto',
        icon: '',
        content: contactHtml
    });

    // ─── APPEND AL DOM (sin skillsCard separado) ───────────────────────────
    contentDisplay.appendChild(aboutCard);
    contentDisplay.appendChild(eduCard);
    contentDisplay.appendChild(expCard);
    contentDisplay.appendChild(contactCard);
}

function createBentoCard({ id, title, icon, content }) {
    const card = document.createElement('div');
    card.id = id;
    card.className = 'bento-card reveal-scale';

    const iconHtml = icon ? `<i class="${icon}"></i>` : '';
    const titleHtml = title ? `
        <div class="card-title">
            ${iconHtml}
            <span>${title}</span> 
        </div>` : '';

    card.innerHTML = `
        ${titleHtml}
        <div class="card-content">
            ${content}
        </div>
    `;
    return card;
}

function setupInteractions() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -150px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach(card => {
        observer.observe(card);
    });

    const scrollArrow = document.getElementById('scroll-arrow');
    if (scrollArrow) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                scrollArrow.classList.add('hidden-arrow');
            } else {
                scrollArrow.classList.remove('hidden-arrow');
            }
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const offset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Navigation Active State Observer
    const sections = document.querySelectorAll('section#hero, #exp-card, #about-card, #contact-card');
    const navItems = document.querySelectorAll('.nav-links a');

    const navObserverOptions = {
        root: null,
        rootMargin: '-30% 0px -70% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(link => {
                    link.classList.remove('is-active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('is-active');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });
}