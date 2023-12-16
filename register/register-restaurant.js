import { app } from "../config.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const auth = getAuth();

let sbtn = document.querySelector("#sbtn"); // get signin btn
let errorPara = document.querySelector("#errorPara"); // get error paragraph

sbtn.addEventListener("click", () => {
  let semail = document.querySelector("#semail"); // get email to signin user
  let spassword = document.querySelector("#spassword"); // get password to signin user
  let sname = document.querySelector("#sname"); // get name of a user

  if (sname.value == "") {
    errorPara.innerText = "Please fill name field!";
    setTimeout(() => {
      errorPara.innerHTML = "";
    }, 3000);
  } else {
    // storing data in a array
    let userData = {
      sname: sname.value,
      semail: semail.value,
      spassword: spassword.value,
      status: false
    };
    // creating user with eamil and password
    createUserWithEmailAndPassword(auth, userData.semail, userData.spassword)
      // email value  , password value
      .then(async (userCredential) => {
        const user = userCredential.user; // getting user from firebase
        const adminUid = user.uid;
        await setDoc(doc(db, "restaurants", user.uid), {
          // collection name,   unique id of user
          ...userData, // setting array in a database
          adminUid // also admin id in the database
        });

        location.href = "./login-restaurant.html";
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
  }
});

spassword.addEventListener("keypress", (e) => {
  if (e.key == "Enter") {
    sbtn.click();
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

      let userData = {
        sname: user.displayName,
        semail: user.email,
        status: false
      };

      await setDoc(doc(db, "restaurants", user.uid), {
        // collection name,   unique id of user
        ...userData, // setting array in a database
        adminUid // also admin id in the database
      });

      localStorage.setItem("adminUid", adminUid);

      const docRef = doc(db, "restaurants", adminUid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        if (docSnap.data().status == false) {
          location.href = "./admin/restaurant-details.html"
        } else {
          location.href = "./admin/admin.html"
        }
      } else {
        location.href = "./admin/restaurant-details.html"
      }
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);

      if (email) {
        errorPara.innerText = email;
        setTimeout(() => {
          errorPara.innerHTML = "";
        }, 3000);
      }
    });
});

// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     const userUid = user.uid;
//   } else {
//     localStorage.removeItem("adminUid");
//   }
// });

if (localStorage.getItem("adminUid")) {
  location.href = "./admin/admin.html";
}