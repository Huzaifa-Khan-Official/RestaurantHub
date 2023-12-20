import { app } from "../../config.js";
import {
  getFirestore,
  getDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();
const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

let adminUid;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const adminUid = user.uid;

    const adminRef = doc(db, "restaurants", adminUid);
    const docSnap = await getDoc(adminRef);

    if (docSnap.exists()) {
      localStorage.setItem("adminUid", adminUid);
    } else {
      // If user is not in "users" collection, check if they are in "restaurants" collection
      const userRef = doc(db, "users", adminUid);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        // User is an admin, redirect to admin dashboard
        localStorage.setItem("userUid", adminUid);
        location.href = "../../user/index.html";
      }
    }
  } else {
    localStorage.removeItem("adminUid");
    location.href = "../register-restaurant.html";
  }
});

const uploadBtnDiv = document.querySelector(".uploadBtnDiv");
const picInput = document.querySelector("#picInput");
const picOutput = document.querySelector("#picOutput");
const spinnerBorder = document.querySelector(".spinner-border");
const saveBtn = document.querySelector("#saveBtn");
const businessName = document.querySelector("#businessName");
const businessEmail = document.querySelector("#businessEmail");
const selectBusinessType = document.querySelector("#selectBusinessType");
const businessAddress = document.querySelector("#businessAddress");
let imgUrl;

const getData = async () => {
  const docRef = doc(db, "restaurants", localStorage.getItem("adminUid"));
  const docSnap = await getDoc(docRef);

  if (docSnap.data().status) {
    selectBusinessType.value = docSnap.data().BusinessType;
    businessAddress.value = docSnap.data().businessAddress;
    businessEmail.value = docSnap.data().businessEmail;
    picOutput.src = docSnap.data().businessImg;
    imgUrl = docSnap.data().businessImg;
    businessName.value = docSnap.data().businessName;
  }
};

getData();

const downloadImageUrl = (file) => {
  return new Promise((resolve, reject) => {
    const restaurantImageRef = ref(
      storage,
      `restaurantImages/${adminUid}/${adminUid}.jpg`
    );
    const uploadTask = uploadBytesResumable(restaurantImageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case "paused":
            break;
          case "running":
            spinnerBorder.style.display = "block";
            break;
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            resolve(downloadURL);
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
};

uploadBtnDiv.addEventListener("click", () => {
  picInput.click();
});

picInput.addEventListener("change", async () => {
  if (picInput.files.length > 0) {
    const file = picInput.files[0];
    imgUrl = await downloadImageUrl(file);
    spinnerBorder.style.display = "none";
    if (imgUrl) {
      picOutput.src = imgUrl;
    }
  }
});

saveBtn.addEventListener("click", async () => {
  const businessNameValue = businessName.value;
  const businessEmailValue = businessEmail.value;
  const selectBusinessTypeValue = selectBusinessType.value;
  const businessAddressValue = businessAddress.value;

  if (businessNameValue == "") {
    location.href = "#businessName";
  } else if (businessEmailValue == "") {
    location.href = "#businessEmail";
  } else if (selectBusinessTypeValue == "") {
    location.href = "#selectBusinessType";
  } else if (businessAddressValue == "") {
    location.href = "#businessAddress";
  } else if (!imgUrl) {
    location.href = "#picInput";
  } else {

    const adminUid = localStorage.getItem("adminUid");
    const restaurantRef = doc(db, "restaurants", adminUid);
    saveBtn.innerHTML = `
                    <div class="spinner-border saveBtnSpinner" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
        `;
    await updateDoc(restaurantRef, {
      businessName: businessNameValue,
      businessEmail: businessEmailValue,
      BusinessType: selectBusinessTypeValue,
      businessAddress: businessAddressValue,
      businessImg: imgUrl,
      status: true,
    });
    saveBtn.innerHTML = "Save & Continue";
    location.href = "./admin.html";
  }
});
