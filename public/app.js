const API_URL = "http://127.0.0.1:8000";
const flightsContainer = document.getElementById('flights-container');
const flightSelect = document.getElementById('flight-select');
const form = document.getElementById('booking-form');
const msg = document.getElementById('msg');

// Load flights
async function loadFlights() {
  const resp = await fetch(`${API_URL}/flights`);
  const flights = await resp.json();

  flightsContainer.innerHTML = "";
  flightSelect.innerHTML = '<option value="">Select Flight</option>';

  flights.forEach(f => {
    // card
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.innerHTML = `
      <img src="https://source.unsplash.com/400x200/?airplane,${f.destination}" alt="Flight">
      <div class="details">
        <h3>${f.source} → ${f.destination}</h3>
        <p>Date: ${f.date}</p>
        <p>Seats Available: ${f.seats}</p>
        <p>Price: ₹${f.price}</p>
      </div>
    `;
    flightsContainer.appendChild(card);

    // dropdown
    const option = document.createElement('option');
    option.value = f.id;
    option.textContent = `${f.source} → ${f.destination} | ${f.date}`;
    flightSelect.appendChild(option);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    username: document.getElementById('username').value,
    passenger: document.getElementById('passenger').value,
    seats: parseInt(document.getElementById('seats').value),
    flight_id: parseInt(flightSelect.value)
  };

  const res = await fetch(`${API_URL}/book`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  msg.textContent = result.message || result.detail;
  msg.style.color = res.ok ? "green" : "red";

  // reload flights so seat count updates
  loadFlights();
});/**
 * ============================================
 * SkyVoyage - Flight Booking Application
 * ============================================
 * 
 * This JavaScript file handles all the interactive functionality
 * of the flight booking website including:
 * - Flight search and filtering
 * - Dynamic flight card generation
 * - Booking form management
 * - Seat selection
 * - Form validation
 * - API-ready architecture
 */

// ============================================
// Configuration & Constants
// ============================================

/**
 * API Configuration
 * Ready to connect with a backend API (like FastAPI)
 */
const API_CONFIG = {
    baseUrl: '/api', // Base URL for API endpoints
    endpoints: {
        flights: '/flights',
        booking: '/bookings',
        seats: '/seats'
    }
};

/**
 * Mock Flight Data
 * This data simulates what would come from a backend API
 * In production, this would be fetched from FastAPI endpoints
 */
const MOCK_FLIGHTS = [
    {
        id: 'FL001',
        airline: 'SkyVoyage Airways',
        flightNumber: 'SV-1234',
        from: { code: 'NYC', city: 'New York', time: '08:00 AM' },
        to: { code: 'LDN', city: 'London', time: '08:30 PM' },
        duration: '7h 30m',
        price: 649,
        seatsAvailable: 45,
        class: 'economy',
        date: '2025-12-01'
    },
    {
        id: 'FL002',
        airline: 'Atlantic Airlines',
        flightNumber: 'AA-5678',
        from: { code: 'LAX', city: 'Los Angeles', time: '10:15 AM' },
        to: { code: 'TKY', city: 'Tokyo', time: '03:45 PM +1' },
        duration: '11h 30m',
        price: 899,
        seatsAvailable: 12,
        class: 'economy',
        date: '2025-12-01'
    },
    {
        id: 'FL003',
        airline: 'Pacific Wings',
        flightNumber: 'PW-9012',
        from: { code: 'SFO', city: 'San Francisco', time: '06:30 AM' },
        to: { code: 'SYD', city: 'Sydney', time: '09:00 PM +1' },
        duration: '15h 30m',
        price: 1249,
        seatsAvailable: 28,
        class: 'economy',
        date: '2025-12-02'
    },
    {
        id: 'FL004',
        airline: 'Euro Connect',
        flightNumber: 'EC-3456',
        from: { code: 'CHI', city: 'Chicago', time: '02:00 PM' },
        to: { code: 'PAR', city: 'Paris', time: '06:30 AM +1' },
        duration: '8h 30m',
        price: 729,
        seatsAvailable: 56,
        class: 'economy',
        date: '2025-12-01'
    },
    {
        id: 'FL005',
        airline: 'Desert Express',
        flightNumber: 'DE-7890',
        from: { code: 'MIA', city: 'Miami', time: '11:45 PM' },
        to: { code: 'DXB', city: 'Dubai', time: '10:15 PM +1' },
        duration: '14h 30m',
        price: 1099,
        seatsAvailable: 8,
        class: 'economy',
        date: '2025-12-03'
    },
    {
        id: 'FL006',
        airline: 'SkyVoyage Airways',
        flightNumber: 'SV-2468',
        from: { code: 'LDN', city: 'London', time: '09:00 AM' },
        to: { code: 'NYC', city: 'New York', time: '12:00 PM' },
        duration: '8h 00m',
        price: 599,
        seatsAvailable: 34,
        class: 'economy',
        date: '2025-12-02'
    }
];

// ============================================
// State Management
// ============================================

/**
 * Application State
 * Centralized state management for the booking flow
 */
const appState = {
    flights: [...MOCK_FLIGHTS],
    filteredFlights: [...MOCK_FLIGHTS],
    selectedFlight: null,
    selectedSeats: [],
    passengerCount: 1,
    bookingData: {}
};

// ============================================
// DOM Elements
// ============================================

/**
 * Cache DOM elements for better performance
 */
const elements = {
    // Navigation
    navbar: document.querySelector('.navbar'),
    mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
    navLinks: document.querySelector('.nav-links'),
    
    // Search Form
    searchForm: document.getElementById('search-form'),
    fromSelect: document.getElementById('from'),
    toSelect: document.getElementById('to'),
    dateInput: document.getElementById('date'),
    passengersSelect: document.getElementById('passengers'),
    classSelect: document.getElementById('class'),
    swapBtn: document.querySelector('.swap-btn'),
    
    // Flights Display
    flightsContainer: document.getElementById('flights-container'),
    noFlights: document.getElementById('no-flights'),
    
    // Booking Form
    bookingForm: document.getElementById('booking-form'),
    selectedFlightDisplay: document.getElementById('selected-flight-display'),
    selectedFlightInfo: document.getElementById('selected-flight-info'),
    passengersContainer: document.getElementById('passengers-container'),
    seatMap: document.getElementById('seat-map'),
    selectedSeatsList: document.getElementById('selected-seats-list'),
    bookBtn: document.getElementById('book-btn'),
    
    // Summary
    summaryFlight: document.getElementById('summary-flight'),
    summaryPassengers: document.getElementById('summary-passengers'),
    summarySeats: document.getElementById('summary-seats'),
    summaryTotal: document.getElementById('summary-total'),
    
    // Modal
    confirmationModal: document.getElementById('confirmation-modal'),
    confirmationDetails: document.getElementById('confirmation-details')
};

// ============================================
// Utility Functions
// ============================================

/**
 * Format price with currency symbol
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

/**
 * Generate a unique booking reference
 * @returns {string} Unique booking reference
 */
function generateBookingRef() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = 'SV-';
    for (let i = 0; i < 6; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
}

/**
 * Set minimum date for date input to today
 */
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.dateInput.min = today;
    elements.dateInput.value = today;
}

