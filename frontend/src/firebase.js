import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBE4cXWXxmpaM3LjmLjuicpOqJbs6Pciu4",
  authDomain: "habitmile-365.firebaseapp.com",
  projectId: "habitmile-365",
  storageBucket: "habitmile-365.firebasestorage.app",
  messagingSenderId: "341992791116",
  appId: "1:341992791116:web:caa574004b09b7995928e9",
  measurementId: "G-9S0YNQZ033"
};

// Firebase VAPID public key
export const vapidKey =
  "BDhXFqmJ-ZzBvBMA5Jd5elFaftEXu2WFzyQ6PTFknLa-J1nCs-ouang7f0Q1G_y2AMmqkznaS7dfkER49GtjC7M";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

export default app;