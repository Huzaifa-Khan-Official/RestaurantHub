import { app } from "../../config.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    query
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
    getStorage,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const db = getFirestore(app);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

const adminUid = localStorage.getItem("adminUid");

const cardDiv = document.querySelector(".cardDiv");

const getItems = () => {
    const restaurantId = localStorage.getItem("selectedRestaurantId")
    const q = query(collection(db, `restaurants/${restaurantId}/menue`));
    onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((singleItem) => {
            console.log(singleItem);
            
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
                    `
                }
                else {
                    strikePrice = ``;
                }
                cardDiv.innerHTML += `
                <div class="card col-lg-5 col-md-5 col-sm-5 col-12" id="${itemId}">
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
                </div>
                `;
            }
        });
    });

}

getItems();