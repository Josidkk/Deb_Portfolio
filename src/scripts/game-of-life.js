export class GameOfLife {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 15;
        this.deadColor = `#000000`;
        this.aliveColor = `#8be9fd`; // Cyan
        this.secondaryColor = `#bd93f9`; // Purple

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        this.lastUpdate = 0;
        this.updateInterval = 50; // Update every 50ms (20fps logic) for readability

        this.init();
        this.animate(0);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        this.initGrid();
    }

    initGrid() {
        this.grid = this.createEmptyGrid();
        this.randomize();
    }

    createEmptyGrid() {
        return new Array(this.cols).fill(null).map(() => new Array(this.rows).fill(0));
    }

    randomize() {
        // Fill ~20% of spots
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = Math.random() > 0.85 ? 1 : 0;
            }
        }
    }

    handleMouseMove(e) {
        const x = Math.floor(e.clientX / this.cellSize);
        const y = Math.floor(e.clientY / this.cellSize);

        // Paint life
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            this.grid[x][y] = 1;
            // Add noise around
            if (this.grid[x + 1] && this.grid[x + 1][y]) this.grid[x + 1][y] = 1;
            if (this.grid[x][y + 1]) this.grid[x][y + 1] = 1;
        }
    }

    init() {
        this.initGrid();
    }

    computeNextGen() {
        let next = this.createEmptyGrid();

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let state = this.grid[i][j];

                // Count neighbors
                let sum = 0;
                let neighbors = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];

                for (let k = 0; k < neighbors.length; k++) {
                    let x = i + neighbors[k][0];
                    let y = j + neighbors[k][1];

                    // Wrap edges or ignore? Let's ignore edges for speed
                    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                        sum += this.grid[x][y];
                    }
                }

                // Rules
                if (state === 0 && sum === 3) {
                    next[i][j] = 1; // Reproduction
                } else if (state === 1 && (sum < 2 || sum > 3)) {
                    next[i][j] = 0; // Death
                } else {
                    next[i][j] = state; // Stasis
                }
            }
        }
        this.grid = next;
    }

    draw() {
        // Clear with fade for trails? Or sharp?
        // Sharp is more "classic". Fade is "cyber". Let's do slight fade.
        this.ctx.fillStyle = 'rgba(13, 17, 23, 0.4)'; // Dark BG with opacity
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (this.grid[i][j] === 1) {
                    // Color based on position? Or random?
                    // Let's alternate colors for visual flair
                    this.ctx.fillStyle = (i + j) % 2 === 0 ? this.aliveColor : this.secondaryColor;

                    // Draw rect with slight padding for grid look
                    this.ctx.fillRect(
                        i * this.cellSize + 1,
                        j * this.cellSize + 1,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );

                    // Glow effect (expensive, maybe only if few cells? Skip for performance or canvas filters)
                }
            }
        }
    }

    animate(timestamp) {
        if (timestamp - this.lastUpdate > this.updateInterval) {
            this.computeNextGen();
            this.lastUpdate = timestamp;
        }

        // Always draw (interpolated? no, grid system)
        // If we only draw on update, it might look jerky.
        // Actually, draw every frame to keep fade effect working if using fade?
        // If clearRect, only draw on update.
        // If using trails, draw every frame.
        this.draw();

        requestAnimationFrame((t) => this.animate(t));
    }
}
