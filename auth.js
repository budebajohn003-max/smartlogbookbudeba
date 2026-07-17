import { loginUser, registerUser, getCurrentUser, logoutUser } from './logbook_service.js';

const page = window.location.pathname.split('/').pop();

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : 'student';
}

function redirectByRole(user) {
  const role = normalizeRole(user?.role);
  if (role === 'admin') window.location.href = 'admin_dashboard.html';
  else if (role === 'supervisor') window.location.href = 'supervisor_dashboard.html';
  else window.location.href = 'student_dashboard.html';
}

const currentUser = await getCurrentUser();
if ((page === 'index.html' || page === '' || page === 'index') && currentUser) redirectByRole(currentUser);

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await loginUser({ email, password });
    if (error) return alert(error);
    redirectByRole(data);
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fullname = document.querySelector('input[name="fullname"]').value.trim();
    const regno = document.querySelector('input[name="regno"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;
    if (password !== confirm) return alert('Passwords do not match.');
    const { error } = await registerUser({ fullname, regno, email, password });
    if (error) return alert(error);
    alert('Account created. Check your email to confirm your account, then sign in.');
    window.location.href = 'index.html';
  });
}

const logoutButton = document.getElementById('logoutBtn');
if (logoutButton) {
  logoutButton.addEventListener('click', async (event) => {
    event.preventDefault();
    await logoutUser();
    window.location.href = 'index.html';
  });
}