// ============================================
// Flight Card Generation
// ============================================

/**
 * Create HTML for a single flight card
 * @param {Object} flight - Flight data object
 * @returns {string} HTML string for the flight card
 */
function createFlightCard(flight) {
    const seatsClass = flight.seatsAvailable <= 10 ? 'seats-low' : 'seats-available';
    const isSelected = appState.selectedFlight?.id === flight.id;
    
    return `
        <div class="flight-card ${isSelected ? 'selected' : ''}" data-flight-id="${flight.id}">
            <div class="flight-header">
                <div class="airline-info">
                    <div class="airline-logo">
                        <i class="fas fa-plane"></i>
                    </div>
                    <div>
                        <div class="airline-name">${flight.airline}</div>
                        <div class="flight-number">${flight.flightNumber}</div>
                    </div>
                </div>
                <div class="flight-price">
                    <div class="price-label">From</div>
                    <div class="price-value">${formatPrice(flight.price)}</div>
                </div>
            </div>
            
            <div class="flight-route">
                <div class="route-point">
                    <div class="route-code">${flight.from.code}</div>
                    <div class="route-city">${flight.from.city}</div>
                    <div class="route-time">${flight.from.time}</div>
                </div>
                <div class="route-line">
                    <i class="fas fa-plane"></i>
                </div>
                <div class="route-point">
                    <div class="route-code">${flight.to.code}</div>
                    <div class="route-city">${flight.to.city}</div>
                    <div class="route-time">${flight.to.time}</div>
                </div>
            </div>
            
            <div class="flight-details">
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${flight.duration}</span>
                </div>
                <div class="detail-item ${seatsClass}">
                    <i class="fas fa-chair"></i>
                    <span>${flight.seatsAvailable} seats left</span>
                </div>
            </div>
            
            <button class="btn btn-primary select-flight-btn" onclick="selectFlight('${flight.id}')">
                <i class="fas fa-check-circle"></i>
                <span>${isSelected ? 'Selected' : 'Select Flight'}</span>
            </button>
        </div>
    `;
}

