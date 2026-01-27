export class KonamiCode {
    constructor(callback) {
        this.callback = callback;
        this.sequence = [
            'ArrowUp', 'ArrowUp',
            'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight',
            'ArrowLeft', 'ArrowRight',
            'b', 'a'
        ];
        this.index = 0;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'a'
                ? e.key.toLowerCase()
                : e.key;

            if (key === this.sequence[this.index]) {
                this.index++;
                if (this.index === this.sequence.length) {
                    this.playSuccessSound();
                    this.callback();
                    this.index = 0;
                }
            } else {
                this.index = 0;
            }
        });
    }

    playSuccessSound() {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [
                { freq: 261.63, time: 0 },   // C4
                { freq: 329.63, time: 0.1 }, // E4
                { freq: 392.00, time: 0.2 }, // G4
                { freq: 523.25, time: 0.3 }  // C5
            ];

            notes.forEach(note => {
                const osc = context.createOscillator();
                const gain = context.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(note.freq, context.currentTime + note.time);

                gain.gain.setValueAtTime(0.1, context.currentTime + note.time);
                gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + note.time + 0.1);

                osc.connect(gain);
                gain.connect(context.destination);

                osc.start(context.currentTime + note.time);
                osc.stop(context.currentTime + note.time + 0.1);
            });
        } catch (e) {
            console.error("Audio context failed:", e);
        }
    }
}
