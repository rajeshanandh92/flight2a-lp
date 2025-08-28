document.addEventListener('DOMContentLoaded', function() {
    // Agent availability status
    updateAgentStatus();
    
    // Update agent status every minute
    setInterval(updateAgentStatus, 60000);
    
    // Click-to-call functionality
    setupClickToCall();
    
    // Scroll animations
    setupScrollAnimations();
    
    // Popup functionality
    setupPopup();
    
    // Flight search form
    setupFlightSearch();
});

/**
 * Updates the agent status indicator based on current time
 * Agents are available Monday - Sunday 9:30am - 11:30pm EST
 */
function updateAgentStatus() {
    const now = new Date();
    
    // Convert to EST/EDT
    const estOptions = { timeZone: 'America/New_York' };
    const estTime = new Date(now.toLocaleString('en-US', estOptions));
    
    const hours = estTime.getHours();
    const minutes = estTime.getMinutes();
    const currentTime = hours * 60 + minutes; // Convert to minutes for easier comparison
    
    // Available time: 9:30am - 11:30pm EST (570 - 1410 minutes)
    const isAvailable = currentTime >= 570 && currentTime <= 1410;
    
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (isAvailable) {
        statusIndicator.classList.add('online');
        statusIndicator.classList.remove('offline');
        statusText.textContent = 'Agent Online';
        statusText.style.color = '#4CAF50';
    } else {
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
        statusText.textContent = 'Agent Offline';
        statusText.style.color = '#e74c3c';
        
        // Calculate time until agents are available
        let minutesUntilAvailable;
        if (currentTime < 570) {
            minutesUntilAvailable = 570 - currentTime;
        } else {
            minutesUntilAvailable = (24 * 60 - currentTime) + 570; // Next day
        }
        
        const hoursUntilAvailable = Math.floor(minutesUntilAvailable / 60);
        const remainingMinutes = minutesUntilAvailable % 60;
        
        // Update the status text with time until available
        if (hoursUntilAvailable > 0) {
            statusText.textContent = `Available in ${hoursUntilAvailable}h ${remainingMinutes}m`;
        } else {
            statusText.textContent = `Available in ${remainingMinutes}m`;
        }
    }
}

/**
 * Sets up click-to-call functionality with tracking
 */
function setupClickToCall() {
    const callButtons = document.querySelectorAll('a[href^="tel:"]');
    
    callButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Track the call event (can be integrated with analytics)
            trackCallEvent();
            
            // Add visual feedback
            button.classList.add('calling');
            setTimeout(() => {
                button.classList.remove('calling');
            }, 3000);
        });
    });
}

/**
 * Tracks call events (placeholder for analytics integration)
 */
function trackCallEvent() {
    // This function would integrate with your analytics platform
    console.log('Call button clicked: ' + new Date().toISOString());
    
    // Example integration with Google Analytics (if available)
    if (typeof gtag === 'function') {
        gtag('event', 'click_to_call', {
            'event_category': 'Engagement',
            'event_label': 'Phone Call'
        });
    }
}

/**
 * Sets up scroll animations for a more engaging experience
 */
function setupScrollAnimations() {
    // Animate elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.service-card, .benefit-card, .testimonial-card, .airline-logo');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animated');
            }
        });
    };
    
    // Run once on load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
}

/**
 * Adds a subtle pulse animation to call buttons
 */
function pulseCallButtons() {
    const callButtons = document.querySelectorAll('.call-button, .cta-button');
    
    callButtons.forEach(button => {
        setInterval(() => {
            button.classList.add('pulse');
            setTimeout(() => {
                button.classList.remove('pulse');
            }, 1000);
        }, 5000);
    });
}

// Initialize pulse animation after a short delay
setTimeout(pulseCallButtons, 3000);

/**
 * Sets up popup functionality
 */
function setupPopup() {
    const closePopupButton = document.querySelector('.close-popup');
    const popupOverlay = document.querySelector('.popup-overlay');
    const popupCallButton = document.querySelector('.popup-call-button');
    let popupShown = false;
    
    // Close popup when close button is clicked
    if (closePopupButton) {
        closePopupButton.addEventListener('click', function() {
            popupOverlay.classList.remove('active');
        });
    }
    
    // Close popup when clicking outside the popup content
    if (popupOverlay) {
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                popupOverlay.classList.remove('active');
            }
        });
    }
    
    // Track call events from popup
    if (popupCallButton) {
        popupCallButton.addEventListener('click', function() {
            trackCallEvent('popup_call');
        });
    }
    
    // Show popup when user tries to leave the page
    window.addEventListener('beforeunload', function(e) {
        if (!popupShown) {
            // Show the popup
            if (popupOverlay) {
                popupOverlay.classList.add('active');
                popupShown = true;
            }
            
            // This message might not be displayed in modern browsers due to security reasons,
            // but the beforeunload event will still trigger
            const confirmationMessage = 'Wait! Before you go, our agents can help you with your flight needs.';
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });
    
    // Also show popup when mouse leaves the viewport (user moving to address bar or tabs)
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !popupShown) {
            if (popupOverlay) {
                popupOverlay.classList.add('active');
                popupShown = true;
                
                // Reset the flag after some time to allow the popup to show again
                // if the user doesn't actually leave
                setTimeout(function() {
                    popupShown = false;
                }, 30000); // 30 seconds
            }
        }
    });
}

/**
 * Sets up flight search form functionality
 */
function setupFlightSearch() {
    const searchForm = document.querySelector('.search-form');
    const flightResults = document.querySelector('.flight-results');
    const searchButton = document.querySelector('.search-button');
    const popupOverlay = document.querySelector('.popup-overlay');
    const bookButtons = document.querySelectorAll('.book-now-button');
    
    // Handle search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            if (searchButton) {
                searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
                searchButton.disabled = true;
            }
            
            // Simulate search delay
            setTimeout(function() {
                // Reset button
                if (searchButton) {
                    searchButton.innerHTML = '<i class="fas fa-search"></i> Search Flights';
                    searchButton.disabled = false;
                }
                
                // Show results
                if (flightResults) {
                    flightResults.classList.add('active');
                    
                    // Scroll to results
                    flightResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 1500);
        });
    }
    
    // Handle book now buttons
    if (bookButtons) {
        bookButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Show popup
                if (popupOverlay) {
                    popupOverlay.classList.add('active');
                }
                
                // Track booking attempt
                trackCallEvent('booking_attempt');
            });
        });
    }
}

/**
 * Tracks call events with specific sources
 */
function trackCallEvent(source = 'direct_call') {
    // This function would integrate with your analytics platform
    console.log(`Call button clicked (${source}): ${new Date().toISOString()}`);
    
    // Example integration with Google Analytics (if available)
    if (typeof gtag === 'function') {
        gtag('event', 'click_to_call', {
            'event_category': 'Engagement',
            'event_label': source
        });
    }
}