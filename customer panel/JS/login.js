// API base URL - points to Render backend
const API_BASE_URL = "https://food-ordering-backend-b3k6.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
   const form = document.getElementById("loginForm");
   if (!form) {
      return;
   }

   form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
         alert("Please provide both username and password.");
         return;
      }

      try {
         const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
         });

         const data = await response.json();
         if (!response.ok) {
            throw new Error(data.msg || "Invalid credentials");
         }

         alert("Login successful!");
         localStorage.setItem("token", data.token || "");
         const role = data.role || "customer";
         if (data.user_id) {
            localStorage.setItem("user_id", data.user_id);
         }
         localStorage.setItem("role", role);
         localStorage.setItem("username", username);

         const redirectMap = {
            admin: "/admin",
            rider: "/rider",
            customer: "order.html",
         };
         window.location.href = redirectMap[role] || "order.html";
      } catch (error) {
         alert(error.message || "Unable to login right now.");
      }
   });
});

window.showForgotPassword = function showForgotPassword() {
   alert("Forgot Password feature is not available in this demo.");
};