/**
 * Render all flight cards to the DOM
 */
function renderFlights() {
    const flights = appState.filteredFlights;
    
    if (flights.length === 0) {
        elements.flightsContainer.innerHTML = '';
        elements.noFlights.classList.remove('hidden');
        return;
    }
    
    elements.noFlights.classList.add('hidden');
    elements.flightsContainer.innerHTML = flights.map(createFlightCard).join('');
}

// ============================================
// Flight Search & Filtering
// ============================================

/**
 * Filter flights based on search criteria
 * @param {Object} criteria - Search criteria object
 */
function filterFlights(criteria) {
    let filtered = [...appState.flights];
    
    if (criteria.from) {
        filtered = filtered.filter(f => f.from.code === criteria.from);
    }
    
    if (criteria.to) {
        filtered = filtered.filter(f => f.to.code === criteria.to);
    }
    
    if (criteria.class) {
        filtered = filtered.filter(f => f.class === criteria.class);
    }
    
    appState.filteredFlights = filtered;
    renderFlights();
}

/**
 * Handle search form submission
 * @param {Event} e - Form submit event
 */
function handleSearch(e) {
    e.preventDefault();
    
    const criteria = {
        from: elements.fromSelect.value,
        to: elements.toSelect.value,
        date: elements.dateInput.value,
        passengers: parseInt(elements.passengersSelect.value),
        class: elements.classSelect.value
    };
    
    // Update passenger count in state
    appState.passengerCount = criteria.passengers;
    
    // Filter flights
    filterFlights(criteria);
    
    // Update passenger forms
    updatePassengerForms();
    
    // Scroll to flights section
    document.getElementById('flights').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Swap origin and destination airports
 */
function swapLocations() {
    const temp = elements.fromSelect.value;
    elements.fromSelect.value = elements.toSelect.value;
    elements.toSelect.value = temp;
}

// ============================================
// Flight Selection
// ============================================

/**
 * Select a flight for booking
 * @param {string} flightId - ID of the flight to select
 */
function selectFlight(flightId) {
    const flight = appState.flights.find(f => f.id === flightId);
    
    if (!flight) return;
    
    appState.selectedFlight = flight;
    appState.selectedSeats = [];
    
    // Update UI
    renderFlights();
    updateSelectedFlightDisplay();
    generateSeatMap();
    updateBookingSummary();
    
    // Enable/disable book button
    validateBookingForm();
    
    // Scroll to booking section
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Update the selected flight display in booking form
 */
function updateSelectedFlightDisplay() {
    const flight = appState.selectedFlight;
    
    if (!flight) {
        elements.selectedFlightDisplay.classList.add('hidden');
        return;
    }
    
    elements.selectedFlightDisplay.classList.remove('hidden');
    elements.selectedFlightInfo.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
                <strong>${flight.flightNumber}</strong> - ${flight.airline}<br>
                <span style="color: var(--text-light);">
                    ${flight.from.city} (${flight.from.code}) → ${flight.to.city} (${flight.to.code})
                </span>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">
                    ${formatPrice(flight.price)}
                </div>
                <span style="color: var(--text-light);">per person</span>
            </div>
        </div>
    `;
}

// ============================================
// Passenger Forms Management
// ============================================

/**
 * Update passenger form count based on selection
 */
function updatePassengerForms() {
    const count = appState.passengerCount;
    let html = '';
    
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="passenger-form" data-passenger="${i}">
                <div class="passenger-header">
                    <span>Passenger ${i}</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="passenger-first-${i}">First Name</label>
                        <input type="text" id="passenger-first-${i}" name="passenger-first-${i}" placeholder="First name" required>
                    </div>
                    <div class="form-group">
                        <label for="passenger-last-${i}">Last Name</label>
                        <input type="text" id="passenger-last-${i}" name="passenger-last-${i}" placeholder="Last name" required>
                    </div>
                </div>
            </div>
        `;
    }
    
    elements.passengersContainer.innerHTML = html;
    
    // Reset seat selection when passenger count changes
    appState.selectedSeats = [];
    generateSeatMap();
}

// ============================================
// Seat Selection System
// ============================================

/**
 * Generate the seat map UI
 * Creates a realistic airplane seat layout
 */
function generateSeatMap() {
    const rows = 8;
    const seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    // Generate random occupied seats
    const occupiedSeats = new Set();
    const occupiedCount = Math.floor(Math.random() * 15) + 10;
    
    while (occupiedSeats.size < occupiedCount) {
        const row = Math.floor(Math.random() * rows) + 1;
        const seat = seatsPerRow[Math.floor(Math.random() * seatsPerRow.length)];
        occupiedSeats.add(`${row}${seat}`);
    }
    
    let html = '';
    
    for (let row = 1; row <= rows; row++) {
        html += '<div class="seat-row">';
        
        for (let i = 0; i < seatsPerRow.length; i++) {
            const seatId = `${row}${seatsPerRow[i]}`;
            const isOccupied = occupiedSeats.has(seatId);
            const isSelected = appState.selectedSeats.includes(seatId);
            
            // Add aisle after seat C
            if (i === 3) {
                html += '<div class="aisle"></div>';
            }
            
            const seatClass = isOccupied ? 'occupied' : (isSelected ? 'selected' : '');
            const clickHandler = isOccupied ? '' : `onclick="toggleSeat('${seatId}')"`;
            
            html += `<div class="seat ${seatClass}" ${clickHandler}>${seatId}</div>`;
        }
        
        html += '</div>';
    }
    
    elements.seatMap.innerHTML = html;
    updateSeatsDisplay();
}

/**
 * Toggle seat selection
 * @param {string} seatId - ID of the seat to toggle
 */
function toggleSeat(seatId) {
    const index = appState.selectedSeats.indexOf(seatId);
    const maxSeats = appState.passengerCount;
    
    if (index > -1) {
        // Deselect seat
        appState.selectedSeats.splice(index, 1);
    } else if (appState.selectedSeats.length < maxSeats) {
        // Select seat if under limit
        appState.selectedSeats.push(seatId);
    } else {
        // Replace oldest selection
        appState.selectedSeats.shift();
        appState.selectedSeats.push(seatId);
    }
    
    // Update UI
    generateSeatMap();
    updateBookingSummary();
    validateBookingForm();
}

/**
 * Update the selected seats display
 */
function updateSeatsDisplay() {
    const seats = appState.selectedSeats;
    elements.selectedSeatsList.textContent = seats.length > 0 ? seats.join(', ') : 'None';
}

// ============================================
// Booking Summary
// ============================================

/**
 * Update the booking summary section
 */
function updateBookingSummary() {
    const flight = appState.selectedFlight;
    const seats = appState.selectedSeats;
    const passengers = appState.passengerCount;
    
    elements.summaryFlight.textContent = flight ? 
        `${flight.from.code} → ${flight.to.code}` : '--';
    
    elements.summaryPassengers.textContent = passengers;
    
    elements.summarySeats.textContent = seats.length > 0 ? 
        seats.join(', ') : '--';
    
    const total = flight ? flight.price * passengers : 0;
    elements.summaryTotal.textContent = formatPrice(total);
}

// ============================================
// Form Validation
// ============================================

/**
 * Validate the booking form and enable/disable submit button
 */
function validateBookingForm() {
    const hasSelectedFlight = !!appState.selectedFlight;
    const hasSeats = appState.selectedSeats.length === appState.passengerCount;
    const username = document.getElementById('username')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    
    // Check all passenger names
    let allPassengersValid = true;
    for (let i = 1; i <= appState.passengerCount; i++) {
        const firstName = document.getElementById(`passenger-first-${i}`)?.value.trim();
        const lastName = document.getElementById(`passenger-last-${i}`)?.value.trim();
        if (!firstName || !lastName) {
            allPassengersValid = false;
            break;
        }
    }
    
    const isValid = hasSelectedFlight && hasSeats && username && email && allPassengersValid;
    elements.bookBtn.disabled = !isValid;
    
    return isValid;
}

// ============================================
// Booking Submission
// ============================================

/**
 * Handle booking form submission
 * @param {Event} e - Form submit event
 */
async function handleBooking(e) {
    e.preventDefault();
    
    if (!validateBookingForm()) {
        alert('Please complete all required fields.');
        return;
    }
    
    const flight = appState.selectedFlight;
    const bookingRef = generateBookingRef();
    
    // Collect passenger data
    const passengers = [];
    for (let i = 1; i <= appState.passengerCount; i++) {
        passengers.push({
            firstName: document.getElementById(`passenger-first-${i}`).value,
            lastName: document.getElementById(`passenger-last-${i}`).value,
            seat: appState.selectedSeats[i - 1]
        });
    }
    
    // Prepare booking data (ready for API submission)
    const bookingData = {
        bookingRef,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        flight: {
            id: flight.id,
            flightNumber: flight.flightNumber,
            from: flight.from,
            to: flight.to,
            date: elements.dateInput.value
        },
        passengers,
        seats: appState.selectedSeats,
        totalPrice: flight.price * appState.passengerCount,
        bookedAt: new Date().toISOString()
    };
    
    /**
     * API Integration Point
     * Uncomment and modify this section to connect with FastAPI backend
     * 
     * try {
     *     const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.booking}`, {
     *         method: 'POST',
     *         headers: {
     *             'Content-Type': 'application/json'
     *         },
     *         body: JSON.stringify(bookingData)
     *     });
     *     
     *     if (!response.ok) {
     *         throw new Error('Booking failed');
     *     }
     *     
     *     const result = await response.json();
     *     showConfirmation(result);
     * } catch (error) {
     *     console.error('Booking error:', error);
     *     alert('Booking failed. Please try again.');
     * }
     */
    
    // For demo purposes, show confirmation directly
    showConfirmation(bookingData);
}

/**
 * Show booking confirmation modal
 * @param {Object} booking - Booking data object
 */
function showConfirmation(booking) {
    elements.confirmationDetails.innerHTML = `
        <p><strong>Booking Reference:</strong> <span>${booking.bookingRef}</span></p>
        <p><strong>Flight:</strong> <span>${booking.flight.flightNumber}</span></p>
        <p><strong>Route:</strong> <span>${booking.flight.from.city} → ${booking.flight.to.city}</span></p>
        <p><strong>Passengers:</strong> <span>${booking.passengers.length}</span></p>
        <p><strong>Seats:</strong> <span>${booking.seats.join(', ')}</span></p>
        <p><strong>Total:</strong> <span>${formatPrice(booking.totalPrice)}</span></p>
    `;
    
    elements.confirmationModal.classList.remove('hidden');
    
    // Reset form after successful booking
    resetBookingForm();
}

/**
 * Close the confirmation modal
 */
function closeModal() {
    elements.confirmationModal.classList.add('hidden');
}

/**
 * Reset the booking form to initial state
 */
function resetBookingForm() {
    appState.selectedFlight = null;
    appState.selectedSeats = [];
    
    elements.bookingForm.reset();
    elements.selectedFlightDisplay.classList.add('hidden');
    
    renderFlights();
    generateSeatMap();
    updateBookingSummary();
    validateBookingForm();
}

// ============================================
// Navigation & UI Interactions
// ============================================

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    elements.navLinks.classList.toggle('active');
}

