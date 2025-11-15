function readCart() {
   try {
      return JSON.parse(localStorage.getItem("cart")) || [];
   } catch (error) {
      console.error("Unable to parse cart data", error);
      return [];
   }
}

function writeCart(cart) {
   localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
   const cart = readCart();
   const container = document.getElementById("cart-container");
   if (!container) {
      return;
   }

   if (!cart.length) {
      container.innerHTML = `
			<div class="cart-empty">
				<h2>Your Cart is Empty</h2>
				<p>Add some delicious items from the menu to get started!</p>
				<a href="menu.html" class="empty-cart-btn">Go to Menu</a>
			</div>
		`;
      return;
   }

   let total = 0;
   const rows = cart
      .map((item, index) => {
         const subtotal = item.price * item.quantity;
         total += subtotal;
         return `
			<div class="cart-item">
				<div class="item-details">
					<div class="item-name">${item.name}</div>
					<div class="item-price">Price: ৳${item.price}</div>
				</div>
				<div class="quantity-controls">
					<button class="qty-btn" data-index="${index}" data-delta="-1">-</button>
					<span class="qty-number">${item.quantity}</span>
					<button class="qty-btn" data-index="${index}" data-delta="1">+</button>
				</div>
				<div class="subtotal">Subtotal: ৳${subtotal}</div>
				<button class="remove-btn" data-index="${index}">Remove</button>
			</div>
		`;
      })
      .join("");

   container.innerHTML = `
		<div class="cart-items">
			<h2 class="section-title">Selected Items</h2>
			${rows}
		</div>
		<div class="total-section">
			<div>Total Price: <span class="total-price" id="total-price">৳${total}</span></div>
			<div class="cart-actions">
				<button class="clear-btn" id="clear-cart-btn">Clear Cart</button>
				<a href="login.html" class="order-link">Place Order</a>
			</div>
		</div>
	`;

   container.querySelectorAll(".qty-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
         const { index, delta } = event.currentTarget.dataset;
         updateQuantity(Number(index), Number(delta));
      });
   });

   container.querySelectorAll(".remove-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
         const { index } = event.currentTarget.dataset;
         removeItem(Number(index));
      });
   });

   const clearBtn = document.getElementById("clear-cart-btn");
   if (clearBtn) {
      clearBtn.addEventListener("click", clearCart);
   }
}

function updateQuantity(index, delta) {
   const cart = readCart();
   if (!cart[index]) {
      return;
   }

   cart[index].quantity += delta;
   if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
   }

   writeCart(cart);
   renderCart();
}

function removeItem(index) {
   const cart = readCart();
   cart.splice(index, 1);
   writeCart(cart);
   renderCart();
}

function clearCart() {
   if (!confirm("Are you sure you want to clear the cart?")) {
      return;
   }
   localStorage.removeItem("cart");
   renderCart();
}

document.addEventListener("DOMContentLoaded", renderCart);
