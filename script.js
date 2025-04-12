document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const flipButton = document.getElementById('flip-button');
    const result = document.getElementById('result');
    const counter = document.getElementById('counter');
    const history = document.getElementById('history');
    
    let flips = 0;
    let isAnimating = false;
    
    // Check local storage for previous flips
    if (localStorage.getItem('coinFlips')) {
        flips = parseInt(localStorage.getItem('coinFlips'));
        counter.textContent = `Брошено монет: ${flips}`;
    }
    
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
        
        // Remove animation classes
        coin.classList.remove('coin-flip-heads');
        coin.classList.remove('coin-flip-tails');
        
        // Force a reflow to restart animation
        void coin.offsetWidth;
        
        // Random result (0 for heads, 1 for tails)
        const random = Math.floor(Math.random() * 2);
        const resultText = random === 0 ? 'Орел' : 'Решка';
        
        // Add the appropriate animation class
        coin.classList.add(random === 0 ? 'coin-flip-heads' : 'coin-flip-tails');
        
        // Update flips counter
        flips++;
        localStorage.setItem('coinFlips', flips);
        counter.textContent = `Брошено монет: ${flips}`;
        
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
});

