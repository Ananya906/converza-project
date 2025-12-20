const tickets = document.getElementById('tickets');
const type = document.getElementById('type');
const total = document.getElementById('total');
const captchaCode = document.getElementById('captchaCode');
const form = document.getElementById('ticketForm');
const successMsg = document.getElementById('successMsg');

// Update total dynamically
function updateTotal() {
  const price = parseInt(type.options[type.selectedIndex].dataset.price);
  const qty = parseInt(tickets.value);
  total.textContent = `Total: ₹${price * qty}`;
}
tickets.addEventListener('input', updateTotal);
type.addEventListener('change', updateTotal);

// Generate CAPTCHA
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  captchaCode.textContent = code;
}
generateCaptcha();

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const userCaptcha = document.getElementById('captchaInput').value;
  if (userCaptcha !== captchaCode.textContent) {
    alert("❌ CAPTCHA is incorrect. Please try again!");
    generateCaptcha();
    return;
  }

  // In real app, here you can send data using EmailJS or your backend
  successMsg.style.display = "block";
  form.reset();
  total.textContent = "Total: ₹500";
  generateCaptcha();
});
