export class LightCycle {
    constructor(canvasWidth, canvasHeight, color) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.color = color;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.speed = 2 + Math.random() * 2; // Fast speed
        this.size = 2;
        this.trail = [];
        this.maxTrail = 60; // Length of the trail
        this.dead = false;

        // Random direction: 0: up, 1: right, 2: down, 3: left
        this.dir = Math.floor(Math.random() * 4);
        this.turnTimer = 0;
        this.turnInterval = Math.floor(Math.random() * 100) + 50;
    }

    update() {
        if (this.dead) return;

        // Add current pos to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        // Move based on direction
        switch (this.dir) {
            case 0: this.y -= this.speed; break; // Up
            case 1: this.x += this.speed; break; // Right
            case 2: this.y += this.speed; break; // Down
            case 3: this.x -= this.speed; break; // Left
        }

        // Turn logic
        this.turnTimer++;
        if (this.turnTimer >= this.turnInterval) {
            this.turnTimer = 0;
            // 50% chance to turn left or right relative to current path
            // e.g. if going Up (0), can turn Right (1) or Left (3).
            // Logic: (dir + 1) % 4 is right turn, (dir + 3) % 4 is left turn.
            if (Math.random() > 0.5) {
                this.dir = (this.dir + 1) % 4;
            } else {
                this.dir = (this.dir + 3) % 4;
            }
            this.turnInterval = Math.floor(Math.random() * 100) + 20;
        }

        // Bounds check - wrap around or die? Let's wrap for infinite flow
        if (this.x < 0 || this.x > this.width || this.y < 0 || this.y > this.height) {
            this.reset();
        }
    }

    draw(ctx) {
        if (this.dead || this.trail.length < 2) return;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'square';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        // Draw the trail
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.stroke();

        // Draw head
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - 1, this.y - 1, 4, 4);
    }
}

export class TronSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cycles = [];
        this.resize();

        window.addEventListener('resize', () => this.resize());

        this.initCycles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    initCycles() {
        // Create a mix of Cyan and Purple cycles
        const count = 15; // Number of active bikes
        for (let i = 0; i < count; i++) {
            const color = Math.random() > 0.5 ? '#8be9fd' : '#bd93f9'; // Cyan or Purple
            this.cycles.push(new LightCycle(this.width, this.height, color));
        }
    }

    animate() {
        // Slight fade effect to create "motion blur" or just clear?
        // Let's clear properly for sharp neon lines
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.cycles.forEach(cycle => {
            cycle.update();
            cycle.draw(this.ctx);
        });

        requestAnimationFrame(this.animate.bind(this));
    }
}