/**
 * Handle scroll events for navbar styling
 */
function handleScroll() {
    if (window.scrollY > 50) {
        elements.navbar.classList.add('scrolled');
    } else {
        elements.navbar.classList.remove('scrolled');
    }
}

/**
 * Smooth scroll to section when clicking nav links
 * @param {Event} e - Click event
 */
function handleNavClick(e) {
    if (e.target.tagName === 'A' && e.target.hash) {
        elements.navLinks.classList.remove('active');
    }
}

// ============================================
// API Integration Functions (Ready for FastAPI)
// ============================================

/**
 * Fetch flights from API
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>} Array of flight objects
 */
async function fetchFlights(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.flights}?${queryString}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch flights');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to mock data
        return MOCK_FLIGHTS;
    }
}

/**
 * Submit booking to API
 * @param {Object} bookingData - Booking information
 * @returns {Promise<Object>} Booking confirmation
 */
async function submitBooking(bookingData) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.booking}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            throw new Error('Booking submission failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Booking API Error:', error);
        throw error;
    }
}

// ============================================
// Event Listeners Setup
// ============================================

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Search form
    elements.searchForm.addEventListener('submit', handleSearch);
    elements.swapBtn.addEventListener('click', swapLocations);
    
    // Passenger count change
    elements.passengersSelect.addEventListener('change', () => {
        appState.passengerCount = parseInt(elements.passengersSelect.value);
        updatePassengerForms();
    });
    
    // Booking form
    elements.bookingForm.addEventListener('submit', handleBooking);
    elements.bookingForm.addEventListener('input', validateBookingForm);
    
    // Mobile menu
    elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Nav links
    elements.navLinks.addEventListener('click', handleNavClick);
    
    // Modal overlay click to close
    document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
}

// ============================================
// Application Initialization
// ============================================

/**
 * Initialize the application
 */
function init() {
    // Set minimum date
    setMinDate();
    
    // Initialize event listeners
    initEventListeners();
    
    // Render initial flights
    renderFlights();
    
    // Generate initial seat map
    generateSeatMap();
    
    // Initialize passenger forms
    updatePassengerForms();
    
    // Update booking summary
    updateBookingSummary();
    
    console.log('SkyVoyage Flight Booking App initialized successfully!');
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchFlights,
        submitBooking,
        filterFlights,
        selectFlight,
        toggleSeat,
        validateBookingForm
    };
}


// initial load
loadFlights();
