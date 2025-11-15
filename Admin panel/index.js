const API_BASE_URL = "http://127.0.0.1:5000/api";
const DEFAULT_RIDERS = ["rider1"];

const menuListEl = document.getElementById("menu-list");
const ordersListEl = document.getElementById("orders-list");
const assignListEl = document.getElementById("assign-list");
const addItemForm = document.getElementById("add-item-form");

async function apiRequest(path, options = {}) {
   const response = await fetch(`${API_BASE_URL}${path}`, options);
   const contentType = response.headers.get("content-type") || "";
   const payload = contentType.includes("application/json")
      ? await response.json()
      : null;
   if (!response.ok) {
      const message = payload && payload.msg ? payload.msg : "Request failed";
      throw new Error(message);
   }
   return payload;
}

function openTab(tabName, button) {
   document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));
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

function parseOrderItems(rawItems) {
   if (Array.isArray(rawItems)) {
      return rawItems;
   }
   if (!rawItems) {
      return [];
   }
   try {
      return JSON.parse(rawItems);
   } catch (error) {
      console.warn("Unable to parse order items", error);
      return [];
   }
}

function renderMenuItems(items) {
   if (!menuListEl) {
      return;
   }
   if (!items.length) {
      menuListEl.innerHTML = '<p class="empty-state">No menu items found.</p>';
      return;
   }

   menuListEl.innerHTML = "";
   items.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className = "menu-item";
      wrapper.innerHTML = `
			<div class="item-details">
				<div class="item-name">${item.emoji || "🍽"} ${item.name}</div>
				<div class="item-description">${item.description || ""}</div>
				<div class="item-price">৳${item.price}</div>
				<div class="item-category">Category: ${item.category}</div>
			</div>
			<button class="btn btn-danger" data-action="delete">Delete</button>
		`;

      const deleteButton = wrapper.querySelector('[data-action="delete"]');
      deleteButton.addEventListener("click", async () => {
         if (!confirm(`Delete ${item.name}?`)) {
            return;
         }
         try {
            await apiRequest(`/menu/${item.id}`, { method: "DELETE" });
            await loadMenuItems();
         } catch (error) {
            alert(error.message);
         }
      });

      menuListEl.appendChild(wrapper);
   });
}

function renderOrders(orders) {
   if (!ordersListEl) {
      return;
   }
   if (!orders.length) {
      ordersListEl.innerHTML = '<p class="empty-state">No orders placed yet.</p>';
      return;
   }

   ordersListEl.innerHTML = "";
   orders.forEach((order) => {
      const items = parseOrderItems(order.items);
      const orderEl = document.createElement("div");
      orderEl.className = "order-item";
      orderEl.innerHTML = `
			<div class="order-details">
				<div><strong>Order ID:</strong> ${order.id}</div>
				<div><strong>Items:</strong> ${
               items.map((entry) => `${entry.name} x${entry.quantity}`).join(", ") ||
               "N/A"
            }</div>
				<div><strong>Total:</strong> ৳${order.total}</div>
				<div><strong>Status:</strong> ${order.status || "Pending"}</div>
				<div><strong>Rider:</strong> ${order.rider || "Not assigned"}</div>
				<div><strong>Created At:</strong> ${order.created_at || order.timestamp || "N/A"}</div>
			</div>
		`;
      ordersListEl.appendChild(orderEl);
   });
}

function renderAssignList(orders) {
   if (!assignListEl) {
      return;
   }
   if (!orders.length) {
      assignListEl.innerHTML =
         '<p class="empty-state">No orders available for assignment.</p>';
      return;
   }

   assignListEl.innerHTML = "";
   orders.forEach((order) => {
      const items = parseOrderItems(order.items);
      const wrapper = document.createElement("div");
      wrapper.className = "order-item";
      wrapper.innerHTML = `
			<div class="order-details">
				<div><strong>Order ID:</strong> ${order.id}</div>
				<div><strong>Items:</strong> ${
               items.map((entry) => `${entry.name} x${entry.quantity}`).join(", ") ||
               "N/A"
            }</div>
				<div><strong>Total:</strong> ৳${order.total}</div>
				<div><strong>Status:</strong> ${order.status || "Pending"}</div>
			</div>
		`;

      const select = document.createElement("select");
      select.className = "rider-select";
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select Rider";
      select.appendChild(defaultOption);

      DEFAULT_RIDERS.forEach((rider) => {
         const option = document.createElement("option");
         option.value = rider;
         option.textContent = rider;
         if (order.rider === rider) {
            option.selected = true;
         }
         select.appendChild(option);
      });

      select.addEventListener("change", async (event) => {
         const rider = event.target.value;
         if (!rider) {
            return;
         }
         try {
            await apiRequest(`/orders/${order.id}/assign`, {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ rider, status: `Assigned to ${rider}` }),
            });
            await Promise.all([loadOrders(), loadAssignList()]);
         } catch (error) {
            alert(error.message);
         }
      });

      wrapper.appendChild(select);
      assignListEl.appendChild(wrapper);
   });
}

async function loadMenuItems() {
   try {
      const menu = await apiRequest("/menu/");
      renderMenuItems(Array.isArray(menu) ? menu : []);
   } catch (error) {
      console.error("Failed to load menu", error);
      if (menuListEl) {
         menuListEl.innerHTML = `<p class="error-text">${error.message}</p>`;
      }
   }
}

async function loadOrders() {
   try {
      const orders = await apiRequest("/orders/");
      renderOrders(Array.isArray(orders) ? orders : []);
   } catch (error) {
      console.error("Failed to load orders", error);
      if (ordersListEl) {
         ordersListEl.innerHTML = `<p class="error-text">${error.message}</p>`;
      }
   }
}

async function loadAssignList() {
   try {
      const orders = await apiRequest("/orders/");
      renderAssignList(Array.isArray(orders) ? orders : []);
   } catch (error) {
      console.error("Failed to load assign list", error);
      if (assignListEl) {
         assignListEl.innerHTML = `<p class="error-text">${error.message}</p>`;
      }
   }
}

async function handleAddMenuItem(event) {
   event.preventDefault();
   const name = document.getElementById("item-name").value.trim();
   const description = document.getElementById("item-desc").value.trim();
   const priceInput = document.getElementById("item-price").value;
   const category = document.getElementById("item-category").value;
   const emoji = document.getElementById("item-picture").value.trim();

   const price = Number(priceInput);
   if (!name || Number.isNaN(price)) {
      alert("Please provide a name and a valid price.");
      return;
   }

   try {
      await apiRequest("/menu/", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            name,
            description,
            price,
            category,
            emoji,
         }),
      });
      addItemForm.reset();
      await loadMenuItems();
   } catch (error) {
      alert(error.message);
   }
}

document.addEventListener("DOMContentLoaded", () => {
   if (addItemForm) {
      addItemForm.addEventListener("submit", handleAddMenuItem);
   }
   loadMenuItems();
   loadOrders();
   loadAssignList();
});
