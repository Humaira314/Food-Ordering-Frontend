const API_BASE_URL = "http://127.0.0.1:5000/api";

function getCartItems() {
   try {
      return JSON.parse(localStorage.getItem("cart")) || [];
   } catch (error) {
      console.error("Unable to read cart from storage", error);
      return [];
   }
}

function buildOrderSummary(cart) {
   const container = document.getElementById("order-container");
   if (!container) {
      return;
   }

   if (!cart.length) {
      container.innerHTML = `
			<div class="order-empty">
				<h2>No Order Found</h2>
				<p>Your cart is empty. Please add items first!</p>
				<a href="cart.html" class="empty-order-btn">Go to Cart</a>
			</div>
		`;
      return;
   }

   let total = 0;
   const rows = cart
      .map((item) => {
         const subtotal = item.price * item.quantity;
         total += subtotal;
         return `
			<div class="order-item">
				<span class="item-name-qty">${item.name} x${item.quantity}</span>
				<span class="item-subtotal">৳${subtotal}</span>
			</div>
		`;
      })
      .join("");

   container.innerHTML = `
		<div class="order-details">
			<h2 class="section-title">Order Details</h2>
			${rows}
		</div>
		<div class="total-section">
			<div>Total Price: <span class="total-price">৳${total}</span></div>
			<button class="confirm-btn" id="confirm-order-btn">Confirm Order</button>
		</div>
	`;

   const confirmButton = document.getElementById("confirm-order-btn");
   if (confirmButton) {
      confirmButton.addEventListener("click", confirmOrder);
   }
}

async function confirmOrder() {
   const cart = getCartItems();
   if (!cart.length) {
      alert("Your cart is empty.");
      return;
   }

   const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
   const headers = { "Content-Type": "application/json" };
   const token = localStorage.getItem("token");
   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }

   try {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
         method: "POST",
         headers,
         body: JSON.stringify({
            user_id: Number(localStorage.getItem("user_id")) || 1,
            items: cart,
            total,
         }),
      });

      const data = await response.json();
      if (!response.ok) {
         throw new Error(data.msg || "Failed to place order");
      }

      alert(data.msg || "Order placed successfully");
      localStorage.removeItem("cart");
      window.location.href = "index.html";
   } catch (error) {
      alert(error.message || "Unable to place order right now.");
   }
}

document.addEventListener("DOMContentLoaded", () => {
   buildOrderSummary(getCartItems());
});
