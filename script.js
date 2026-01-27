const AUTH_API = 'https://api.everrest.educata.dev/auth/sign_in';
const QUESTION_API = 'https://694d8a31ad0f8c8e6e20ea67.mockapi.io/question';

const cityCoordinates = {
    "athens": [37.9838, 23.7275],
    "santorini": [36.3932, 25.4615],
    "thessaloniki": [40.6401, 22.9444],
    "lefkada": [38.8333, 20.7022],
    "mykonos": [37.4467, 25.3289]
};

window.onload = () => {
    // If admin is already logged in, show dashboard and FETCH questions
    if (sessionStorage.getItem('admin_token')) {
        showDashboard(); 
    }

    // If we are on the About page, fetch the traveler Q&A immediately
    const userQuestionsContainer = document.getElementById('questions-list');
    if (userQuestionsContainer) {
        loadUserQuestions();
    }
};

async function handleLogin() {
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');

    if (!emailEl || !passwordEl) return;

    const email = emailEl.value;
    const password = passwordEl.value;

    try {
        // 1. Send credentials to the real server
        const response = await fetch(AUTH_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        // 2. If the server says OK and gives us a token
        if (response.ok && data.access_token) {
            
            // 3. Check if this specific user is the Admin
            // In a real app, the API might send a "role: admin" field, 
            // but checking the email is a fine solution for now!
            if (email === "admin@gmail.com") {
                sessionStorage.setItem('admin_token', data.access_token);
                showDashboard();
            } else {
                alert("Login successful, but you do not have admin privileges.");
            }
        } else {
            alert("Login failed: " + (data.message || "Invalid credentials"));
        }
    } catch (error) {
        console.error("Connection error:", error);
        alert("Server is offline. Please try again later.");
    }
}
// user-side logic
async function submitQuestion() {
    const username = document.getElementById('user-name').value;
    const question = document.getElementById('user-question').value;

    if (!username || !question) {
        alert("Please fill in both fields.");
        return;
    }

    const newInquiry = {
        username: username,
        question: question,
        adminAnswer: "", // Empty for now
        status: "pending",
        createdAt: new Date().toISOString()
    };

    try {
        const res = await fetch(QUESTION_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInquiry)
        });

        if (res.ok) {
            alert("Question posted! Our experts will answer soon.");
            document.getElementById('user-name').value = '';
            document.getElementById('user-question').value = '';
            loadUserQuestions(); // Refresh the list
        }
    } catch (err) {
        console.error("Error posting question:", err);
    }
}
// 2. Control View State
function showDashboard() {
    const token = sessionStorage.getItem('admin_token');
    if (!token) return;

    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    loadAdminQuestions();
}
async function loadUserQuestions() {
    const res = await fetch(QUESTION_API);
    const data = await res.json();
    const container = document.getElementById('questions-list');

    container.innerHTML = data.map(item => `
        <div class="qa-card" style="border-left: 5px solid #000033; margin-bottom: 20px; padding: 10px;">
            <p><strong>${item.username}:</strong> ${item.question}</p>
            ${item.adminAnswer ? 
                `<p style="margin-left: 20px; color: #555;">
                    <i class="admin-label" style="font-weight: bold; color: #d4af37;">Admin Response:</i> ${item.adminAnswer}
                 </p>` : 
                `<p style="margin-left: 20px; color: #999; font-style: italic;">Awaiting response...</p>`
            }
        </div>
    `).reverse().join('');
}

