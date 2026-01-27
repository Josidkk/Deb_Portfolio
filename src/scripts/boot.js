export function startBootSequence() {
    // Simulated asset loading delay before terminating
    setTimeout(() => {
        terminateBoot();
    }, 2000); // 2 seconds of the elegant pispileo effect
}

function terminateBoot() {
    const loadingLayer = document.getElementById('loading-layer');
    const app = document.getElementById('app');

    // Create flash element
    const flash = document.createElement('div');
    flash.className = 'exit-warp-flash';
    document.body.appendChild(flash);

    // Start flash and shake
    flash.classList.add('flash-active');
    app.classList.add('shake-active');

    loadingLayer.classList.add('fade-out');

    setTimeout(() => {
        loadingLayer.style.display = 'none';
        app.classList.remove('hidden');
        app.classList.add('fade-in');

        // Trigger resize to let components (like Hyperspace) calculate their size now that they are visible
        window.dispatchEvent(new Event('resize'));

        // Cleanup
        setTimeout(() => {
            flash.remove();
            app.classList.remove('shake-active');
        }, 800);
    }, 400); // Shorter timing for the "jump" feel
}
