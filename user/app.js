import { app } from "../config.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  onSnapshot,
  doc,
  query,
  deleteDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userUid = user.uid;

    const userRef = doc(db, "users", userUid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      localStorage.setItem("userUid", userUid);
    } else {
      localStorage.removeItem("userUid");
      location.href = "../index.html";
    }
  } else {
    localStorage.removeItem("userUid");
    location.href = "../index.html";
  }
});

const ourRestCards = document.querySelector(".ourRestCards");

const getItems = () => {
  const restaurantsRef = collection(db, `restaurants/`);
  const q = query(restaurantsRef, where("status", "==", true));
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((singleBusiness) => {
      if (singleBusiness.type === "removed") {
        let dItem = document.getElementById(singleBusiness.doc.id);
        if (dItem) {
          dItem.remove();
        }
      } else {
        const businessType = singleBusiness.doc.data().BusinessType;
        const businessName = singleBusiness.doc.data().businessName;
        const businessImg = singleBusiness.doc.data().businessImg;
        const businessId = singleBusiness.doc.id;

        ourRestCards.innerHTML += `
        <div class="card col-lg-3 col-md-6 col-12" style="width: 18rem;" id="${businessId}" onclick="selectRestaurant('${businessId}')">
            <div class="restCardImgDiv">
                <img src="${businessImg}" class="card-img-top" alt="...">
            </div>
            <div class="card-body">
                <h5 class="card-title" id="restName">${businessName}</h5>
                <p class="card-text" id="restCateg">${businessType}</p>
            </div>
        </div>
      `;
      }
    });
  });
};

getItems();

function selectRestaurant(restaurantId) {
  localStorage.setItem("selectedRestaurantId", restaurantId);
  console.log(restaurantId);
  location.href = "./restaurant-detail.html";
}

const LogOutBtn = document.querySelector("#LogOutBtn");
LogOutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    localStorage.removeItem("userUid");
    location.href = "./index.html";
  });
});

window.selectRestaurant = selectRestaurant;
