export class CodeSnippetsSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.snippets = [
            'const', 'let', 'function', 'class', 'import', 'export', 'return',
            '=>', '{}', '[]', '// TODO', 'async', 'await', 'try', 'catch',
            '<div>', 'console.log', 'npm', 'git', '<App />', '#bash', '0101',
            'null', 'undefined', 'true', 'false', 'this', 'super'
        ];
        this.particles = [];
        this.resize();

        window.addEventListener('resize', () => this.resize());

        this.initParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        // Density based on screen size
        const count = Math.floor((this.canvas.width * this.canvas.height) / 40000);

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle(resetY = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: resetY ? this.canvas.height + 20 : Math.random() * this.canvas.height,
            text: this.snippets[Math.floor(Math.random() * this.snippets.length)],
            size: 10 + Math.random() * 14, // 10px to 24px
            speed: 0.2 + Math.random() * 0.5, // Slow float up
            opacity: 0.1 + Math.random() * 0.4, // Semi-transparent
            font: Math.random() > 0.5 ? 'JetBrains Mono' : 'monospace'
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, index) => {
            // Move Up
            p.y -= p.speed;

            // Draw
            this.ctx.fillStyle = `rgba(139, 233, 253, ${p.opacity})`; // Cyan tint
            // Randomly purple for some
            if (index % 3 === 0) {
                this.ctx.fillStyle = `rgba(189, 147, 249, ${p.opacity})`; // Purple tint
            }

            this.ctx.font = `${p.size}px ${p.font}`;
            this.ctx.fillText(p.text, p.x, p.y);

            // Reset if off screen top
            if (p.y < -30) {
                this.particles[index] = this.createParticle(true);
            }
        });

        requestAnimationFrame(this.animate.bind(this));
    }
}
