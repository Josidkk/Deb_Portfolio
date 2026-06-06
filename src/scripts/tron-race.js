export class TronRace {
    getLanes() {
        const h = this.canvas.height;
        return [
            h * 0.25,
            h * 0.40,
            h * 0.50,
            h * 0.60,
            h * 0.75
        ];
    }

    get scale() {
        return this.canvas.height / 120;
    }

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`TronRace: Canvas element with id "${canvasId}" not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.pixelSize = 4;
        this.cycles = [];
        this.explosions = [];

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.lanes = this.getLanes();

        this.initRace();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = window.innerWidth;

        this.canvas.height = Math.max(100, container ? container.clientHeight : 120);
        this.lanes = this.getLanes();
    }
    initRace() {
        this.cycles = [];
        this.explosions = [];
        this.cycles.push(this.createCycle('#ff9900', '#cc7a00', 0, 1.2));
        this.cycles.push(this.createCycle('#00ffff', '#00cccc', 4, 1.2));
    }

    createCycle(color, trailColor, initialLaneIdx, speedBase) {
        return {
            x: -50,
            y: this.lanes[initialLaneIdx],
            laneIdx: initialLaneIdx,
            color: color,
            trailColor: trailColor,
            speed: 5 + Math.random() * speedBase,
            targetY: this.lanes[initialLaneIdx],
            state: 'RUNNING',
            trail: [],
            dead: false
        };
    }

    drawBike(x, y, color) {
        const ctx = this.ctx;
        const glowColor = color;

        // Moto siempre a tamaño fijo (diseñada para 120px de alto).
        // Solo centramos verticalmente en el canvas real usando y directamente.
        ctx.save();
        ctx.translate(x + 16, y); // y ya viene de las lanes escaladas
        ctx.scale(0.7, 0.7);

        // --- Ambient halo ---
        const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
        halo.addColorStop(0, glowColor + '44');
        halo.addColorStop(1, 'transparent');
        ctx.fillStyle = halo;
        ctx.fillRect(-20, -20, 40, 40);

        // --- Ground shadow ---
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(2, 9, 13, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- Main hull ---
        const bodyGrad = ctx.createLinearGradient(-16, 0, 16, 0);
        bodyGrad.addColorStop(0, glowColor + 'aa');
        bodyGrad.addColorStop(0.5, glowColor);
        bodyGrad.addColorStop(1, glowColor + 'aa');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(16, -2);
        ctx.lineTo(8, -6);
        ctx.lineTo(-13, -4);
        ctx.lineTo(-13, 4);
        ctx.lineTo(8, 6);
        ctx.lineTo(16, 2);
        ctx.closePath();
        ctx.fill();

        // --- Cockpit canopy ---
        const cockGrad = ctx.createLinearGradient(0, -7, 0, 0);
        cockGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
        cockGrad.addColorStop(1, glowColor + '66');
        ctx.fillStyle = cockGrad;
        ctx.beginPath();
        ctx.moveTo(10, -2);
        ctx.lineTo(4, -6);
        ctx.lineTo(-4, -5);
        ctx.lineTo(-6, 0);
        ctx.lineTo(10, 0);
        ctx.closePath();
        ctx.fill();

        // --- Engine spine ---
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-13, 0);
        ctx.lineTo(13, 0);
        ctx.stroke();

        // --- Wheels ---
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(11, 4, 4, 3, 0.25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(-11, 4, 4, 3, 0.25, 0, Math.PI * 2);
        ctx.stroke();

        // --- Headlight ---
        ctx.shadowBlur = 14;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.ellipse(14, 0, 2, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.restore();
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.explosions.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                color: color
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.updateExplosions();

        const activeCycles = this.cycles.filter(c => !c.dead);

        if (activeCycles.length === 0 || (activeCycles.every(c => c.x > this.canvas.width + 100))) {
            this.initRace();
        }

        this.cycles.forEach((cycle, idx) => {
            if (cycle.dead) return;

            const otherCycle = this.cycles.find((c, i) => i !== idx && !c.dead);

            if (cycle.state === 'CHANGING_LANE') {
                if (Math.abs(cycle.y - cycle.targetY) < 2) {
                    cycle.y = cycle.targetY;
                    cycle.state = 'RUNNING';
                } else {
                    cycle.y += (cycle.targetY > cycle.y) ? 2 : -2;
                }
            } else {
                if (Math.random() < 0.08) {
                    let targetLane = cycle.laneIdx;

                    if (otherCycle) {
                        const isAhead = cycle.x > otherCycle.x + 50;
                        const sameLane = cycle.laneIdx === otherCycle.laneIdx;

                        if (isAhead) {
                            if (!sameLane && Math.random() < 0.5) {
                                if (otherCycle.laneIdx > cycle.laneIdx) targetLane++;
                                else targetLane--;
                            }
                        } else if (Math.abs(cycle.x - otherCycle.x) < 100 && sameLane) {
                            const up = cycle.laneIdx > 0;
                            const down = cycle.laneIdx < this.lanes.length - 1;
                            if (up && down) targetLane += (Math.random() > 0.5 ? 1 : -1);
                            else if (up) targetLane--;
                            else if (down) targetLane++;
                        } else {
                            if (Math.random() < 0.3) {
                                targetLane += (Math.random() > 0.5 ? 1 : -1);
                            }
                        }
                    }

                    if (targetLane < 0) targetLane = 0;
                    if (targetLane >= this.lanes.length) targetLane = this.lanes.length - 1;

                    if (targetLane !== cycle.laneIdx) {
                        cycle.laneIdx = targetLane;
                        cycle.targetY = this.lanes[targetLane];
                        cycle.state = 'CHANGING_LANE';
                    }
                }
            }

            cycle.x += cycle.speed;

            if (cycle.trail.length === 0) cycle.trail.push({ x: cycle.x, y: cycle.y });

            const lastPt = cycle.trail[cycle.trail.length - 1];
            if (Math.abs(lastPt.y - cycle.y) > 0 || cycle.x - lastPt.x > 50) {
                cycle.trail.push({ x: cycle.x, y: cycle.y });
            }

            // Trail proporcional al canvas
            const trailWidth = Math.max(1, this.pixelSize * this.scale);
            this.ctx.beginPath();
            this.ctx.moveTo(cycle.trail[0].x, cycle.trail[0].y);
            for (let pt of cycle.trail) {
                this.ctx.lineTo(pt.x, pt.y);
            }
            this.ctx.lineTo(cycle.x + 3, cycle.y);
            this.ctx.strokeStyle = cycle.trailColor;
            this.ctx.lineWidth = trailWidth;
            this.ctx.stroke();

            this.drawBike(cycle.x, cycle.y, cycle.color);

            if (otherCycle) {
                if (cycle.x < otherCycle.x && cycle.x > otherCycle.x - 200 && Math.abs(cycle.y - otherCycle.y) < 10) {
                    this.createExplosion(cycle.x + 20, cycle.y, cycle.color);
                    cycle.dead = true;
                    otherCycle.speed += 2;
                }
            }

            if (cycle.x > this.canvas.width + 200) {
                cycle.dead = true;
            }
        });

        requestAnimationFrame(this.animate.bind(this));
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.lanes.forEach(y => {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        });
        this.ctx.stroke();
    }

    updateExplosions() {
        this.explosions.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) {
                this.explosions.splice(idx, 1);
                return;
            }
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, 4 * this.scale, 4 * this.scale);
        });
    }
}