async function loadAdminQuestions() {
    const container = document.getElementById('admin-questions-list');
    if (!container) return; // Exit if we aren't on the admin page

    container.innerHTML = "Loading inquiries..."; // Feedback for the user

    try {
        const res = await fetch(QUESTION_API);
        const data = await res.json();
        
        if (data.length === 0) {
            container.innerHTML = "<p>No questions found yet.</p>";
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="qa-card">
                <p><strong>User:</strong> ${item.username}</p>
                <p><strong>Q:</strong> ${item.question}</p>
                <div style="margin-top:10px;">
                    <input type="text" id="reply-${item.id}" placeholder="Type answer..." value="${item.adminAnswer || ''}">
                    <button onclick="submitAnswer('${item.id}')">Update</button>
                    <button onclick="deleteQuestion('${item.id}')" style="background:red; color:white;">Delete</button>
                </div>
            </div>
        `).reverse().join('');
    } catch (err) {
        container.innerHTML = "Error loading questions.";
        console.error(err);
    }
}
// Automatically load user questions if the container exists on the page
if (document.getElementById('questions-list')) {
    loadUserQuestions();
}

// 4. Update Answer (PUT)
async function submitAnswer(id) {
    const answer = document.getElementById(`reply-${id}`).value;
    await fetch(`${QUESTION_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminAnswer: answer, status: "answered" })
    });
    alert("Updated!");
    loadAdminQuestions();
}

// 5. Delete Question (DELETE)
async function deleteQuestion(id) {
    if(confirm("Delete permanently?")) {
        await fetch(`${QUESTION_API}/${id}`, { method: 'DELETE' });
        loadAdminQuestions();
    }
}

function handleLogout() {
    sessionStorage.removeItem('admin_token');
    location.reload();
}

// Check if already logged in on page load
window.onload = () => {
    if (sessionStorage.getItem('admin_token')) {
        showDashboard();
    }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////

// variables
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const basketBtn = document.getElementById('basket');
const cartContainer = document.getElementById('cart');
const container = document.getElementById('container-api');
const cartItems = document.getElementById('cart-items-container');


// weather api
const WEATHER_API_KEY = 'e9a4c85944754a6ce0fc0f81e842db69';
// mockapi api
const API_URL = "https://694d8a31ad0f8c8e6e20ea67.mockapi.io/API/1/Destinations";



hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('toggle');
});

document.addEventListener('click', (e) => {
    if (nav.classList.contains('toggle') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('toggle');
    }
});

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader-wrapper');
    const token = localStorage.getItem('token');
    

    updateAuthUI();
    if (document.getElementById('signUpForm')) attachSignUpLogic();
    if (document.getElementById('signInForm')) attachSignInLogic();

    // it only fetches if we are on the Destinations page
    if (container) {
        fetchDestinations();
        initMap();
    }

    // thsi handles cart if cart elements exist on this page
    if (cartItems) {
        if (token) {
            const savedCart = localStorage.getItem('cartItems');
            if (savedCart && savedCart !== '<p>Your cart is empty.</p>') {
                cartItems.innerHTML = savedCart;
                updateCartTotals();
            }
        } else {
            cartItems.innerHTML = '<p>Your cart is empty.</p>';
            updateCartTotals();
        }
    }

    // preloader hide
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 500);
    }
});



function closeAllPopups() {
    const signupOverlay = document.getElementById('popupOverlay');
    const signinOverlay = document.getElementById('signInOverlay');

    if (signupOverlay) signupOverlay.style.display = 'none';
    if (signinOverlay) signinOverlay.style.display = 'none';
}

// Function to create and show the Sign Up Popup
function openSignUpPopup() {
    closeAllPopups();
    const overlay = document.getElementById('popupOverlay');
    overlay.style.display = 'flex';
    // Close functionality
    document.getElementById('closePopup').onclick = () => {
        overlay.style.display = 'none';
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    };

    attachSignUpLogic();

    // Attach the Submit Logic
}


// sign up logic
function attachSignUpLogic() {
    const signUpForm = document.getElementById('signUpForm');
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageDiv = document.getElementById('message');

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            age: parseInt(document.getElementById('age').value),
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            zipcode: document.getElementById('zipcode').value,
            avatar: document.getElementById('avatar').value
        };

        try {
            const response = await fetch('https://api.everrest.educata.dev/auth/sign_up', {
                method: 'POST',
                headers: { 'accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                messageDiv.style.color = 'green';
                messageDiv.innerText = 'Success! You can now Sign In.';
                setTimeout(() => document.getElementById('popupOverlay').remove(), 2000);

            } else {
                messageDiv.style.color = 'red';
                messageDiv.innerText = result.message || 'Registration failed';
                console.error("API ERROR DETAILS:", result);
            }
        } catch (error) {
            messageDiv.innerText = 'Network error.';
            console.error("Fetch Error:", error);
        }
    });
}

