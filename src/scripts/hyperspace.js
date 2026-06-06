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
        // VIDEO
        this.video = document.createElement('video');

        this.video.src = '/assets/batman2.mp4';
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.autoplay = true;
        this.video.preload = 'auto';
        this.video.crossOrigin = 'anonymous'; // Importante para extraer pixeles en Canvas

        // Forzar los atributos explícitamente (Crítico para iOS)
        this.video.setAttribute('autoplay', '');
        this.video.setAttribute('muted', '');
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('webkit-playsinline', '');

        // Insertarlo en el DOM pero de forma invisible para que Safari no detenga la decodificación
        this.video.style.position = 'fixed'; // ← cambiar absolute por fixed
        this.video.style.opacity = '0';
        this.video.style.pointerEvents = 'none';
        this.video.style.width = '1px';  // ← agregar
        this.video.style.height = '1px'; // ← agregar
        this.video.style.top = '0';      // ← agregar
        this.video.style.left = '0';     // ← agregar
        document.body.appendChild(this.video);

        this.videoReady = false;

        // Cache del último frame válido — evita el flash negro en el loop
        this.lastPixelData = null;

        // Un solo punto de inicio
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
                console.warn('Autoplay bloqueado por el navegador. Esperando interacción.', e);
            }
        };

        window.addEventListener('touchstart', startVideo, { once: true });
        window.addEventListener('click', startVideo, { once: true });

        // Fallback
        this.video.addEventListener('canplay', () => {
            startVideo();
        });

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

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;

        // Al cambiar tamaño, invalidar el cache para evitar
        // que un frame de resolución anterior se estire
        this.lastPixelData = null;

        if (window.innerWidth <= 768) {
            this.spacing = 6;
            this.maxRadius = 2.5;
            this.minRadius = 0.4;
        } else {
            this.spacing = 9;
            this.maxRadius = 4.2;
            this.minRadius = 0.7;
        }
    }

    animate() {
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        if (!cw || !ch) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        const isOverdrive = document.body.classList.contains('overdrive-mode');

        // Fondo
        this.ctx.fillStyle = isOverdrive ? '#000' : '#0d1117';
        this.ctx.fillRect(0, 0, cw, ch);

        // Intentar capturar un nuevo frame del video
        if (this.videoReady && this.video.readyState >= 2) {
            const vw = this.video.videoWidth;
            const vh = this.video.videoHeight;

            const scale = Math.max(cw / vw, ch / vh);
            const drawW = vw * scale;
            const drawH = vh * scale;
            const drawX = (cw - drawW) / 2;
            const drawY = (ch - drawH) / 2;

            if (this.offscreenCanvas.width !== cw || this.offscreenCanvas.height !== ch) {
                this.offscreenCanvas.width = cw;
                this.offscreenCanvas.height = ch;
            }

            this.offCtx.drawImage(this.video, drawX, drawY, drawW, drawH);

            // Guardar siempre el último frame válido
            this.lastPixelData = this.offCtx.getImageData(0, 0, cw, ch).data;
        }

        // Si aún no hay ningún frame, esperar sin dibujar nada
        if (!this.lastPixelData) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        // Usar el frame actual o el último válido (durante el loop del video)
        const pixelData = this.lastPixelData;

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