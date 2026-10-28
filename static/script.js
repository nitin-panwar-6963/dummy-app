
const products = [
    { id: 1, name: "Classic Vanilla Macaron", price: 80, symbol: "🍥" },
    { id: 2, name: "Caramel Macaron", price: 90, symbol: "🧁" },
    { id: 3, name: "Raspberry Macaron", price: 85, symbol: "🍓" },
    { id: 4, name: "Pistachio Macaron", price: 95, symbol: "🍵" },
    { id: 5, name: "Chocolate Chip Cookie", price: 70, symbol: "🍪" },
    { id: 6, name: "Lemon Scone", price: 75, symbol: "🍋" }
];

let cart = [];

const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");
const checkoutStatus = document.getElementById("checkout-status");

function renderProducts() {
    productList.innerHTML = products.map(product => `
        <article class="product-card">
            <div class="product-symbol" aria-hidden="true">
                ${product.symbol}
            </div>
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <button class="primary-button"
                    type="button"
                    data-product-id="${product.id}">
                Add to Cart
            </button>
        </article>
    `).join("");
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    checkoutStatus.textContent = "";
    checkoutStatus.className = "checkout-status";

    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span>
                    ${item.name} × ${item.quantity}
                </span>
                <span>
                    ₹${item.price * item.quantity}
                    <button type="button"
                            data-remove-id="${item.id}">
                        Remove
                    </button>
                </span>
            </div>
        `).join("");
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    cartTotal.textContent = `₹${total}`;
    checkoutButton.disabled = cart.length === 0;
}

productList.addEventListener("click", event => {
    const button = event.target.closest("[data-product-id]");
    if (!button) return;

    addToCart(Number(button.dataset.productId));
});

cartItems.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;

    removeFromCart(Number(button.dataset.removeId));
});

checkoutButton.addEventListener("click", async () => {
    if (cart.length === 0) {
        checkoutStatus.textContent = "Please add an item first.";
        checkoutStatus.className = "checkout-status error";
        return;
    }

    checkoutButton.disabled = true;
    checkoutButton.textContent = "Processing Checkout...";
    checkoutStatus.textContent = "";

    try {
        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ items: cart })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                `${result.message} Request ID: ${result.request_id}`
            );
        }

        checkoutStatus.textContent = result.message;
        checkoutStatus.className = "checkout-status success";
        cart = [];
        renderCart();

    } catch (error) {
        checkoutStatus.textContent = error.message;
        checkoutStatus.className = "checkout-status error";
        console.error("Checkout error:", error);

    } finally {
        checkoutButton.textContent = "Proceed to Checkout";
        checkoutButton.disabled = cart.length === 0;
    }
});

renderProducts();
renderCart();