function openSignInPopup() {
    // 1. Create the overlay

    closeAllPopups();

    const signinoverlay = document.getElementById('signInOverlay');
    if (!signinoverlay) return;

    signinoverlay.style.display = 'flex';
    document.getElementById('closeSignIn').onclick = () => {
        signinoverlay.style.display = 'none';
    };

    signinoverlay.onclick = (e) => {
        if (e.target === signinoverlay) signinoverlay.style.display = 'none';
        // when sign in is clicked sing up disables

    };


    // 4. Attach Login Logic
    attachSignInLogic();
}

function attachSignInLogic() {
    const signInForm = document.getElementById('signInForm');

    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageDiv = document.getElementById('signInMessage');
        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;

        try {
            const response = await fetch('https://api.everrest.educata.dev/auth/sign_in', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            // Inside attachSignInLogic...
            if (response.ok) {
                localStorage.setItem('token', result.access_token);
                await updateAuthUI();

                messageDiv.style.color = 'green';
                messageDiv.innerText = 'Login successful!';

                setTimeout(() => {
                    document.getElementById('signInOverlay').style.display = 'none';
                    messageDiv.innerText = '';
                    // Clear the form fields
                    signInForm.reset();
                }, 1000);

            } else {
                messageDiv.style.color = 'red';
                messageDiv.innerText = result.message || 'Email or password is incorrect.';
            }
        } catch (error) {
            messageDiv.style.color = 'red';
            messageDiv.innerText = 'Connection error.';
        }
    });
}


async function updateAuthUI() {
    const token = localStorage.getItem('token');
    const authLinks = document.getElementById('auth-links');
    const userProfile = document.getElementById('user-profile');
    const userNameSpan = document.getElementById('user-name');

    if (!authLinks || !userProfile || !userNameSpan) return;

    if (!token) {
        authLinks.style.display = 'flex';
        userProfile.style.display = 'none';
        userNameSpan.innerText = "";
        return;
    }

    authLinks.style.display = 'none';
    userProfile.style.display = 'flex';
    userNameSpan.innerText = "LOADING...";

    try {
        const response = await fetch('https://api.everrest.educata.dev/auth/user', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log("User Data Received:", userData);

            // Safety check: Use a fallback if firstName is missing
            const name = userData.firstName || "Traveler";
            userNameSpan.innerText = name.toUpperCase();
        } else {
            // If the status is 401 (Unauthorized), the token is bad
            if (response.status === 401) {
                signOut();
            } else {
                userNameSpan.innerText = "TRAVELER";
            }
        }
    } catch (error) {
        console.error("Auth fetch failed:", error);
        userNameSpan.innerText = "OFFLINE";
    }
}

function signOut() {
    // 1. Clear Data
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');

    // 2. Reset Cart UI immediately
    if (cartItems) cartItems.innerHTML = '<p>Your cart is empty.</p>';
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    if (cartCount) cartCount.innerText = '0';
    if (cartTotal) cartTotal.innerText = 'Total: $0.00';

    // remove favourites
    const favBtns = document.querySelectorAll('.fav-btn');
    favBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('data-featured', 'false');
    });


    // 3. Reset Auth UI
    updateAuthUI();
}


