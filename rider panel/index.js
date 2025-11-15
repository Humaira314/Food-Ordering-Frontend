const API_BASE_URL = "http://127.0.0.1:5000/api";
const RIDER_TOKEN_MAP = { rider1: "rider_token" };

function parseItems(rawItems) {
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

async function loadAssignedOrders() {
   const riderSelect = document.getElementById("rider-name");
   const container = document.getElementById("orders-container");
   const rider = riderSelect ? riderSelect.value : "";

   if (!container) {
      return;
   }

   container.innerHTML = "";
   if (!rider) {
      container.innerHTML =
         '<p class="no-orders">Please select a rider to view assigned orders.</p>';
      return;
   }

   let token = RIDER_TOKEN_MAP[rider];
   const storedToken = localStorage.getItem("token");
   const storedRole = localStorage.getItem("role");
   const storedUsername = localStorage.getItem("username");
   if (storedRole === "rider" && storedUsername === rider && storedToken) {
      token = storedToken;
   }
   if (!token) {
      container.innerHTML =
         '<p class="error-text">No API token configured for this rider.</p>';
      return;
   }

   try {
      const response = await fetch(`${API_BASE_URL}/riders/assigned`, {
         headers: { Authorization: token },
      });
      const data = await response.json();
      if (!response.ok) {
         throw new Error(data.msg || "Failed to load assigned orders.");
      }

      const orders = Array.isArray(data) ? data : [];
      if (!orders.length) {
         container.innerHTML =
            '<p class="no-orders">No orders assigned to this rider.</p>';
         return;
      }

      orders.forEach((order) => {
         const items = parseItems(order.items);
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
					<div><strong>Status:</strong> <span class="order-status">${
                  order.status || "Pending"
               }</span></div>
				</div>
			`;

         const select = document.createElement("select");
         select.className = "status-select";
         ["Pending", "Out for Delivery", "Delivered", "Cancelled"].forEach((status) => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            if ((order.status || "Pending") === status) {
               option.selected = true;
            }
            select.appendChild(option);
         });

         select.addEventListener("change", async (event) => {
            try {
               await updateStatus(order.id, event.target.value, token);
               await loadAssignedOrders();
            } catch (error) {
               alert(error.message);
            }
         });

         wrapper.appendChild(select);
         container.appendChild(wrapper);
      });
   } catch (error) {
      console.error("Failed to load assigned orders", error);
      container.innerHTML = `<p class="error-text">${error.message}</p>`;
   }
}

async function updateStatus(orderId, status, token) {
   const response = await fetch(`${API_BASE_URL}/riders/${orderId}/status`, {
      method: "PUT",
      headers: {
         "Content-Type": "application/json",
         Authorization: token,
      },
      body: JSON.stringify({ status }),
   });

   const data = await response.json();
   if (!response.ok) {
      throw new Error(data.msg || "Failed to update order status.");
   }
}

window.loadAssignedOrders = loadAssignedOrders;

document.addEventListener("DOMContentLoaded", () => {
   const riderSelect = document.getElementById("rider-name");
   const storedRole = localStorage.getItem("role");
   const storedUsername = localStorage.getItem("username");
   if (riderSelect && storedRole === "rider" && storedUsername) {
      riderSelect.value = storedUsername;
      loadAssignedOrders();
   }
});
