// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCu8Ty5clwyV0ksaCks7QkiQNImCc1rhJI",
    authDomain: "print3d-1e16c.firebaseapp.com",
    projectId: "print3d-1e16c",
    storageBucket: "print3d-1e16c.firebasestorage.app",
    messagingSenderId: "1099096929756",
    appId: "1:1099096929756:web:e66fa63899761e2d738b19",
    measurementId: "G-R74CCK82QK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