function renderDestinations(data) {
    container.innerHTML = '';
    data.forEach(dest => {
        const weatherId = `weather-${dest.city.replace(/\s+/g, '-')}`;

        // Create the list of included items safely
        // We check if included exists and is an array before mapping
        const includedItems = Array.isArray(dest.included)
            ? dest.included.map(item => `<li>${item}</li>`).join('')
            : '<li>Standard travel package</li>';

        const destDiv = document.createElement('div');
        destDiv.className = 'destination-item';

        destDiv.innerHTML = `
    <div class="fav-container" style="position: absolute; right: 10px; top: 10px;">
        </div>

    <img src="${dest.image}" alt="${dest.city}" class="dest-img" loading="lazy">
    
    <div class="card-body">
        <h3>${dest.city}</h3>
        
        <div class="weather-container">
            <div id="${weatherId}"></div>
        </div>
        <span class="fav-btn ${dest.isFeatured ? 'active' : ''}" 
      data-id="${dest.id}" 
      data-featured="${dest.isFeatured}">
  <svg class="heart-icon" viewBox="0 0 24 24">
    <path d="M12 21s-6.716-5.402-9.33-8.017C.6 10.91.384 7.733 2.322 5.804 4.26 3.875 7.3 3.875 9.238 5.804L12 8.566l2.762-2.762c1.938-1.929 4.978-1.929 6.916 0 1.938 1.929 1.722 5.106-.348 7.179C18.716 15.598 12 21 12 21z"/>
  </svg>
</span>

        <p class="duration"><strong>${dest.days}</strong></p>

        <div class="included-box">
            <ul>${includedItems}</ul>
        </div>
        
        <div class="card-footer">
            <h2 class="price">$${dest.price}</h2>
            <button class="add-btn">Book Now</button>
        </div>
    </div>
`;

        container.appendChild(destDiv);
        getWeather(dest.city, weatherId);
    });
}


// using put method to add des to favorites
async function updateFavoriteQuietly(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFeatured: newStatus })
        });

        if (!response.ok) {
            fetchDestinations();
            alert("Could not save favorite. Please try again.");
        }
    } catch (error) {
        console.error('Error updating favorite:', error);
        fetchDestinations();
    }
}

// fetch destinations from api
async function fetchDestinations() {
    try {
        const response = await fetch(API_URL);
        const destinations = await response.json();
        renderDestinations(destinations);

        // Add markers to the map for each destination
        destinations.forEach(dest => {
            const cityKey = dest.city.toLowerCase();
            const coords = cityCoordinates[cityKey];

            if (coords) {
                const marker = L.marker(coords).addTo(myMap);
                marker.bindPopup(`<b>${dest.city}</b><br>$${dest.price}`);
                
                // Save marker to our global array for searching
                mapMarkers.push({ name: cityKey, layer: marker, coords: coords });
            }
        });
    } catch (error) {
        console.error('Error fetching destinations:', error);
    }
}


// shopping cart
basketBtn.addEventListener('click', () => {
    cartContainer.classList.toggle('active');
});

// Check if user is logged in pop up if its not
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        openSignInPopup();
        return false;
    }
    return true;
}


// Favorite Logic

function handleFavoriteToggle(favBtn) {
    if (!checkAuth()) return;

    const id = favBtn.getAttribute('data-id');
    const currentStatus = favBtn.getAttribute('data-featured') === 'true';
    const newStatus = !currentStatus;

    favBtn.classList.toggle('active', newStatus);
    favBtn.setAttribute('data-featured', newStatus);

    updateFavoriteQuietly(id, newStatus);
}

