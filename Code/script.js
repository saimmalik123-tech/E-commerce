// NAVBAR TOGGLE
const bars = document.querySelector('.fa-bars, .fa-xmark');
const searchDiv = document.querySelector('.SearchDiv');

if (bars) {
    bars.addEventListener('click', () => {
        if (bars.classList.contains('fa-bars')) {
            bars.classList.remove('fa-bars');
            bars.classList.add('fa-xmark');
        } else {
            bars.classList.remove('fa-xmark');
            bars.classList.add('fa-bars');
        }
        searchDiv.classList.toggle('active');
    });
}

// UPDATE CART BADGE COUNT
function updateCartBadge() {
    const cartBadge = document.querySelector('.cart-badge');
    const count = Number(localStorage.getItem('cartCount')) || 0;
    if (cartBadge) cartBadge.innerText = count;
}

// UPDATE CART SUMMARY SECTION
function updateCartSummary() {
    const totalItems = Number(localStorage.getItem('cartCount')) || 0;
    const totalPrice = Number(localStorage.getItem('cartTotal')) || 0;

    const itemsElem = document.querySelector('#total-items');
    const priceElem = document.querySelector('#total-price');
    if (itemsElem) itemsElem.innerText = totalItems;
    if (priceElem) priceElem.innerText = `$${totalPrice.toFixed(2)}`;

    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) cartBadge.innerText = totalItems;
}

// SAVE TO STORAGE FUNCTION
function saveCartToStorage(cartItems) {
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartCount', totalCount);
    localStorage.setItem('cartTotal', totalPrice.toFixed(2));

    updateCartBadge();
    updateCartSummary();
}

// LOAD PRODUCTS ON HOMEPAGE
async function loopingProduct() {
    const container = document.querySelector('.product-container');
    if (!container) return;

    try {
        const res = await fetch('https://fakestoreapi.com/products');
        const products = await res.json();

        container.innerHTML = '';
        products.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <a href="./Code/product.html?id=${item.id}">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="card-content">
                        <h3 class="title">${item.title.length > 40 ? item.title.slice(0, 37) + '...' : item.title}</h3>
                        <p class="price">$${item.price.toFixed(2)}</p>
                        <p class="rating">⭐ ${item.rating.rate} (${item.rating.count})</p>
                    </div>
                </a>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<p>⚠️ Failed to load products.</p>';
        console.error(error);
    }
}

// PRODUCT DETAIL PAGE
async function productPage() {
    const wrapper = document.querySelector('.page-wrapper');
    if (!wrapper) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    try {
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        const product = await res.json();

        wrapper.innerHTML = `
            <div class="product-preview-section">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" />
                </div>
                <div class="product-info-container">
                    <h1 class="product-name">${product.title}</h1>
                    <p class="product-rating">⭐ ${product.rating.rate} (${product.rating.count})</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>

                    <div class="quantity-select">
                        <label for="qty">Quantity:</label>
                        <input type="number" id="qty" min="1" value="1" />
                    </div>

                    <p class="product-description">${product.description}</p>

                    <div class="action-buttons">
                        <button class="btn-cart">🛒 Add to Cart</button>
                        <button class="btn-buy">⚡ Buy Now</button>
                    </div>
                </div>
            </div>
        `;

        addToCart(product);

        // BUY NOW BUTTON
        const buyBtn = document.querySelector('.btn-buy');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                alert("🔔 Buy Now functionality coming soon!");
                // window.location.href = "./cart.html"; // optional
            });
        }
    } catch (error) {
        wrapper.innerHTML = `<p>⚠️ Failed to load product details.</p>`;
        console.error(error);
    }
}

// ADD TO CART
function addToCart(product) {
    const cartBtn = document.querySelector('.btn-cart');
    if (!cartBtn) return;

    cartBtn.addEventListener('click', () => {
        const qty = Math.max(1, Number(document.getElementById('qty').value));
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const index = cartItems.findIndex(item => item.id === product.id);

        if (index !== -1) {
            cartItems[index].quantity += qty;
        } else {
            cartItems.push({
                id: product.id,
                title: product.title,
                image: product.image,
                price: product.price,
                quantity: qty,
                rating: product.rating
            });
        }

        saveCartToStorage(cartItems);
        alert("✅ Product added to cart!");
    });
}

function displayCartProducts() {
    const productDetail = document.querySelector('.product-detail');
    if (!productDetail) return;

    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    productDetail.innerHTML = '';

    if (cartItems.length === 0) {
        productDetail.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cartItems.forEach(item => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <div class="product-image">
                <img class="product-img" src="${item.image}" alt="${item.title}" />
            </div>
            <div class="product-info">
                <h1 class="product-title">${item.title}</h1>
                <p class="price">$${item.price.toFixed(2)}</p>
                <p class="rating">⭐ ${item.rating.rate} (${item.rating.count})</p>
                <p class="quantity">Quantity: ${item.quantity}</p>
                <p class="total">Total: $${(item.price * item.quantity).toFixed(2)}</p>
                <button class="btn-primary delete-btn" data-id="${item.id}">Delete</button>
            </div>
        `;
        productDetail.appendChild(productCard);
    });

    // DELETE BUTTON FUNCTIONALITY
    const deleteButtons = productDetail.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            deleteFromCart(id);
        });
    });
}

function deleteFromCart(productId) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCartToStorage(cartItems);
    displayCartProducts();
}

function searchFilter() {
    const searchInput = document.querySelector('.searcch');
    const value = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.product-container .card');

    cards.forEach(card => {
        const title = card.querySelector('.title').innerText.toLowerCase();
        card.style.display = title.includes(value) ? 'block' : 'none';
    });
}

updateCartBadge();
updateCartSummary();
loopingProduct();
productPage();
displayCartProducts();
