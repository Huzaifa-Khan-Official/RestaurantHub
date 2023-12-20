import { app } from "../../config.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth();

const restaurantId = localStorage.getItem("selectedRestaurantId");
if (!restaurantId) {
  location.href = "./index.html";
}

const userUid = localStorage.getItem("userUid");

const cardDiv = document.querySelector(".cardDiv");
const coverDiv = document.querySelector(".coverDiv");
const bannerHeadingDiv = document.querySelector(".bannerHeadingDiv");
const cartNoPara = document.querySelector("#cartNo");
const cartBtn = document.getElementById("cartBtn");
const cartList = document.querySelector(".cartList");
let cartTotalPricePara = document.querySelector(".cartTotalPricePara");

let cartQuant;
const getCarts = () => {
  onSnapshot(collection(db, `users/${userUid}/cart`), (data) => {
    cartQuant = data.size;
    if (cartQuant) {
      btn.disabled = false;
      cartNoPara.style.display = "flex";
      cartNoPara.innerHTML = `${cartQuant}`;
    } else {
      cartNoPara.style.display = "none";
    }
  });
};

getCarts();

const getRestaurantDetails = async (restaurantId) => {
  const restRef = doc(db, "restaurants", restaurantId);

  onSnapshot(restRef, (docSnapshot) => {
    if (docSnapshot.exists() && docSnapshot.data().status) {
      const businessimg = docSnapshot.data().businessImg;
      const businessName = docSnapshot.data().businessName;
      const businesstype = docSnapshot.data().BusinessType;
      const businessAddress = docSnapshot.data().businessAddress;

      coverDiv.style.backgroundImage = `url('${businessimg}')`;

      bannerHeadingDiv.innerHTML = `
        <div class="headingDiv">
            <h1>${businessName}</h1>
        </div>
        <div class="BusinessTypeDiv">
            <h3>${businesstype}</h3>
        </div>
        <div class="BusinessAddressDiv">
            <p>${businessAddress}</p>
        </div>
        `;
    } else {
      console.log("No such document!");
    }
  });
};

getRestaurantDetails(restaurantId);

const getItems = async () => {
  const q = query(collection(db, `restaurants/${restaurantId}/menue`), orderBy("time"));
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
                <div class="card col-lg-5 col-md-5 col-sm-5 col-12" id="${itemId}" onclick ="addToCart('${itemId}', '${itemName}', '${itemPrice}', '${itemImg}')">
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

window.addToCart = async (itemId, itemName, itemPrice, itemImg) => {
  try {
    let singleProduct = {
      itemId,
      itemImg,
      itemName,
      itemPrice,
    };

    await addDoc(collection(db, `users/${userUid}/cart`), {
      ...singleProduct,
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

cartBtn.addEventListener("click", () => {
  cartList.innerHTML = "";
  let cartTotalPrice = 0;

  onSnapshot(collection(db, `users/${userUid}/cart`), (data) => {
    cartQuant = data.size;
    if (cartQuant) {
      btn.disabled = false;
      data.docChanges().forEach((singleCartProduct) => {
        const cartProductPrice = +singleCartProduct.doc.data().itemPrice;
        if (singleCartProduct.type === "added") {
          const cartProductId = singleCartProduct.doc.data().itemId;
          const cartProductImg = singleCartProduct.doc.data().itemImg;
          const cartProductTitle = singleCartProduct.doc.data().itemName;
          cartTotalPrice += cartProductPrice;

          cartList.innerHTML += `
                    <li class="cartProductList mt-3" id="${
                      singleCartProduct.doc.id
                    }">
                        <div class="cartProductDetailDiv">
                            <p><i class="fa-regular fa-circle" style="color: #4B1EB1;"></i></p>
                            <div class="cartProductImgDiv">
                                <img src=${cartProductImg} alt="">
                            </div>
                            <div class="cartProductTitle">
                                <p id="cartProductTitlePara">${cartProductTitle}</p>
                            </div>
                        </div>
                        <div class="cartProductPrice">
                            <p id="cartProductPricePara">$${cartProductPrice.toFixed(
                              2
                            )}</p>
                            <p id="xMark" onclick="delCartProduct('${
                              singleCartProduct.doc.id
                            }')"><i class="fa-solid fa-xmark fa-lg" style="color: #f55555;"></i></p>
                        </div>
                    </li>
                    `;
        } else if (singleCartProduct.type === "removed") {
          let delLi = document.getElementById(singleCartProduct.doc.id);
          if (delLi) {
            delLi.remove();
          }
          cartTotalPrice -= cartProductPrice;
        }
        cartTotalPricePara.innerHTML = `$${cartTotalPrice.toFixed(2)}`;
      });
    } else {
      $("#addChartCanvas").offcanvas("hide");
      btn.disabled = true;
    }
  });
});

const LogOutBtn = document.querySelector("#LogOutBtn");

LogOutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    localStorage.removeItem("userUid");
    location.href = "../index.html";
  });
});



window.delCartProduct = async (id) => {
  await deleteDoc(doc(db, `users/${userUid}/cart/`, id));
}