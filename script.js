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
    const headsProbabilityInput = document.getElementById('heads-probability');
    const clearStatsButton = document.getElementById('clear-stats');
    const flipCountInput = document.getElementById('flip-count');

    let heads = 0;
    let tails = 0;
    let isAnimating = false;
    let flipQueue = 0;

    let headsProbability = 50; // Default to 50%

    // Load saved probability from local storage if available
    if (localStorage.getItem('headsProbability')) {
        headsProbability = parseFloat(localStorage.getItem('headsProbability'));
        headsProbabilityInput.value = headsProbability;
    }
    
    headsProbabilityInput.addEventListener('change', () => {
        headsProbability = parseFloat(headsProbabilityInput.value);
        localStorage.setItem('headsProbability', headsProbability);
    });

    clearStatsButton.addEventListener('click', () => {
        heads = 0;
        tails = 0;
        localStorage.removeItem('headsCount');
        localStorage.removeItem('tailsCount');
        localStorage.removeItem('flipHistory');
        headsCount.textContent = '0';
        tailsCount.textContent = '0';
        totalCount.textContent = '0';
        headsPercent.textContent = '(0%)';
        tailsPercent.textContent = '(0%)';
        history.innerHTML = ''; // Clear history display
        
        // Reset chart
        differenceChart.data.labels = [];
        differenceChart.data.datasets[0].data = [];
        differenceChart.update();
    });
    
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
    
    // Chart initialization
    const ctx = document.getElementById('difference-chart').getContext('2d');
    const differenceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Разница (Орел - Решка)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    function updateDifferenceChart(resultText) {
        const data = differenceChart.data;
        
        // Add a new label (flip number)
        data.labels.push(data.labels.length + 1);
        
        // Calculate the difference (heads - tails)
        const difference = heads - tails;
        data.datasets[0].data.push(difference);

        // Keep only the last 20 points
        if (data.labels.length > 20) {
            data.labels.shift();
            data.datasets[0].data.shift();
        }

        differenceChart.update();
    }

    flipButton.addEventListener('click', () => {
        if (isAnimating) return;
        
        const flipsToPerform = parseInt(flipCountInput.value) || 1;
        flipQueue = flipsToPerform;
        
        performNextFlip();
    });
    
    function performNextFlip() {
        if (flipQueue <= 0 || isAnimating) return;
        
        isAnimating = true;
        flipButton.disabled = true;
        result.textContent = `Монета подбрасывается... (осталось: ${flipQueue})`;
        
        // Remove animation class
        coin.classList.remove('coin-flip');
        
        // Force a reflow to restart animation
        void coin.offsetWidth;
        
        // Random result (0 for heads, 1 for tails)
        const random = Math.random() < (headsProbability / 100) ? 0 : 1;
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
            result.textContent = flipQueue > 1 ? 
                `${resultText} (осталось бросков: ${flipQueue-1})` : 
                resultText;
            
            // Add to visual history
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${random === 0 ? 'heads-history' : 'tails-history'}`;
            historyItem.textContent = resultText;
            
            // Remove oldest item if we have 10 already displayed
            if (history.children.length >= 10) {
                history.removeChild(history.firstChild);
            }
            
            history.appendChild(historyItem);
            
            // Update difference chart
            updateDifferenceChart(resultText);
            
            isAnimating = false;
            flipQueue--;
            
            if (flipQueue > 0) {
                // Continue with next flip after a short pause
                setTimeout(performNextFlip, 300);
            } else {
                flipButton.disabled = false;
            }
        }, 3000);
    }
    
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