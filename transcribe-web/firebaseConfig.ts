// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBj2XTZcjLLjbwmo_X-mHr66tP4YhyiXqI",
  authDomain: "transcribe-demo-2808e.firebaseapp.com",
  projectId: "transcribe-demo-2808e",
  storageBucket: "transcribe-demo-2808e.firebasestorage.app",
  databaseURL: "https://transcribe-demo-2808e-default-rtdb.europe-west1.firebasedatabase.app",
  messagingSenderId: "324237503985",
  appId: "1:324237503985:web:a97c1125732d2de85ee850",
  measurementId: "G-FPRW5KGVS5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);