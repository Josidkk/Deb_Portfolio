// TILT EFFECT
export function initTiltEffect(selector) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(el => {
        el.addEventListener('mousemove', handleMove);
        el.addEventListener('mouseleave', handleLeave);
    });
}

function handleMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse x inside element
    const y = e.clientY - rect.top; // Mouse y inside element

    // Calculate center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Get percent from center (-1 to 1)
    const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
    const rotateY = ((x - centerX) / centerX) * 10;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
}

function handleLeave(e) {
    const el = e.currentTarget;
    el.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
}

// TYPEWRITER EFFECT
export function typeWriterEffect(element, text, speed = 30) {
    element.innerHTML = '';
    element.classList.remove('typing-hidden'); // Make visible if hidden
    let i = 0;

    function type() {
        if (i < text.length) {
            // Handle HTML tags roughly (skip them)
            if (text.charAt(i) === '<') {
                let tag = '';
                while (text.charAt(i) !== '>' && i < text.length) {
                    tag += text.charAt(i);
                    i++;
                }
                tag += '>';
                i++;
                element.innerHTML += tag;
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }
            setTimeout(type, speed);
        }
    }
    type();
}
