document.addEventListener('DOMContentLoaded', () => {
    let bundle = [];
    let isBundleAdded = false;
    const BUNDLE_SIZE_FOR_DISCOUNT = 3;
    const DISCOUNT_PERCENTAGE = 0.30;

    const productGrid = document.querySelector('.product-grid');
    const selectedItemsList = document.querySelector('.selected-items-list');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const discountAmountEl = document.querySelector('.discount-amount');
    const subtotalPriceEl = document.querySelector('.subtotal-price');
    const ctaButton = document.querySelector('.cta-button');
    const ctaText = document.querySelector('.cta-text');

    productGrid.addEventListener('click', (event) => {
        const addButton = event.target.closest('.add-button');
        if (addButton) {
            const productCard = addButton.closest('.product-card');
            // UPDATED: Read the new 'product-id' attribute
            toggleProductInBundle(productCard.getAttribute('product-id'));
        }
    });

    selectedItemsList.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const selectedItem = target.closest('.selected-item');
        // UPDATED: Read the new 'product-id' attribute from the sidebar item
        const productId = selectedItem.getAttribute('product-id');
        const action = target.getAttribute('data-action');

        if (action === 'increase') {
            updateQuantity(productId, 1);
        } else if (action === 'decrease') {
            updateQuantity(productId, -1);
        } else if (action === 'remove') {
            toggleProductInBundle(productId);
        }
    });
    
    ctaButton.addEventListener('click', () => {
      if (!ctaButton.disabled) {
        handleAddToCart();
      }
    });

    function handleAddToCart() {
      console.log("Bundle added to cart:", bundle);
      isBundleAdded = true;
      updateCTA();
    }

    function toggleProductInBundle(productId) {
        const productIndex = bundle.findIndex(item => item.id === productId);

        if (productIndex > -1) {
            bundle.splice(productIndex, 1);
        } else {
            // UPDATED: Select the card using the new 'product-id' attribute
            const productCard = document.querySelector(`.product-card[product-id="${productId}"]`);
            // UPDATED: Use getAttribute to read the new attribute names
            bundle.push({
                id: productId,
                name: productCard.getAttribute('product-name'),
                price: parseFloat(productCard.getAttribute('product-price')),
                img: productCard.getAttribute('product-img'),
                quantity: 1
            });
        }
        updateUI();
    }
    
    function updateQuantity(productId, change) {
        const productIndex = bundle.findIndex(item => item.id === productId);
        if (productIndex > -1) {
            bundle[productIndex].quantity += change;
            if (bundle[productIndex].quantity <= 0) {
                bundle.splice(productIndex, 1);
            }
        }
        updateUI();
    }

    function updateUI() {
        renderAddedButtons();
        renderSidebarItems();
        updateProgressBar();
        updateTotals();
        updateCTA();
    }
    
    function renderSidebarItems() {
        selectedItemsList.innerHTML = '';

        bundle.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('selected-item');
            // UPDATED: Set the new 'product-id' attribute on the sidebar item
            itemEl.setAttribute('product-id', item.id);
            
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="selected-item-img">
                <div class="item-details-wrapper">
                    <div class="selected-item-info">
                        <h4 class="selected-item-title">${item.name}</h4>
                        <p class="selected-item-price">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="selected-item-controls">
                        <div class="quantity-stepper">
                            <button class="quantity-btn" data-action="decrease">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-action="increase">+</button>
                        </div>
                        <button class="remove-item-btn" data-action="remove">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;
            selectedItemsList.appendChild(itemEl);
        });

        const placeholdersNeeded = 3 - bundle.length;
        if (placeholdersNeeded > 0) {
            for (let i = 0; i < placeholdersNeeded; i++) {
                const placeholderEl = document.createElement('div');
                placeholderEl.className = 'item-placeholder';
                placeholderEl.innerHTML = `
                    <div class="skeleton skeleton-image"></div>
                    <div class="skeleton-info">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text skeleton-text-short"></div>
                    </div>
                `;
                selectedItemsList.appendChild(placeholderEl);
            }
        }
    }

    function renderAddedButtons() {
        document.querySelectorAll('.product-card').forEach(card => {
            const button = card.querySelector('.add-button');
            const buttonText = button.querySelector('span');
            // UPDATED: Read the new 'product-id' attribute for comparison
            if (bundle.some(item => item.id === card.getAttribute('product-id'))) {
                button.classList.add('added');
                buttonText.textContent = 'Added to Bundle';
            } else {
                button.classList.remove('added');
                buttonText.textContent = 'Add to Bundle';
            }
        });
    }

    function updateProgressBar() {
        const progressPercentage = (bundle.length / BUNDLE_SIZE_FOR_DISCOUNT) * 100;
        progressBarFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    }

    function updateTotals() {
        const rawSubtotal = bundle.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = rawSubtotal * DISCOUNT_PERCENTAGE;
        const finalTotal = rawSubtotal - discountAmount;

        let discountText;
        if (bundle.length > 0) {
            discountText = `-$${discountAmount.toFixed(2)} (30%)`;
        } else {
            discountText = `-$${discountAmount.toFixed(2)}`;
        }

        discountAmountEl.textContent = discountText;
        subtotalPriceEl.textContent = `$${finalTotal.toFixed(2)}`;
    }

    function updateCTA() {
        if (isBundleAdded) {
            ctaText.textContent = 'Added to Cart';
            ctaButton.disabled = true; // Added this line back for correct behavior
            ctaButton.classList.add('added-to-cart');
            return;
        }
        
        ctaButton.classList.remove('added-to-cart');

        const itemsNeeded = BUNDLE_SIZE_FOR_DISCOUNT - bundle.length;

        if (itemsNeeded <= 0) {
            ctaButton.disabled = false;
            ctaText.textContent = 'Add 3 Items to Cart';
        } else {
            ctaButton.disabled = true;
            ctaText.textContent = `Add 3 Items to Proceed`;
        }
    }

    updateUI();
});