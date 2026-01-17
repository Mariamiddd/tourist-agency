// weather api
const WEATHER_API_KEY = 'e9a4c85944754a6ce0fc0f81e842db69';
// mockapi api
const API_URL = "https://694d8a31ad0f8c8e6e20ea67.mockapi.io/API/1/Destinations";

// ------------------------------------------------------------------   
// რეგისტრაციის ფუნქცია (POST)
function closeAllPopups() {
    const signupOverlay = document.getElementById('popupOverlay');
    const signinOverlay = document.getElementById('signInOverlay');
    
    if (signupOverlay) signupOverlay.style.display = 'none';
    if (signinOverlay) signinOverlay.style.display = 'none';
}
// 1. Function to create and show the Sign Up Popup
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

// 2. The Logic (modified from your code)
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

    // 3. Reset Auth UI
    updateAuthUI();
}

// ------------------------------  DOM ELEMENTS  ----------------------------------


// variables
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const basketBtn = document.getElementById('basket');
const cartContainer = document.getElementById('cart');
const container = document.getElementById('container_api');
const cartItems = document.getElementById('cart-items-container');


hamburger.addEventListener('click', () => {
    nav.classList.toggle('toggle');
});

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader-wrapper');
    const token = localStorage.getItem('token');

    // Always run these - they handle their own internal safety checks
    updateAuthUI();
    if (document.getElementById('signUpForm')) attachSignUpLogic();
    if (document.getElementById('signInForm')) attachSignInLogic();

    // ONLY fetch if we are on the Destinations page
    if (container) {
        fetchDestinations();
    }

    // ONLY handle cart if cart elements exist on this page
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

    // Hide preloader last
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 500);
    }
});
// render destinations function. 
// !!!!!!ჭირდება გამარტივება ფუნქციას და დაყოოფა ნაწილებად!!!!
function renderDestinations(data) {
    container.innerHTML = '';
    data.forEach(dest => {
        const weatherId = `weather-${dest.city.replace(/\s+/g, '-')}`;

        const destDiv = document.createElement('div');
        destDiv.className = 'destination-item';
        destDiv.innerHTML = `
            <div class="fav-container" style="text-align: right; cursor: pointer;">
<span class="fav-btn ${dest.isFeatured ? 'active' : ''}" 
      data-id="${dest.id}" 
      data-featured="${dest.isFeatured}">
  <svg class="heart-icon" viewBox="0 0 24 24">
    <path d="M12 21s-6.716-5.402-9.33-8.017C.6 10.91.384 7.733 2.322 5.804 4.26 3.875 7.3 3.875 9.238 5.804L12 8.566l2.762-2.762c1.938-1.929 4.978-1.929 6.916 0 1.938 1.929 1.722 5.106-.348 7.179C18.716 15.598 12 21 12 21z"/>
  </svg>
</span>
            </div>
            <h3>${dest.city}</h3>
            <div class="weather-container">
                <div id="${weatherId}"></div>
            </div>
            <p>${dest.description}</p>
            <span>Duration: ${dest.days} days</span>
            <img src="${dest.image}" alt="${dest.city}" width="300">
            <h2>Price: $${dest.price}</h2>
            <button class="add-btn">Add to Cart</button>
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
        console.log(destinations);
    } catch (error) {
        console.error('Error fetching destinations:', error);
    }

}


// shopping cart
basketBtn.addEventListener('click', () => {
    cartContainer.classList.toggle('active');
});
// add to cart and to favourites
container.addEventListener('click', function (event) {

    // 1. LOGIC FOR FAVORITES (Check this first)
    const favBtn = event.target.closest('.fav-btn');
    if (favBtn) {
        const token = localStorage.getItem('token');
        if (!token) {
            openSignInPopup();
            return; // Stop here if not logged in
        }

        const id = favBtn.getAttribute('data-id');
        const currentStatus = favBtn.getAttribute('data-featured') === 'true';
        const newStatus = !currentStatus;

        favBtn.classList.toggle('active', newStatus);
        favBtn.setAttribute('data-featured', newStatus);

        updateFavoriteQuietly(id, newStatus);
        return; // Exit after handling favorite
    }

    // 2. LOGIC FOR ADD TO CART (Separate IF block)
    if (event.target.tagName === 'BUTTON' && event.target.classList.contains('add-btn')) {
        const token = localStorage.getItem('token');
        if (!token) {
            openSignInPopup();
            return;
        }

        const button = event.target;
        const item = button.parentElement;
        const title = item.querySelector('h3').textContent.trim();
        const priceText = item.querySelector('h2').textContent;
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        const cartBox = document.getElementById('cart-items-container');

        let existingItem = null;
        const currentItems = cartBox.querySelectorAll('.cart-item');
        currentItems.forEach(row => {
            if (row.querySelector('h3').textContent === title) existingItem = row;
        });

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
                <h2 data-price="${price}">$${price}</h2>
                <span class="remove-item">&times;</span>
            `;
            cartBox.appendChild(div);
            updateCartTotals();
            document.getElementById('cart').classList.add('active');
        }
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
    if (!isClickInside) {
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