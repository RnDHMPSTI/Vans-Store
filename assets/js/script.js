// script.js
document.addEventListener('DOMContentLoaded', function () {
    // Fungsi untuk melakukan pencarian
    function performSearch(searchTerm) {
        // Konversi ke lowercase untuk pencarian case-insensitive
        searchTerm = searchTerm.toLowerCase().trim();

        // Dapatkan semua card produk
        const productCards = document.querySelectorAll('.card');
        let foundResults = false;

        // Loop melalui setiap card produk
        productCards.forEach(card => {
            const productName = card.querySelector('.card-title').textContent.toLowerCase();
            const productDesc = card.querySelector('.card-text:not(.fst-italic)') ?
                card.querySelector('.card-text:not(.fst-italic)').textContent.toLowerCase() : '';

            // Cek apakah produk cocok dengan kata kunci
            if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
                card.style.display = 'block';
                foundResults = true;
            } else {
                card.style.display = 'none';
            }
        });

        // Tampilkan pesan jika tidak ada hasil
        if (!foundResults && searchTerm !== '') {
            const noResults = document.createElement('div');
            noResults.className = 'alert alert-info mt-3';
            noResults.textContent = 'Produk tidak ditemukan. Coba kata kunci lain.';

            // Hapus pesan sebelumnya jika ada
            const existingAlert = document.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }

            // Tambahkan pesan ke container produk
            const productContainer = document.querySelector('.cp') || document.querySelector('.container.mt-3');
            productContainer.appendChild(noResults);
        } else {
            // Hapus pesan jika ada hasil
            const existingAlert = document.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }
        }
    }

    // Tambahkan event listener untuk form pencarian di semua halaman
    const searchForms = document.querySelectorAll('form.d-flex');

    searchForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="search"]');
            performSearch(searchInput.value);
        });
    });

    // Tambahkan event listener untuk input pencarian (search saat mengetik)
    const searchInputs = document.querySelectorAll('input[type="search"]');

    searchInputs.forEach(input => {
        input.addEventListener('input', function () {
            performSearch(this.value);
        });

        // Reset pencarian saat input dikosongkan
        input.addEventListener('change', function () {
            if (this.value.trim() === '') {
                const productCards = document.querySelectorAll('.card');
                productCards.forEach(card => {
                    card.style.display = 'block';
                });

                const existingAlert = document.querySelector('.alert');
                if (existingAlert) {
                    existingAlert.remove();
                }
            }
        });
    });
});

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function addToCart(productName, productPrice, productImage) {
    // Check if product already in cart
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show confirmation
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    document.getElementById('confirmationMessage').textContent = `${productName} telah ditambahkan ke keranjang!`;
    confirmationModal.show();
}

function renderCartItems() {
    const cartItemsElement = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p class="text-center">Keranjang belanja kosong</p>';
        cartTotalElement.textContent = 'Rp 0';
        return;
    }

    let itemsHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        itemsHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h6>${item.name}</h6>
                    <div class="d-flex justify-content-between">
                        <span>Rp ${item.price.toLocaleString()}</span>
                        <span>Qty: ${item.quantity}</span>
                    </div>
                </div>
                <span class="cart-item-price">Rp ${itemTotal.toLocaleString()}</span>
                <span class="cart-item-remove" data-index="${index}"><i class="fas fa-trash"></i></span>
            </div>
        `;
    });

    cartItemsElement.innerHTML = itemsHTML;
    cartTotalElement.textContent = `Rp ${total.toLocaleString()}`;

    // Add event listeners to remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        });
    });
}

// Initialize cart
updateCartCount();

// Cart button click event
document.getElementById('cartButton')?.addEventListener('click', function (e) {
    e.preventDefault();
    renderCartItems();
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
});

// Checkout button click event
document.getElementById('checkoutButton')?.addEventListener('click', function () {
    alert('Terima kasih telah berbelanja di VansStore!');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
});

// Add to cart button event listeners
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
        const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
        const productName = button.getAttribute('data-name');
        const productPrice = parseInt(button.getAttribute('data-price'));
        const productImage = button.getAttribute('data-image');

        addToCart(productName, productPrice, productImage);
    }
});