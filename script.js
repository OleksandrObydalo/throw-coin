document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const flipButton = document.getElementById('flip-button');
    const result = document.getElementById('result');
    const history = document.getElementById('history');
    const headsCount = document.getElementById('heads-count');
    const tailsCount = document.getElementById('tails-count');
    const totalCount = document.getElementById('total-count');
    const headsPercent = document.getElementById('heads-percent');
    const tailsPercent = document.getElementById('tails-percent');
    
    let heads = 0;
    let tails = 0;
    let isAnimating = false;
    
    // Check local storage for previous flips
    if (localStorage.getItem('headsCount')) {
        heads = parseInt(localStorage.getItem('headsCount'));
        headsCount.textContent = heads;
    }
    
    if (localStorage.getItem('tailsCount')) {
        tails = parseInt(localStorage.getItem('tailsCount'));
        tailsCount.textContent = tails;
    }
    
    updateStats();
    
    // Load history from local storage
    if (localStorage.getItem('flipHistory')) {
        const savedHistory = JSON.parse(localStorage.getItem('flipHistory'));
        // Display only the last 10 flips
        const recentHistory = savedHistory.slice(-10);
        
        recentHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${item === 'Орел' ? 'heads-history' : 'tails-history'}`;
            historyItem.textContent = item;
            history.appendChild(historyItem);
        });
    }
    
    flipButton.addEventListener('click', () => {
        if (isAnimating) return;
        
        isAnimating = true;
        flipButton.disabled = true;
        result.textContent = 'Монета подбрасывается...';
        
        // Remove animation class
        coin.classList.remove('coin-flip');
        
        // Force a reflow to restart animation
        void coin.offsetWidth;
        
        // Random result (0 for heads, 1 for tails)
        const random = Math.floor(Math.random() * 2);
        const resultText = random === 0 ? 'Орел' : 'Решка';
        
        // Set a random number of rotations between 5 and 10 plus final orientation
        const rotations = 5 + Math.floor(Math.random() * 5);
        const finalRotation = random === 0 ? 0 : 180;
        const totalRotation = (rotations * 360) + finalRotation;
        
        // Set the CSS variable for the final rotation
        coin.style.setProperty('--final-rotation', `${totalRotation}deg`);
        
        // Add the animation class
        coin.classList.add('coin-flip');
        
        // Update counts
        if (random === 0) {
            heads++;
            localStorage.setItem('headsCount', heads);
            headsCount.textContent = heads;
        } else {
            tails++;
            localStorage.setItem('tailsCount', tails);
            tailsCount.textContent = tails;
        }
        
        updateStats();
        
        // Update history
        let flipHistory = [];
        if (localStorage.getItem('flipHistory')) {
            flipHistory = JSON.parse(localStorage.getItem('flipHistory'));
        }
        flipHistory.push(resultText);
        localStorage.setItem('flipHistory', JSON.stringify(flipHistory));
        
        // Show result after animation
        setTimeout(() => {
            result.textContent = resultText;
            
            // Add to visual history (only showing last 10)
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${random === 0 ? 'heads-history' : 'tails-history'}`;
            historyItem.textContent = resultText;
            
            // Remove oldest item if we have 10 already displayed
            if (history.children.length >= 10) {
                history.removeChild(history.firstChild);
            }
            
            history.appendChild(historyItem);
            
            isAnimating = false;
            flipButton.disabled = false;
        }, 3000);
    });
    
    function updateStats() {
        const total = heads + tails;
        totalCount.textContent = total;
        
        if (total > 0) {
            const headsPercentValue = ((heads / total) * 100).toFixed(1);
            const tailsPercentValue = ((tails / total) * 100).toFixed(1);
            
            headsPercent.textContent = `(${headsPercentValue}%)`;
            tailsPercent.textContent = `(${tailsPercentValue}%)`;
        } else {
            headsPercent.textContent = '(0%)';
            tailsPercent.textContent = '(0%)';
        }
    }
});