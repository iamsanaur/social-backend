// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCDp0bkN2JqHG6PmW054EK-j2_1LsUOls",
  authDomain: "ooumph-social.firebaseapp.com",
  projectId: "ooumph-social",
  storageBucket: "ooumph-social.appspot.com",
  messagingSenderId: "841011047357",
  appId: "1:841011047357:web:16e4b729fafdc1218a40d4",
  measurementId: "G-HX27V697RS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);