// cart logic adding to xard
function handleAddToCart(button) {
    if (!checkAuth()) return;

    //findinf parent card
    const mainCard = button.closest('.destination-item');

    // find the data inside that specific card
    const title = mainCard.querySelector('h3').textContent.trim();
    const priceText = mainCard.querySelector('.price').textContent;
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    const cartBox = document.getElementById('cart-items-container');

    // Look for existing item
    const currentItems = Array.from(cartBox.querySelectorAll('.cart-item'));
    const existingItem = currentItems.find(row => row.querySelector('h3').textContent === title);

    if (existingItem) {
        existingItem.querySelector('.plus').click();
    } else {
        if (cartBox.innerText.includes('empty')) cartBox.innerHTML = '';

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <h3>${title}</h3>
                <div class="qty-controls">
                    <button class="qty-btn minus">-</button>
                    <span class="qty">1</span>
                    <button class="qty-btn plus">+</button>
                    <small>x Person</small>
                </div>
            </div>
            <h2  data-price="${price}">$${price}</h2>
            <span class="remove-item">&times;</span>
        `;

        cartBox.appendChild(div);
        updateCartTotals();
        document.getElementById('cart').classList.add('active');
    }
}

// container event listener
container.addEventListener('click', (event) => {
    const target = event.target;

    // fav btn
    const favBtn = target.closest('.fav-btn');
    if (favBtn) {
        handleFavoriteToggle(favBtn);
        return;
    }

    // add card
    if (target.classList.contains('add-btn')) {
        handleAddToCart(target);
        return;
    }
});


// quantity buttons adding and subtracting
cartItems.addEventListener('click', function (event) {
    const target = event.target;
    // check if qty button was clicked
    if (!target.classList.contains('qty-btn')) return;

    // selecting number as parent element of the button
    const qtySpan = target.parentElement.querySelector('.qty');
    let currentQty = parseInt(qtySpan.innerText);

    if (target.classList.contains('plus')) {
        // Adding Plus to parent number of the btn
        currentQty++;
    } else if (target.classList.contains('minus')) {
        // if user clicks minus, we check if qty is more than 1 and subtract
        if (currentQty > 1) {
            currentQty--;
        }

    }

    // update the quantity 
    qtySpan.innerText = currentQty;
    // calculate totals after the price change
    updateCartTotals();
});


// calculate totals function
function updateCartTotals() {
    let totalMoney = 0;
    let totalCount = 0;


    document.querySelectorAll('.cart-item').forEach(item => {
        const qty = parseInt(item.querySelector('.qty').innerText);
        const price = parseFloat(item.querySelector('h2').dataset.price);

        totalMoney += (qty * price);
        totalCount += qty;
    });


    // display totals
    const totalDisplay = document.getElementById('cart-total');
    const countDisplay = document.getElementById('cart-count');
    if (totalDisplay) totalDisplay.innerText = `Total: $${totalMoney.toFixed(2)}`;
    if (countDisplay) countDisplay.innerText = totalCount;
}
updateCartTotals();


// 4. remove item from cart
document.getElementById('cart-items-container').addEventListener('click', function (event) {
    const target = event.target;
    if (!target.classList.contains('remove-item')) return;
    target.parentElement.remove();
    updateCartTotals();
    // If cart is empty, show  message cart is emptuy
    const cartBox = document.getElementById('cart-items-container');
    if (cartBox.children.length === 0) {
        cartBox.innerHTML = '<p>Your cart is empty.</p>';
    }
});

// weather fetching function
async function getWeather(city, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const weatherDesc = data.weather[0].icon;

        element.innerHTML = `
      <img src="https://openweathermap.org/img/wn/${weatherDesc}.png" alt="Weather Icon">
      <span>${temp}°C</span>
    `;

    } catch (error) {
        console.error('Error fetching weather data:', error);
        element.innerText = 'N/A';
    }

}

// closing cart when clicked outside
document.addEventListener('click', function (event) {
const isClickInside = cartContainer.contains(event.target) || basketBtn.contains(event.target);
    
    // Check if the user clicked the "remove" X button
    const isRemoveClick = event.target.classList.contains('remove-item');

    // Only hide the cart if the click was outside AND NOT on a remove button
    if (!isClickInside && !isRemoveClick) {
        cartContainer.classList.remove('active');
    }

});

// save cart to local storage (optional enhancement)
window.addEventListener('beforeunload', () => {
    localStorage.setItem('cartItems', cartItems.innerHTML);
});


// search bar for destinations
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', function () {
        const filter = searchInput.value.toLowerCase();
        const destinationItems = container.getElementsByClassName('destination-item');
        Array.from(destinationItems).forEach(item => {
            const city = item.querySelector('h3').innerText.toLowerCase();
            if (city.includes(filter)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// sorting based on price name etc
const sortSelect = document.getElementById('sort-select');
sortSelect.addEventListener('change', function () {
    const sortValue = sortSelect.value;
    const destinationItems = Array.from(container.getElementsByClassName('destination-item'));

    destinationItems.sort((a, b) => {
        const nameA = a.querySelector('h3').innerText.toLowerCase();
        const nameB = b.querySelector('h3').innerText.toLowerCase();
        const priceA = parseFloat(a.querySelector('.price').innerText.replace(/[^0-9.]/g, ''));
        const priceB = parseFloat(b.querySelector('.price').innerText.replace(/[^0-9.]/g, ''));

        if (sortValue === 'name-asc') {
            return nameA.localeCompare(nameB);
        } else if (sortValue === 'name-desc') {
            return nameB.localeCompare(nameA);
        } else if (sortValue === 'price-asc') {
            return priceA - priceB;
        } else if (sortValue === 'price-desc') {
            return priceB - priceA;
        }
        return 0;
    });

    // Clear existing items and append sorted ones
    container.innerHTML = '';
    destinationItems.forEach(item => container.appendChild(item));
});

// Add this to your window.onload or with your other event listeners
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
}

function handleCheckout() {
    const cartBox = document.getElementById('cart-items-container');
    
    // 1. Check if the cart is empty
    if (cartBox.children.length === 0 || cartBox.innerText.includes('empty')) {
        alert("Your cart is empty! Choose a destination first.");
        return;
    }

    // 2. Mock a processing delay (Looks more professional)
    const originalText = checkoutBtn.innerText;
    checkoutBtn.innerText = "Processing Odyssey...";
    checkoutBtn.disabled = true;

    setTimeout(() => {
        // 3. Success Feedback
        alert("Pack your bags! Your Greek Odyssey has been booked successfully.");

        // 4. Clear the Cart Data
        cartBox.innerHTML = '<p>Your cart is empty.</p>';
        localStorage.removeItem('cartItems'); // Clear saved storage
        
        // 5. Update UI
        updateCartTotals();
        document.getElementById('cart').classList.remove('active');
        
        // 6. Reset Button
        checkoutBtn.innerText = originalText;
        checkoutBtn.disabled = false;
    }, 1500);
}

let mapMarkers = []; // Global array to store markers
let myMap;

function initMap() {
    const greeceCenter = [38.5, 23.5]; 
    myMap = L.map('map').setView(greeceCenter, 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(myMap);
}

// Update your render function to create markers with names
function addMarkerToMap(city, lat, lng) {
    const marker = L.marker([lat, lng]).addTo(myMap);
    marker.bindPopup(`<b>${city}</b>`);
    
    // Store the city name and marker object together
    mapMarkers.push({ name: city.toLowerCase(), layer: marker });
}

searchInput.addEventListener('input', function () {
    const filter = searchInput.value.toLowerCase();
    
    // Your existing card filtering logic
    const destinationItems = container.getElementsByClassName('destination-item');
    Array.from(destinationItems).forEach(item => {
        const city = item.querySelector('h3').innerText.toLowerCase();
        item.style.display = city.includes(filter) ? '' : 'none';
    });

    // NEW: Map Search Logic
    const matchedMarker = mapMarkers.find(m => m.name.includes(filter));
    
    if (matchedMarker && filter.length > 2) {
        // "Fly" to the city and open its popup
        myMap.flyTo(matchedMarker.layer.getLatLng(), 6);
        matchedMarker.layer.openPopup();
    } else if (filter.length === 0) {
        // Reset view to all of Greece if search is cleared
        myMap.setView([39.0742, 21.8243], 6);
    }
});


// Inside your window.onload or with your other event listeners
const closeCartBtn = document.getElementById('close-cart');

if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
        document.getElementById('cart').classList.remove('active');
    });
}
