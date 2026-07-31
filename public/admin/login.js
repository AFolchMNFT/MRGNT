import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';
import { auth } from '/firebase-config.js';

const FIREBASE_ERRORS = {
  'auth/invalid-email': 'Correo inválido',
  'auth/user-not-found': 'Correo o contraseña incorrectos',
  'auth/wrong-password': 'Correo o contraseña incorrectos',
  'auth/invalid-credential': 'Correo o contraseña incorrectos',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
};

// Redirect if already authenticated admin
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const token = await user.getIdTokenResult();
  if (token.claims.admin) window.location.href = '/admin/index.html';
});

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdTokenResult();
    if (!token.claims.admin) {
      await auth.signOut();
      errorEl.textContent = 'Esta cuenta no tiene permisos de administrador.';
      errorEl.hidden = false;
      return;
    }
    window.location.href = '/admin/index.html';
  } catch (err) {
    errorEl.textContent = FIREBASE_ERRORS[err.code] || 'No se pudo iniciar sesión';
    errorEl.hidden = false;
  }
});
