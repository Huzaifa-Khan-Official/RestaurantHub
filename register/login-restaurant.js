import { app } from "../config.js";

import {
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

let lemail = document.querySelector("#lemail"); // get email to login user
let lpassword = document.querySelector("#lpassword"); // get password to login user
let lbtn = document.querySelector("#lbtn"); // get login btn
let errorPara = document.querySelector("#errorPara"); // get error paragraph

lbtn.addEventListener("click", () => {
  lbtn.innerHTML = `
          <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
          </div>
  `;
  signInWithEmailAndPassword(auth, lemail.value, lpassword.value)
    .then(async (userCredential) => {
      const user = userCredential.user;

      const adminUid = user.uid;

      const docRef = doc(db, "restaurants", adminUid);
      const docSnap = await getDoc(docRef);

      lbtn.innerHTML = "Login";
    
      if (docSnap.exists()) {
        localStorage.setItem("adminUid", adminUid);
        if (docSnap.data().status == false) {
          location.href = "./admin/restaurant-details.html";
        } else {
          location.href = "./admin/admin.html";
        }
      } else {
        const userRef = doc(db, "users", adminUid);
        const userDocSnap = await getDoc(userRef);

        if (userDocSnap.exists()) {
          localStorage.setItem("userUid", adminUid);
          location.href = "../user/index.html";
        } else {
          location.href = "./register-restaurant.html";
        }
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = errorCode.slice(5).toUpperCase();
      const errMessage = errorMessage.replace(/-/g, " ");
      errorPara.innerText = errMessage;
      setTimeout(() => {
        errorPara.innerHTML = "";
      }, 3000);
    });
});

lpassword.addEventListener("keypress", (e) => {
  if (e.key == "Enter") {
    lbtn.click();
  }
});

const googleSignInBtn = document.getElementById("googleSignInBtn");

googleSignInBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      const user = result.user;
      const adminUid = user.uid;

      let adminData = {
        sname: user.displayName,
        semail: user.email,
        status: false,
        adminUid,
      };

      await setDoc(doc(db, "restaurants", adminUid), {
        // collection name,   unique id of user
        ...adminData, // setting array in a database
      });

      const docRef = doc(db, "restaurants", adminUid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        localStorage.setItem("adminUid", adminUid);
        if (docSnap.data().status === false) {
          location.href = "./admin/restaurant-details.html";
        } else {
          location.href = "./admin/admin.html";
        }
      } else {
        const userRef = doc(db, "users", adminUid);
        const userDocSnap = await getDoc(userRef);

        if (userDocSnap.exists()) {
          localStorage.setItem("userUid", adminUid);
          location.href = "../user/index.html";
        } else {
          location.href = "./register-restaurant.html";
        }
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(errorMessage);
    });
});

// if (localStorage.getItem("adminUid")) {
//   location.href = "./admin/admin.html";
// }

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         const userUid = user.uid;
//     } else {
//         localStorage.adminItem("userUid");
//     }
// });
