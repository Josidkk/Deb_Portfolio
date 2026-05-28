export class HyperspaceSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        // Halftone config
        this.spacing = 9;
        this.maxRadius = 4.2;
        this.minRadius = 0.7;

        this.mouseX = -1000;
        this.mouseY = -1000;
        this.time = 0;

        // Offscreen canvas
        this.offscreenCanvas = document.createElement('canvas');
        this.offCtx = this.offscreenCanvas.getContext('2d', {
            willReadFrequently: true
        });

        // VIDEO
        this.video = document.createElement('video');

        this.video.src = '/assets/batman2.mp4'; // 👈 IMPORTANTE: desde public/
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('webkit-playsinline', '');
        this.video.preload = 'auto';

        this.videoReady = false;

        // 🎯 SOLO ESTE FLUJO (no duplicado)
        this.video.addEventListener('loadedmetadata', () => {
            // NO asumir que ya hay frames listos
            this.tryPlay();
        });

        this.video.addEventListener('canplay', () => {
            this.videoReady = true;
        });

        // 🔥 iOS fallback obligatorio
        const userStartPlay = async () => {
            await this.tryPlay();
        };

        window.addEventListener('touchstart', userStartPlay, { once: true });
        window.addEventListener('click', userStartPlay, { once: true });

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // Mouse
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            this.mouseX = -1000;
            this.mouseY = -1000;
        });

        this.animate();
    }

    async tryPlay() {
        try {
            await this.video.play();
        } catch (e) {
            // iOS puede bloquear autoplay hasta interacción
        }
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
    }

    animate() {
        this.time += 0.04;

        if (this.canvas.width === 0 || this.canvas.height === 0) {
            this.resize();
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        const isOverdrive = document.body.classList.contains('overdrive-mode');

        // background
        this.ctx.fillStyle = isOverdrive ? '#000' : '#0d1117';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.videoReady || this.video.readyState < 2) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        const vw = this.video.videoWidth;
        const vh = this.video.videoHeight;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        const scale = Math.max(cw / vw, ch / vh);
        const drawW = vw * scale;
        const drawH = vh * scale;
        const drawX = (cw - drawW) / 2;
        const drawY = (ch - drawH) / 2;

        // IMPORTANT: resize offscreen only when needed
        if (this.offscreenCanvas.width !== cw || this.offscreenCanvas.height !== ch) {
            this.offscreenCanvas.width = cw;
            this.offscreenCanvas.height = ch;
        }

        this.offCtx.drawImage(this.video, drawX, drawY, drawW, drawH);

        const pixelData = this.offCtx.getImageData(0, 0, cw, ch).data;

        this.ctx.fillStyle = isOverdrive ? '#ff0055' : '#ffffff';

        const cols = Math.ceil(cw / this.spacing);
        const rows = Math.ceil(ch / this.spacing);

        this.ctx.beginPath();

        for (let i = 0; i <= cols; i++) {
            for (let j = 0; j <= rows; j++) {
                const x = i * this.spacing;
                const y = j * this.spacing;

                const index = (Math.floor(y) * cw + Math.floor(x)) * 4;

                let brightness = 0;

                if (index < pixelData.length) {
                    const r = pixelData[index];
                    const g = pixelData[index + 1];
                    const b = pixelData[index + 2];

                    const luminance =
                        (0.299 * r + 0.587 * g + 0.114 * b) / 255;

                    brightness = Math.pow(luminance, 0.65);
                }

                const dx = this.mouseX - x;
                const dy = this.mouseY - y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let mouseInfluence = 0;
                if (dist < 180) {
                    mouseInfluence = Math.pow(1 - dist / 180, 2) * 0.6;
                }

                let intensity = brightness + mouseInfluence;
                intensity = Math.max(0, Math.min(1, intensity));

                if (isOverdrive) intensity *= 1.6;

                const radius =
                    this.minRadius +
                    intensity * (this.maxRadius - this.minRadius);

                this.ctx.moveTo(x + radius, y);
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            }
        }

        this.ctx.fill();

        requestAnimationFrame(this.animate.bind(this));
    }
}