import { app } from "../config.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  query,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userUid = user.uid;
    localStorage.setItem("userUid", userUid);
    location.href = "./user/index.html";
  }
});

const crossIconDiv = document.querySelector(".crossIconDiv");
const growBusinessDiv = document.querySelector(".growBusinessDiv");
const ourRestCards = document.querySelector(".ourRestCards");

crossIconDiv.addEventListener("click", () => {
  growBusinessDiv.style.display = "none";
});

const getItems = () => {
  const q = query(collection(db, `restaurants/`));
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
            <img src="${businessImg}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title" id="restName">${businessName}</h5>
                <p class="card-text" id="restCateg">${businessType}</p>
            </div>
        </div>
      `
    }

    });
  });
};

getItems();

function selectRestaurant(restaurantId) {
    localStorage.setItem("selectedRestaurantId", restaurantId)
    console.log(restaurantId);
    location.href = "./restaurant-detail.html";
}

window.selectRestaurant = selectRestaurant;