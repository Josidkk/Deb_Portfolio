export class TronRace {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`TronRace: Canvas element with id "${canvasId}" not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.pixelSize = 4;
        this.cycles = [];
        this.explosions = []; // Store active explosions

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Define lanes (Y positions)
        // Canvas is roughly 100px high. 
        // Lanes at: 20, 40, 60, 80
        this.lanes = [20, 35, 50, 65, 80];

        this.initRace();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = 120; // Slightly taller for maneuvering
    }

    initRace() {
        this.cycles = [];
        this.explosions = [];

        // Orange Bike (Player 1)
        this.cycles.push(this.createCycle('#ff9900', '#cc7a00', 0, 1.2)); // Slightly slower/faster random

        // Blue Bike (Player 2)
        this.cycles.push(this.createCycle('#00ffff', '#00cccc', 4, 1.2));
    }

    createCycle(color, trailColor, initialLaneIdx, speedBase) {
        return {
            x: -50,
            y: this.lanes[initialLaneIdx],
            laneIdx: initialLaneIdx,
            color: color,
            trailColor: trailColor,
            speed: 3 + Math.random() * speedBase,
            targetY: this.lanes[initialLaneIdx],
            state: 'RUNNING', // RUNNING, CHANGING_LANE, CRASHED, DEAD
            trail: [], // Store recent trail for collision logic?
            // Actually trails in footer might get messy if we persist them forever.
            // Let's persist them for a long time or until off screen.
            dead: false
        };
    }

    drawBike(x, y, color) {
        const p = this.pixelSize;
        this.ctx.fillStyle = color;

        const shape = [
            { dx: 2, dy: 0 }, { dx: 3, dy: 0 }, { dx: 4, dy: 0 }, { dx: 5, dy: 0 },
            { dx: 1, dy: 1 }, { dx: 2, dy: 1 }, { dx: 3, dy: 1 }, { dx: 4, dy: 1 }, { dx: 5, dy: 1 }, { dx: 6, dy: 1 },
            { dx: 0, dy: 2 }, { dx: 1, dy: 2 }, { dx: 6, dy: 2 }, { dx: 7, dy: 2 }
        ];

        shape.forEach(pt => {
            this.ctx.fillRect(x + pt.dx * p, y + pt.dy * p, p, p);
        });
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
        // Fade effect for trails? No, classic tron has solid trails.
        // But since this is a side scroller, the canvas moves?
        // Let's clear the canvas.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Grid
        this.drawGrid();

        // Update Explosoions
        this.updateExplosions();

        const activeCycles = this.cycles.filter(c => !c.dead);

        // If one is dead and offscreen, maybe restart race soon?
        if (activeCycles.length === 0 || (activeCycles.every(c => c.x > this.canvas.width + 100))) {
            this.initRace(); // Restart when loop creates emptiness
        }

        this.cycles.forEach((cycle, idx) => {
            if (cycle.dead) return;

            // AI LOGIC
            // 1. Check if ahead or behind
            const otherCycle = this.cycles.find((c, i) => i !== idx && !c.dead);

            // If Changing Lane, move Y
            if (cycle.state === 'CHANGING_LANE') {
                if (Math.abs(cycle.y - cycle.targetY) < 2) {
                    cycle.y = cycle.targetY;
                    cycle.state = 'RUNNING';
                } else {
                    cycle.y += (cycle.targetY > cycle.y) ? 2 : -2;
                }
            } else {
                // DECISION MAKING
                // Chance to change lane
                if (Math.random() < 0.02) {
                    // Aggressive: If ahead, try to match other cycle's lane to block
                    // Defensive: If behind and in same lane, move away!

                    let targetLane = cycle.laneIdx;

                    if (otherCycle) {
                        const isAhead = cycle.x > otherCycle.x + 50; // Clearly ahead
                        const sameLane = cycle.laneIdx === otherCycle.laneIdx;

                        if (isAhead) {
                            // Try to block!
                            if (!sameLane && Math.random() < 0.5) {
                                // Move towards opponent
                                if (otherCycle.laneIdx > cycle.laneIdx) targetLane++;
                                else targetLane--;
                            }
                        } else if (Math.abs(cycle.x - otherCycle.x) < 100 && sameLane) {
                            // Behind and Close! DODGE!
                            const up = cycle.laneIdx > 0;
                            const down = cycle.laneIdx < this.lanes.length - 1;

                            if (up && down) targetLane += (Math.random() > 0.5 ? 1 : -1);
                            else if (up) targetLane--;
                            else if (down) targetLane++;
                        } else {
                            // Random wandering
                            if (Math.random() < 0.3) {
                                const dir = Math.random() > 0.5 ? 1 : -1;
                                targetLane += dir;
                            }
                        }
                    }

                    // Boundary Check
                    if (targetLane < 0) targetLane = 0;
                    if (targetLane >= this.lanes.length) targetLane = this.lanes.length - 1;

                    if (targetLane !== cycle.laneIdx) {
                        cycle.laneIdx = targetLane;
                        cycle.targetY = this.lanes[targetLane];
                        cycle.state = 'CHANGING_LANE';
                    }
                }
            }

            // Move X
            cycle.x += cycle.speed;

            // DRAW TRAIL
            // In a side scroller, the trail is the history.
            // Since we clear canvas, we must redraw trail from points or just a long rect?
            // "Se quieren destruir con su luz" -> The trail is the weapon.
            // Draw a long trail behind the bike.
            this.ctx.fillStyle = cycle.trailColor;

            // Trail logic: A solid box from X=0 to BikeX?
            // If they change lanes, the trail should follow?
            // Complex trails require storing points.
            if (cycle.trail.length === 0) cycle.trail.push({ x: -100, y: cycle.y });

            // Add current point if y changed or interval
            const lastPt = cycle.trail[cycle.trail.length - 1];
            if (Math.abs(lastPt.y - cycle.y) > 0 || cycle.x - lastPt.x > 50) {
                cycle.trail.push({ x: cycle.x, y: cycle.y });
            }

            // Draw Trail segments
            this.ctx.beginPath();
            this.ctx.moveTo(cycle.trail[0].x, cycle.trail[0].y + 4); // Offset to middle of bike
            for (let pt of cycle.trail) {
                this.ctx.lineTo(pt.x, pt.y + 4);
            }
            this.ctx.lineTo(cycle.x, cycle.y + 4);

            this.ctx.strokeStyle = cycle.trailColor;
            this.ctx.lineWidth = this.pixelSize; // Trail height
            this.ctx.stroke();

            // Draw Bike
            this.drawBike(cycle.x, cycle.y, cycle.color);

            // COLLISION?
            // Since it's a side scroller, collision with "trail" usually means hitting someone who cut in front.
            // Check if I overlap with opponent's TRAIL.
            if (otherCycle) {
                // Approximate collision: if our head (cycle.x + width) is inside other's trail Y?
                // And we are behind?
                if (cycle.x < otherCycle.x && cycle.x > otherCycle.x - 200 && Math.abs(cycle.y - otherCycle.y) < 10) {
                    // CRASH!
                    this.createExplosion(cycle.x + 20, cycle.y, cycle.color);
                    cycle.dead = true;
                    // Opponent speeds up in victory
                    otherCycle.speed += 2;
                }
            }

            // Loop reset
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
        // Horizontal Lanes
        this.lanes.forEach(y => {
            this.ctx.moveTo(0, y + 10); // Offset to be under wheels
            this.ctx.lineTo(this.canvas.width, y + 10);
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
            this.ctx.fillRect(p.x, p.y, 4, 4);
        });
    }
}
