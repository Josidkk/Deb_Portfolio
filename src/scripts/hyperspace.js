export class HyperspaceSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        // Configuración halftone
        this.spacing = 9;
        this.maxRadius = 4.2;
        this.minRadius = 0.7;

        this.mouseX = -1000;
        this.mouseY = -1000;

        // Offscreen canvas
        this.offscreenCanvas = document.createElement('canvas');
        this.offCtx = this.offscreenCanvas.getContext('2d', {
            willReadFrequently: true
        });

        // VIDEO
        this.video = document.createElement('video');

        this.video.src = '/assets/batman2.mp4'; // ✔ desde /public
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.preload = 'auto';

        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('webkit-playsinline', '');

        this.videoReady = false;

        // 🎯 UN SOLO PUNTO DE INICIO
        this.startTriggered = false;

        const startVideo = async () => {
            if (this.startTriggered) return;
            this.startTriggered = true;

            try {
                await this.video.play();
                this.videoReady = true;
            } catch (e) {
                // iOS puede bloquear hasta interacción real
                this.startTriggered = false;
            }
        };

        // 👇 SOLO 1 trigger real de usuario
        window.addEventListener('touchstart', startVideo, { once: true });
        window.addEventListener('click', startVideo, { once: true });

        // fallback silencioso
        this.video.addEventListener('loadeddata', () => {
            startVideo();
        });

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // mouse
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

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
    }

    animate() {
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        if (!cw || !ch) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        const isOverdrive = document.body.classList.contains('overdrive-mode');

        // background
        this.ctx.fillStyle = isOverdrive ? '#000' : '#0d1117';
        this.ctx.fillRect(0, 0, cw, ch);

        // ❌ aún no hay video listo
        if (!this.videoReady || this.video.readyState < 2) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        const vw = this.video.videoWidth;
        const vh = this.video.videoHeight;

        const scale = Math.max(cw / vw, ch / vh);
        const drawW = vw * scale;
        const drawH = vh * scale;
        const drawX = (cw - drawW) / 2;
        const drawY = (ch - drawH) / 2;

        // offscreen size
        if (this.offscreenCanvas.width !== cw || this.offscreenCanvas.height !== ch) {
            this.offscreenCanvas.width = cw;
            this.offscreenCanvas.height = ch;
        }

        this.offCtx.drawImage(this.video, drawX, drawY, drawW, drawH);

        const pixelData = this.offCtx.getImageData(0, 0, cw, ch).data;

        this.ctx.fillStyle = isOverdrive ? '#ff0055' : '#fff';
        this.ctx.beginPath();

        const cols = Math.ceil(cw / this.spacing);
        const rows = Math.ceil(ch / this.spacing);

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

                    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    brightness = Math.pow(lum, 0.65);
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