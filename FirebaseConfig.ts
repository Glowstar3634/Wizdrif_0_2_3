// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getAnalytics } from "@firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPePMsqz9q3PWV7fNcho0fZIk40HXC2K4",
  authDomain: "wizdrif.firebaseapp.com",
  databaseURL: "https://wizdrif-default-rtdb.firebaseio.com",
  projectId: "wizdrif",
  storageBucket: "wizdrif.appspot.com",
  messagingSenderId: "807802462117",
  appId: "1:807802462117:web:37e55d796ac968c2db124c",
  measurementId: "G-W55LVJLWKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default firebaseConfig;