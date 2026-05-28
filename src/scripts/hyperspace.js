import batmanVideo from '/public/assets/batman2.mp4';

export class HyperspaceSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        // Configuración del Halftone
        this.spacing = 9;       // Espacio entre puntos
        this.maxRadius = 4.2;   // Radio máximo (zonas brillantes)
        this.minRadius = 0.7;   // Radio mínimo (zonas oscuras — siempre hay punto!)

        this.mouseX = -1000;
        this.mouseY = -1000;
        this.time = 0;

        // Canvas offscreen para leer píxeles del video
        this.offscreenCanvas = document.createElement('canvas');
        this.offCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

        // --- VIDEO como fuente del halftone ---
        this.video = document.createElement('video');
        this.video.src = batmanVideo;
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.videoReady = false;

        this.video.addEventListener('canplay', () => {
            this.videoReady = true;

            this.video.setAttribute('playsinline', '');
            this.video.setAttribute('webkit-playsinline', '');
            this.video.muted = true;
            this.video.autoplay = true;
            this.video.preload = 'auto';
        });

        this.video.play().catch(() => {
 
});

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // Interacción del mouse
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
        this.time += 0.04;

        if (this.canvas.width === 0 || this.canvas.height === 0) {
            this.resize();
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        const isOverdrive = document.body.classList.contains('overdrive-mode');

        // Fondo oscuro
        this.ctx.fillStyle = isOverdrive ? '#000000' : '#0d1117';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.videoReady) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        // Escalar el video para que llene el canvas (cover)
        const vw = this.video.videoWidth;
        const vh = this.video.videoHeight;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        const scale = Math.max(cw / vw, ch / vh);
        const drawW = vw * scale;
        const drawH = vh * scale;
        const drawX = (cw - drawW) / 2;
        const drawY = (ch - drawH) / 2;

        // Actualizar offscreen canvas y leer el frame actual del video
        this.offscreenCanvas.width = cw;
        this.offscreenCanvas.height = ch;
        this.offCtx.drawImage(this.video, drawX, drawY, drawW, drawH);
        const pixelData = this.offCtx.getImageData(0, 0, cw, ch).data;

        // Color de los puntos (blanco normal, rojo en overdrive)
        this.ctx.fillStyle = isOverdrive ? '#ff0055' : '#ffffff';

        const cols = Math.ceil(cw / this.spacing);
        const rows = Math.ceil(ch / this.spacing);

        this.ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
            for (let j = 0; j <= rows; j++) {
                const x = i * this.spacing;
                const y = j * this.spacing;

                const pixelIndex = (y * cw + x) * 4;
                let brightness = 0;

                if (pixelIndex >= 0 && pixelIndex < pixelData.length) {
                    const r = pixelData[pixelIndex];
                    const g = pixelData[pixelIndex + 1];
                    const b = pixelData[pixelIndex + 2];

                    // Luminancia DIRECTA: oscuro = puntos pequeños, luna/luces = puntos grandes
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    brightness = luminance;

                    // NO cortamos en 0 — las zonas oscuras tendrán el punto mínimo
                    // Solo potenciamos el contraste para que los brillos resalten más
                    brightness = Math.pow(brightness, 0.65);
                }

                // Interacción del cursor — efecto lupa/ola
                const dx = this.mouseX - x;
                const dy = this.mouseY - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const influenceRadius = 180;

                let mouseInfluence = 0;
                if (dist < influenceRadius) {
                    mouseInfluence = Math.pow(1 - (dist / influenceRadius), 2) * 0.6;
                }

                let intensity = brightness + mouseInfluence;
                intensity = Math.max(0, Math.min(1, intensity));

                if (isOverdrive) intensity = Math.min(1, intensity * 1.6);

                // Radio con un MÍNIMO garantizado — nunca hay espacio vacío en el grid
                const radius = this.minRadius + intensity * (this.maxRadius - this.minRadius);

                // Dibujamos SIEMPRE (el radio mínimo asegura que hay punto)
                this.ctx.moveTo(x + radius, y);
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            }
        }
        this.ctx.fill();

        requestAnimationFrame(this.animate.bind(this));
    }
}
