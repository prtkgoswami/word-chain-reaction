import { initializeApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};

// Log configuration (without sensitive data)
// console.log('Environment variables loaded:', {
//   apiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: !!process.env.REACT_APP_FIREBASE_APP_ID,
//   databaseURL: !!process.env.REACT_APP_FIREBASE_DATABASE_URL
// });

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_FIREBASE_DATABASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error('Missing required environment variables');
}

// Initialize Firebase
let app;
let database: Database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { database };