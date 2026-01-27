export function showToast(message) {
    // Create container if not exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(13, 17, 23, 0.9);
        color: #8be9fd;
        border: 1px solid #bd93f9;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Animate out
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
