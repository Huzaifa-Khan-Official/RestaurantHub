import { app } from "../config.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();


onAuthStateChanged(auth, (user) => {
    if (user) {
        const userUid = user.uid;
        localStorage.setItem("userUid", userUid)
    } else {
        localStorage.removeItem("userUid");
        location.href = "../index.html";
    }
});