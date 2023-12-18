import { app } from "../../config.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

const restaurantId = localStorage.getItem("selectedRestaurantId");
if (!restaurantId) {
  location.href = "./index.html";
}

const cardDiv = document.querySelector(".cardDiv");
const coverDiv = document.querySelector(".coverDiv");
const bannerHeadingDiv = document.querySelector(".bannerHeadingDiv");

const getRestaurantDetails = async (restaurantId) => {
  const restRef = doc(db, "restaurants", restaurantId);

  onSnapshot(restRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const businessimg = docSnapshot.data().businessImg;
      const businessName = docSnapshot.data().businessName;
      const businesstype = docSnapshot.data().BusinessType;

      coverDiv.style.backgroundImage = `url('${businessimg}')`;

      bannerHeadingDiv.innerHTML = `
        <div class="headingDiv">
            <h1>${businessName}</h1>
        </div>
        <div class="BusinessTypeDiv">
            <h3>${businesstype}</h3>
        </div>
        `;
      console.log(docSnapshot.data());
    } else {
      console.log("No such document!");
    }
  });
};

getRestaurantDetails(restaurantId);

const getItems = async () => {
  const q = query(collection(db, `restaurants/${restaurantId}/menue`));
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((singleItem) => {
      if (singleItem.type === "removed") {
        let dItem = document.getElementById(singleItem.doc.id);
        if (dItem) {
          dItem.remove();
        }
      } else if (singleItem.type === "added") {
        const itemId = singleItem.doc.id;
        const itemImg = singleItem.doc.data().itemImg;
        const itemName = singleItem.doc.data().itemName;
        const itemDesc = singleItem.doc.data().itemDesc;
        const itemPrice = singleItem.doc.data().itemPrice;
        const itemType = singleItem.doc.data().itemType;
        const prevPrice = singleItem.doc.data().prevPrice;
        let strikePrice;

        if (prevPrice) {
          strikePrice = `
                    <s><h6>Rs. ${prevPrice}</h6></s>
                    `;
        } else {
          strikePrice = ``;
        }
        cardDiv.innerHTML += `
                <div class="card col-lg-5 col-md-5 col-sm-5 col-12" id="${itemId}" onclick ="addToCart()">
                    <div class="cardImgDiv">
                        <img src="${itemImg}" alt="">
                    </div>
                    <div class="cardContentDiv">
                        <div class="cardNameDiv">
                            <h5>${itemName}</h5>
                        </div>
                        <div class="cardNameDiv">
                            <h5>${itemDesc}</h5>
                        </div>
                        <div class="itemPriceDivOutput">
                            <h6>Rs. ${itemPrice}</h6>

                            ${strikePrice}
                        </div>
                        <div class="itemTypeDiv">
                            <p><i class="fa-solid fa-circle"></i> </p><h6>${itemType}</h6>
                        </div>
                    </div>
                    <div class="addToCart">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                </div>
                `;
      }
    });
  });
};

await getItems();

window.addToCart = () => {
  Swal.fire({
    icon: "error",
    title: `Can't Add Item To Cart`,
    text: `Please Sign In First To Add Item To Your Cart!`,
  });
};
