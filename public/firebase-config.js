import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getAuth, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';
import { getStorage, connectStorageEmulator } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDeExSnUJERc229M6Vr2Wo4WtUHLnrTAAY',
  authDomain: 'mrgnt-504117.firebaseapp.com',
  projectId: 'mrgnt-504117',
  storageBucket: 'mrgnt-504117.firebasestorage.app',
  messagingSenderId: '993617480326',
  appId: '1:993617480326:web:154cb63a474081d4045f07',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectStorageEmulator(storage, 'localhost', 9199);
}
