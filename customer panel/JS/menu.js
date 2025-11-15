const API_BASE_URL = "http://127.0.0.1:5000/api";

let categoryContainers;

function openTab(tabName, button) {
   document
      .querySelectorAll(".tab-content")
      .forEach((tab) => tab.classList.remove("active"));
   const target = document.getElementById(tabName);
   if (target) {
      target.classList.add("active");
   }

   document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
   if (button) {
      button.classList.add("active");
   }
}

window.openTab = openTab;

function initTabKeyboardNav() {
   const buttons = Array.from(document.querySelectorAll(".tab-btn"));
   if (!buttons.length) {
      return;
   }

   buttons.forEach((btn, index) => {
      btn.addEventListener("keydown", (event) => {
         if (event.key === "ArrowRight") {
            const next = buttons[(index + 1) % buttons.length];
            next.focus();
            next.click();
         } else if (event.key === "ArrowLeft") {
            const previous = buttons[(index - 1 + buttons.length) % buttons.length];
            previous.focus();
            previous.click();
         }
      });
   });
}

function getCategoryContainers() {
   if (!categoryContainers) {
      categoryContainers = {
         appetizers: document.querySelector('[data-category="appetizers"]'),
         "main-course": document.querySelector('[data-category="main-course"]'),
         desserts: document.querySelector('[data-category="desserts"]'),
         drinks: document.querySelector('[data-category="drinks"]'),
      };
   }
   return categoryContainers;
}

function readCart() {
   try {
      return JSON.parse(localStorage.getItem("cart")) || [];
   } catch (error) {
      console.error("Failed to parse cart from storage", error);
      return [];
   }
}

function writeCart(cart) {
   localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
   const cart = readCart();
   const total = cart.reduce((sum, item) => sum + item.quantity, 0);
   const cartButton = document.querySelector(".cart-btn");
   if (cartButton) {
      cartButton.textContent = `🛒 View Cart (${total})`;
   }
}

function addToCart(item) {
   const cart = readCart();
   const existing = cart.find((entry) => entry.name === item.name);
   if (existing) {
      existing.quantity += 1;
   } else {
      cart.push({ name: item.name, price: item.price, quantity: 1 });
   }

   writeCart(cart);
   updateCartCount();
   alert(`${item.name} added to cart!`);
}

function createMenuItemCard(item) {
   const card = document.createElement("div");
   card.className = "menu-item";
   card.innerHTML = `
		<span class="emoji">${item.emoji || "🍽"}</span>
		<div class="item-info">
			<h3 class="item-name">${item.name}</h3>
			<p class="item-desc">${item.description || ""}</p>
			<span class="item-price">৳${item.price}</span>
			<button class="add-btn" type="button">Add to Cart</button>
		</div>
	`;

   const addButton = card.querySelector(".add-btn");
   addButton.addEventListener("click", () => addToCart(item));
   return card;
}

function clearMenuContainers() {
   Object.values(getCategoryContainers()).forEach((container) => {
      if (container) {
         container.innerHTML = "";
      }
   });
}

function renderMenu(items) {
   const containers = getCategoryContainers();
   clearMenuContainers();

   const fallback = containers["main-course"] || Object.values(containers).find(Boolean);

   items.forEach((item) => {
      const key = (item.category || "").toLowerCase();
      const target = containers[key] || fallback;
      if (!target) {
         return;
      }
      target.appendChild(createMenuItemCard(item));
   });
}

function showMenuError(message) {
   const fallback = Object.values(getCategoryContainers()).find(Boolean);
   if (fallback) {
      fallback.innerHTML = `<div class="menu-error">${message}</div>`;
   }
}

async function loadMenu() {
   try {
      const response = await fetch(`${API_BASE_URL}/menu/`);
      if (!response.ok) {
         throw new Error("Unable to load menu from the server.");
      }
      const data = await response.json();
      renderMenu(Array.isArray(data) ? data : []);
   } catch (error) {
      console.error("Menu load failed", error);
      showMenuError("Failed to load menu items. Please try again later.");
   }
}

document.addEventListener("DOMContentLoaded", () => {
   initTabKeyboardNav();
   updateCartCount();
   loadMenu();
});

window.addEventListener("storage", (event) => {
   if (event.key === "cart") {
      updateCartCount();
   }
});
