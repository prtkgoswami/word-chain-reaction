import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbx3NwLVZa6RDWRmc-B9g0g162hty40hU",
  authDomain: "word-chain-reaction.firebaseapp.com",
  projectId: "word-chain-reaction",
  storageBucket: "word-chain-reaction.firebasestorage.app",
  messagingSenderId: "793707252472",
  appId: "1:793707252472:web:a85faa517f53ef2c2ac90d",
  measurementId: "G-BL09F6ZYRL",
  databaseURL: "https://word-chain-reaction-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
