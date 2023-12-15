import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5eT-ARjQ1bOE5nC3CYj0hHCbc5j9Uat8",
    authDomain: "foodpanda-clon.firebaseapp.com",
    projectId: "foodpanda-clon",
    storageBucket: "foodpanda-clon.appspot.com",
    messagingSenderId: "879473995409",
    appId: "1:879473995409:web:fd5fbed197e6c29878d930"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app }