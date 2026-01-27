export class DigitalInkSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => this.addInk(e.clientX, e.clientY));
        this.canvas.addEventListener('click', (e) => this.splash(e.clientX, e.clientY));

        // Auto add some ink randomly
        setInterval(() => {
            this.addInk(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            );
        }, 200);

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addInk(x, y) {
        // Spawn a few particles
        for (let i = 0; i < 3; i++) {
            this.particles.push(new InkParticle(x, y));
        }
    }

    splash(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new InkParticle(x, y, true));
        }
    }

    animate() {
        // Clear with slight trail effect (alpha less than 1)
        // This makes the "ink" linger nicely
        this.ctx.fillStyle = 'rgba(13, 17, 23, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Optional: Use 'lighter' composite for glowing ink, or 'source-over' for dark ink
        // Vagabond style: maybe 'screen' for ethereal smoke
        this.ctx.globalCompositeOperation = 'screen';

        this.particles.forEach((p, index) => {
            p.update();
            p.draw(this.ctx);
            if (p.life <= 0) {
                this.particles.splice(index, 1);
            }
        });

        this.ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(this.animate.bind(this));
    }
}

class InkParticle {
    constructor(x, y, isSplash = false) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = isSplash ? Math.random() * 5 : Math.random() * 1;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 0.5; // Slight rise up like smoke

        this.size = Math.random() * 20 + 10;
        this.life = 100;
        this.decay = Math.random() * 0.5 + 0.2;

        // Color variation: Cyan-ish Gray
        // HSL: Cyan is ~180. Low saturation for "gray/ink".
        this.hue = 180 + Math.random() * 40;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Friction / expansion
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.size += 0.2; // Expand slowly like diffusing ink

        this.life -= this.decay;
        this.alpha = (this.life / 100) * 0.3; // Max opacity 0.3
    }

    draw(ctx) {
        ctx.beginPath();
        // Gradient for soft puff
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, `hsla(${this.hue}, 100%, 80%, ${this.alpha})`);
        grad.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);

        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
