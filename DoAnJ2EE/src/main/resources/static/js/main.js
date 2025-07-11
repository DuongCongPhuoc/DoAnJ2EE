// Main JavaScript file for Game Portal

// Global variables
let currentGame = null;
let gameScore = 0;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Game Portal initialized');
    
    // Add smooth scrolling to all links
    addSmoothScrolling();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Add loading animations
    addLoadingAnimations();
});

// Add smooth scrolling to all anchor links
function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Add loading animations to elements
function addLoadingAnimations() {
    // Animate game cards on scroll
    const gameCards = document.querySelectorAll('.game-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    gameCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get random color
function getRandomColor() {
    const colors = [
        '#ff6b35', '#f7931e', '#ffd23f', '#27ae60', 
        '#3498db', '#9b59b6', '#e74c3c', '#1abc9c'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Animate counter
function animateCounter(element, start, end, duration = 1000) {
    const startTime = performance.now();
    const difference = end - start;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (difference * progress));
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Game utilities
const GameUtils = {
    // Calculate score based on time and accuracy
    calculateScore: function(time, accuracy, difficulty = 1) {
        const baseScore = 1000;
        const timeBonus = Math.max(0, 60 - time) * 10;
        const accuracyBonus = accuracy * 5;
        return Math.floor((baseScore + timeBonus + accuracyBonus) * difficulty);
    },
    
    // Format time as MM:SS
    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Generate random number between min and max
    random: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Shuffle array
    shuffle: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameUtils, showNotification, formatNumber, getRandomColor, animateCounter };
} 