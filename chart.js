document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Fetch cart data from API
    const fetchCartData = async () => {
        try {
            const response = await fetch('https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889');
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart data:', error);
            cartItemsContainer.innerHTML = `<div class="error">Failed to load cart. Please try again later.</div>`;
            return null;
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount / 100);
    };

    // Render cart items
    const renderCart = (data) => {
        if (!data?.items?.length) {
            cartItemsContainer.innerHTML = `<div class="error">Your cart is empty</div>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'cart-table';
        
        // Table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                 <th style="background-color: #F9F1E7;">Product</th>
                  <th style="background-color: #F9F1E7;">Price</th>
                  <th style="background-color: #F9F1E7;">Quantity</th>
                  <th style="background-color: #F9F1E7;">Subtotal</th>
                  <th style="background-color: #F9F1E7;">Action</th>
            </tr>
        `;
        
        // Table body
        const tbody = document.createElement('tbody');
        data.items.forEach(item => {
            const tr = document.createElement('tr');
            
            // Clean image URL
            const cleanImageUrl = item.image.replace(/[<>]/g, '');

            tr.innerHTML = `
                <td data-label="Product">
                    <div class="product-cell">
                        <img src="${cleanImageUrl}" alt="${item.title}">
                        <div>
                            <h3>${item.title}</h3>
                            <p>${item.product_description || ''}</p>
                        </div>
                    </div>
                </td>
                <td data-label="Price">${formatCurrency(item.price)}</td>
                <td data-label="Quantity">
                    <input type="number" 
                           class="quantity-input" 
                           value="${item.quantity}" 
                           min="1"
                           data-id="${item.id}">
                </td>
                <td data-label="Subtotal">${formatCurrency(item.line_price)}</td>
                <td data-label="Action">
                    <button class="remove-btn" data-id="${item.id}">🗑️</button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        cartItemsContainer.innerHTML = '';
        cartItemsContainer.appendChild(table);

        // Add event listeners
        addQuantityListeners();
        addRemoveListeners();
        updateTotals(data);
    };

    // Update totals
    const updateTotals = (data) => {
        const subtotal = data.items.reduce((acc, item) => acc + item.line_price, 0);
        document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('cart-total').textContent = formatCurrency(subtotal);
    };

    // Quantity change handler
    const addQuantityListeners = () => {
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', async (e) => {
                const newQuantity = parseInt(e.target.value);
                if (newQuantity < 1) return;

                // Here you would normally make an API call to update quantity
                const itemId = e.target.dataset.id;
                const data = await fetchCartData();
                if (data) {
                    const item = data.items.find(i => i.id == itemId);
                    if (item) {
                        item.quantity = newQuantity;
                        item.line_price = item.price * newQuantity;
                        renderCart(data);
                    }
                }
            });
        });
    };

    // Remove item handler
    const addRemoveListeners = () => {
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const itemId = e.target.dataset.id;
                const data = await fetchCartData();
                if (data) {
                    data.items = data.items.filter(i => i.id != itemId);
                    renderCart(data);
                }
            });
        });
    };

    // Checkout handler
    checkoutBtn.addEventListener('click', () => {
        alert('Redirecting to checkout...');
        // Add actual checkout logic here
    });

    // Initialize
    (async () => {
        const data = await fetchCartData();
        if (data) renderCart(data);
    })();
});