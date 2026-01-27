export class HyperspaceSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.warpSpeed = 0;
        this.baseSpeed = 2;
        this.targetSpeed = this.baseSpeed;

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // Interactions
        this.canvas.addEventListener('mousedown', () => this.engageWarp());
        this.canvas.addEventListener('mouseup', () => this.disengageWarp());
        this.canvas.addEventListener('touchstart', () => this.engageWarp());
        this.canvas.addEventListener('touchend', () => this.disengageWarp());

        // Scroll detection for warp burst
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const delta = Math.abs(currentScrollY - lastScrollY);
            if (delta > 10) { // More sensitive
                // Add speed, cap at 50
                this.warpSpeed = Math.min(this.warpSpeed + 5, 50);
            }
            lastScrollY = currentScrollY;
        });

        this.initStars();
        this.animate();
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        const oldWidth = this.canvas.width;
        const newWidth = parent.offsetWidth;
        const newHeight = parent.offsetHeight;

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;

        // If we previously had no size and now we do, re-init stars
        if (oldWidth === 0 && newWidth > 0) {
            this.stars = [];
            this.initStars();
        }
    }

    initStars() {
        const count = 800; // Increased for density
        for (let i = 0; i < count; i++) {
            this.stars.push(this.createStar());
        }
    }

    createStar() {
        return {
            x: (Math.random() - 0.5) * this.canvas.width * 2.5,
            y: (Math.random() - 0.5) * this.canvas.height * 2.5,
            z: Math.random() * this.canvas.width,
            pz: 0
        };
    }

    engageWarp() {
        this.targetSpeed = 40;
    }

    disengageWarp() {
        this.targetSpeed = 2;
    }

    animate() {
        // Trails
        const isOverdrive = document.body.classList.contains('overdrive-mode');
        this.ctx.fillStyle = isOverdrive ? 'rgba(0, 0, 0, 0.5)' : 'rgba(13, 17, 23, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Smooth speed transition
        let driveSpeed = isOverdrive ? 80 : this.targetSpeed;
        this.warpSpeed += (driveSpeed - this.warpSpeed) * (isOverdrive ? 0.05 : 0.02);

        this.stars.forEach(star => {
            star.pz = star.z;
            star.z -= this.warpSpeed;

            if (star.z <= 0) {
                star.z = this.canvas.width;
                star.pz = star.z;
                star.x = (Math.random() - 0.5) * this.canvas.width * 2.5;
                star.y = (Math.random() - 0.5) * this.canvas.height * 2.5;
            }

            const screenX = this.cx + (star.x / star.z) * 1000;
            const screenY = this.cy + (star.y / star.z) * 1000;
            const scale = (1 - star.z / this.canvas.width) * 3;

            if (scale <= 0) return;

            if (this.warpSpeed > 10) {
                const tailZ = star.z + this.warpSpeed * (isOverdrive ? 4 : 2);
                const tailX = this.cx + (star.x / tailZ) * 1000;
                const tailY = this.cy + (star.y / tailZ) * 1000;

                this.ctx.beginPath();
                this.ctx.strokeStyle = isOverdrive ? `rgba(255, 255, 255, ${scale})` : `rgba(139, 233, 253, ${scale})`;
                this.ctx.lineWidth = isOverdrive ? scale * 1.5 : scale;
                this.ctx.moveTo(tailX, tailY);
                this.ctx.lineTo(screenX, screenY);
                this.ctx.stroke();
            } else {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${scale})`;
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, scale / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        requestAnimationFrame(this.animate.bind(this));
    }
}
