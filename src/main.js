import { startBootSequence } from './scripts/boot.js';
import { HyperspaceSystem } from './scripts/hyperspace.js';
import { initTiltEffect } from './scripts/interactions.js';
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

    // GitHub Copy Logic
    // Universal Copy Logic
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            const url = copyBtn.getAttribute('data-copy');
            const label = copyBtn.getAttribute('data-label') || 'Enlace'; // Default to 'Enlace'
            navigator.clipboard.writeText(url).then(() => {
                showToast(`¡${label} copiado al portapapeles!`);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    });
});

// Helper to map simpler names to devicon classes
const getIconClass = (name) => {
    const map = {
        'c#': 'csharp-plain',
        'asp.net framework': 'dotnetcore-plain', // Close enough representation
        'mvc': 'dotnetcore-plain',
        'asp.net core': 'dotnetcore-plain',
        'javascript': 'javascript-plain',
        'jquery': 'jquery-plain',
        'ajax': 'javascript-plain', // No specific ajax icon
        'bootstrap': 'bootstrap-plain',
        'html 5': 'html5-plain',
        'html5': 'html5-plain',
        'css 3': 'css3-plain',
        'css3': 'css3-plain',
        'react': 'react-original',
        'angular': 'angularjs-plain',
        'sql server': 'microsoftsqlserver-plain',
        'flutter': 'flutter-plain',
        'scrum': 'jira-plain', // Metaphorical
        'github': 'github-original',
        'git': 'git-plain',
        'power bi': 'yun-plain' // Fallback or closest
    };
    const key = name.toLowerCase().trim();
    return `devicon-${map[key] || 'devicon-plain'}`;
};

function renderContent() {
    const contentDisplay = document.getElementById('content-display');
    contentDisplay.className = 'bento-grid'; // Use grid layout

    // 1. ABOUT CARD (Large, span 2 cols if possible)
    const aboutCard = createBentoCard({
        id: 'about-card',
        title: 'Sobre Mí',
        icon: 'fas fa-user-astronaut', // FontAwesome or generic placeholder
        content: `<p style="line-height: 1.6; color: #c9d1d9;">${cvData.summary}</p>`
    });

    // 2. SKILLS CARD (Cyber Marquee)
    const allSkills = [
        ...cvData.skills.web,
        ...cvData.skills.database,
        ...cvData.skills.mobile,
        ...cvData.skills.tools
    ];
    // Remove duplicates
    const uniqueSkills = [...new Set(allSkills)];

    // DUPLICATE content 2-3 times to cover the scroll area
    const loopedSkills = [...uniqueSkills, ...uniqueSkills, ...uniqueSkills];

    const skillsGridHtml = loopedSkills.map(skill => `
        <div class="skill-item" data-skill="${skill}">
            <i class="${getIconClass(skill)}"></i>
            <span class="skill-name">${skill}</span>
        </div>
    `).join('');

    const skillsCard = createBentoCard({
        id: 'stack-card',
        title: 'Tech Stack',
        icon: '',
        content: `
            <div class="marquee-container">
                <div class="marquee-content">
                    ${skillsGridHtml}
                </div>
            </div>
            <a href="#" class="ver-mas-btn" id="view-all-skills">Ver más <i class="fas fa-arrow-right"></i></a>
        `
    });

    // Modal elements
    const modal = document.getElementById('skill-modal');
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const modalContent = modal.querySelector('.modal-content');

    // Helper to find category
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

    // Open Individual Skill Modal
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

    // Open All Skills Modal
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

    // Click Listeners
    document.addEventListener('click', (e) => {
        // Individual skill click
        const skillItem = e.target.closest('.skill-item');
        if (skillItem) {
            const skillName = skillItem.getAttribute('data-skill');
            openSkillModal(skillName);
            return;
        }

        // Ver más click
        const viewAllBtn = e.target.closest('#view-all-skills');
        if (viewAllBtn) {
            e.preventDefault();
            openAllSkillsModal();
            return;
        }
    });

    // Close Modal Logic
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scroll
    };

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Remove default card title/padding for purely visual marquee if preferred, 
    // but `createBentoCard` adds title. Let's hide it via CSS for this ID if empty.


    // 2.5 EDUCATION CARD (New)
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
        icon: 'fas fa-graduation-cap',
        content: `<div class="timeline-wrapper">${eduHtml}</div>`
    });

    // 3. EXPERIENCE CARD (Timeline)S
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
        icon: 'fas fa-briefcase',
        content: `<div class="timeline-wrapper">${expHtml}</div>`
    });

    // 4. CONTACT CARD
    const contactHtml = `
        <div class="contact-wrapper">
            <!-- Email -->
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
            
            <!-- Phone -->
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
            
            <!-- LinkedIn -->
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

            <!-- GitHub -->
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

            <!-- Location (Creative Badge) -->
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
        icon: 'fas fa-paper-plane',
        content: contactHtml
    });

    contentDisplay.appendChild(aboutCard);
    contentDisplay.appendChild(skillsCard);
    contentDisplay.appendChild(eduCard);
    contentDisplay.appendChild(expCard);
    contentDisplay.appendChild(contactCard);
}

function createBentoCard({ id, title, icon, content }) {
    const card = document.createElement('div');
    card.id = id;
    card.className = 'bento-card'; // Add tilt class for interaction

    card.innerHTML = `
        <div class="card-title">
            <span>${title}</span> 
        </div>
        <div class="card-content">
            ${content}
        </div>
    `;
    return card;
}

function setupInteractions() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.bento-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const offset = 100; // Nav height + padding
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

    // NO TILT initialization
}
