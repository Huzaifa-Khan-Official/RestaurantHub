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
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const auth = getAuth();

let sbtn = document.querySelector("#sbtn"); // get signin btn
let errorPara = document.querySelector("#errorPara"); // get error paragraph

sbtn.addEventListener("click", () => {
  sbtn.innerHTML = `
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
  `;
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
    };
    // creating user with eamil and password
    createUserWithEmailAndPassword(auth, userData.semail, userData.spassword)
      // email value  , password value
      .then(async (userCredential) => {
        const user = userCredential.user; // getting user from firebase
        await setDoc(doc(db, "users", user.uid), {
          // collection name,   unique id of user
          ...userData, // setting array in a database
          userid: user.uid, // also user id in the database
        });

        sbtn.innerHTML = "Signup";

        location.href = "../login/login.html";
      })
      .catch((error) => {
        sbtn.innerHTML = "Signup";
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
  googleSignInBtn.innerHTML = `
  <div class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  `;
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      const user = result.user;

      const userUid = user.uid;

      const userRef = doc(db, "users", userUid);

      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        localStorage.setItem("userUid", userUid);

        googleSignInBtn.innerHTML = `
          <div class="googleIcon"><img src="./googleIcon.png" alt=""></div>
          <div class="googleBtnPara">Login with Google</div>
          `;
          
        location.href = "../user/index.html";
      } else {
        const adminRef = doc(db, "restaurants", userUid);
        const adminDocSnap = await getDoc(adminRef);

        if (adminDocSnap.exists()) {
          localStorage.setItem("adminUid", userUid);

          googleSignInBtn.innerHTML = `
          <div class="googleIcon"><img src="./googleIcon.png" alt=""></div>
          <div class="googleBtnPara">Login with Google</div>
          `;

          location.href = "../register/admin/admin.html";
        }
      }

      let userData = {
        sname: user.displayName,
        semail: user.email,
      };

      await setDoc(doc(db, "users", user.uid), {
        // collection name,   unique id of user
        ...userData, // setting array in a database
        userid: user.uid, // also user id in the database
      });

      localStorage.setItem("userUid", user.uid);

      googleSignInBtn.innerHTML = `
      <div class="googleIcon"><img src="./googleIcon.png" alt=""></div>
      <div class="googleBtnPara">Login with Google</div>
      `;

      location.href = "../user/index.html";
    })
    .catch((error) => {
      googleSignInBtn.innerHTML = `
      <div class="googleIcon"><img src="./googleIcon.png" alt=""></div>
      <div class="googleBtnPara">Login with Google</div>
      `;

      const errorCode = error.code;
      const errorMessage = errorCode.slice(5).toUpperCase();
      const errMessage = errorMessage.replace(/-/g, " ");
      errorPara.innerText = errMessage;
      setTimeout(() => {
        errorPara.innerHTML = "";
      }, 3000);
      
    });
});

// onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     const userUid = user.uid;

//     const userRef = doc(db, "users", userUid);

//     const docSnap = await getDoc(userRef);

//     if (docSnap.exists()) {
//       localStorage.setItem("userUid", userUid);
//       location.href = "../user/index.html";
//     } else {
//       const adminRef = doc(db, "restaurants", userUid);
//       const adminDocSnap = await getDoc(adminRef);

//       if (adminDocSnap.exists()) {
//         localStorage.setItem("adminUid", userUid);
//         location.href = "../register/admin/admin.html";
//       }
//     }
//   }
// });
