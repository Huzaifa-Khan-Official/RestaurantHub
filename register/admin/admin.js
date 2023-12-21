import { app } from "../../config.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  query,
  deleteDoc,
  updateDoc,
  getDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import {
  onAuthStateChanged,
  getAuth,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = getFirestore(app);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();
const auth = getAuth();

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
  }
});

const adminUid = localStorage.getItem("adminUid");

const imgInputDiv = document.querySelector(".imgInputDiv");
const imgInput = document.querySelector("#imgInput");
const imgOutput = document.querySelector("#imgOutput");
const spinnerBorder = document.querySelector(".spinner-border");

const addItemBtn = document.querySelector("#addItemBtn");
const itemName = document.querySelector("#itemName");
const itemDesc = document.querySelector("#itemDesc");
const selectItemType = document.querySelector("#selectItemType");
const itemPrice = document.querySelector("#itemPrice");
const prevItemPrice = document.querySelector("#prevItemPrice");

let imgUrl;

const cardDiv = document.querySelector(".cardDiv");

const downloadImageUrl = (file) => {
  return new Promise((resolve, reject) => {
    const restaurantImageRef = ref(
      storage,
      `restaurantImages/${localStorage.getItem("adminUid")}/${file.name}`
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

imgInputDiv.addEventListener("click", () => {
  imgInput.click();
});

imgInput.addEventListener("change", async () => {
  if (imgInput.files.length > 0) {
    const file = imgInput.files[0];
    imgUrl = await downloadImageUrl(file);
    spinnerBorder.style.display = "none";
    if (imgUrl) {
      imgOutput.src = imgUrl;
    }
  }
});

addItemBtn.addEventListener("click", async () => {
  const itemNameValue = itemName.value;
  const itemDescValue = itemDesc.value;
  const selectItemTypeValue = selectItemType.value;
  const itemPriceValue = itemPrice.value;
  const prevItemPriceValue = prevItemPrice.value;

  if (itemNameValue == "") {
    location.href = "#itemName";
  } else if (itemDescValue == "") {
    location.href = "#itemDesc";
  } else if (selectItemTypeValue == "") {
    location.href = "#selectItemType";
  } else if (itemPriceValue == "") {
    location.href = "#itemPrice";
  } else if (!imgUrl) {
    location.href = "#imgInput";
  } else {
    let prevPrice;
    addItemBtn.innerHTML = `
                    <div class="spinner-border addItemBtnSpinner" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
        `;
    if (prevItemPriceValue) {
      prevPrice = prevItemPriceValue;
    } else {
      prevPrice = "";
    }

    const itemDetail = {
      itemName: itemNameValue,
      itemDesc: itemDescValue,
      itemType: selectItemTypeValue,
      itemPrice: itemPriceValue,
      itemImg: imgUrl,
      prevPrice,
      time: new Date().toLocaleString()
    };
    await addDoc(collection(db, `restaurants/${adminUid}/menue`), {
      ...itemDetail,
    });

    Swal.fire({
      title: "Congratulations!",
      text: "Item Added Successfully!",
      icon: "success"
  });

    addItemBtn.innerHTML = "Add Item";
    imgOutput.src = "../../assets/imgGoesHere.png";
    itemName.value = "";
    itemDesc.value = "";
    selectItemType.value = "";
    itemPrice.value = "";
    prevItemPrice.value = "";
  }
});

const getItems = () => {
  const q = query(collection(db, `restaurants/${adminUid}/menue`), orderBy("time"));
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((singleItem) => {
      if (querySnapshot.size) {
        const yourItems = document.querySelector(".yourItems");
        yourItems.style.display = "none";
      }

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

                        <div class="cardBtnDiv">
                            <button id="editItemBtn" data-bs-toggle="modal" data-bs-target="#editItemModal" onclick="editItem('${itemId}')">Edit Item <i class="fa-solid fa-pen-to-square"></i></button>
                        </div>

                        <div class="cardBtnDiv">
                            <button id="delBtn" onclick="delBtnFunction('${itemId}')">Delete Item <i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
                `;
      } else if (singleItem.type === "modified") {
        $("#editItemModal").modal("hide");
        let uItem = document.getElementById(singleItem.doc.id);
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
        uItem.setAttribute("id", itemId);
        uItem.innerHTML = `
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

                        <div class="cardBtnDiv">
                            <button id="editItemBtn" data-bs-toggle="modal" data-bs-target="#editItemModal" onclick="editItem('${itemId}')">Edit Item <i class="fa-solid fa-pen-to-square"></i></button>
                        </div>

                        <div class="cardBtnDiv">
                            <button id="delBtn" onclick="delBtnFunction('${itemId}')">Delete Item <i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
      }
    });
  });
};

getItems();

async function delBtnFunction(id) {
  await deleteDoc(doc(db, `restaurants/${adminUid}/menue`, id));
}

const EditimgOutput = document.querySelector("#EditimgOutput");
const EditItemName = document.querySelector("#EditItemName");
const EdititemDesc = document.querySelector("#EdititemDesc");
const EditItemType = document.querySelector("#EditItemType");
const editItemPrice = document.querySelector("#editItemPrice");
const editPrevItemPrice = document.querySelector("#editPrevItemPrice");

let updateItemId;
async function editItem(id) {
  const restRef = doc(db, `restaurants/${adminUid}/menue`, id);
  updateItemId = id;
  onSnapshot(restRef, (selectItem) => {
    if (selectItem.exists()) {
      const itemImg = selectItem.data().itemImg;
      const itemName = selectItem.data().itemName;
      const itemDesc = selectItem.data().itemDesc;
      const itemPrice = selectItem.data().itemPrice;
      const itemType = selectItem.data().itemType;
      const prevPrice = selectItem.data().prevPrice;

      EditimgOutput.src = itemImg;
      EditItemName.value = itemName;
      EdititemDesc.value = itemDesc;
      EditItemType.value = itemType;
      editItemPrice.value = itemPrice;
      editPrevItemPrice.value = prevPrice;
    }
  });
}

const editImgInputDiv = document.querySelector(".editImgInputDiv");
const editImgInput = document.querySelector("#editImgInput");
const updImgSpinner = document.querySelector(".updImgSpinner");

editImgInputDiv.addEventListener("click", () => {
  editImgInput.click();
});

let updateImgUrl;

const updateImgaeUrlLink = (file) => {
  return new Promise((resolve, reject) => {
    const restaurantImageRef = ref(
      storage,
      `restaurantImages/${localStorage.getItem("adminUid")}/${file.name}`
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
            updImgSpinner.style.display = "block";
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

editImgInput.addEventListener("change", async () => {
  if (editImgInput.files.length > 0) {

    const file = editImgInput.files[0];
    updateImgUrl = await updateImgaeUrlLink(file);
    updImgSpinner.style.display = "none";
    if (updateImgUrl) {
      EditimgOutput.src = updateImgUrl;
    }
  }
});

const editItemFunction = document.querySelector("#editItemfunction");
editItemFunction.addEventListener("click", async () => {
  const previousItemImgUrl = EditimgOutput.src;
  const updatedItemName = EditItemName.value;
  const updatedItemDesc = EdititemDesc.value;
  const updatedItemType = EditItemType.value;
  const updatedItemPrice = editItemPrice.value;
  const updatedItemPrevPrice = editPrevItemPrice.value;

  if (updatedItemName == "") {
    location.href = "#EditItemName";
  } else if (updatedItemDesc == "") {
    location.href = "#EdititemDesc";
  } else if (updatedItemType == "") {
    location.href = "#EditItemType";
  } else if (updatedItemPrice == "") {
    location.href = "#editItemPrice";
  } else {

    const itemRef = doc(db, `restaurants/${adminUid}/menue`, updateItemId);

    let prevPrice;
    let updateImageUrl;

    if (updateImgUrl) {
      updateImageUrl = updateImgUrl
    } else {
      updateImageUrl = previousItemImgUrl
    }

    if (updatedItemPrevPrice) {
      prevPrice = updatedItemPrevPrice;
    } else {
      prevPrice = "";
    }
    const itemDetail = {
      itemName: updatedItemName,
      itemDesc: updatedItemDesc,
      itemType: updatedItemType,
      itemPrice: updatedItemPrice,
      itemImg: updateImageUrl,
      prevPrice,
    };
    
    await updateDoc(itemRef, {
      ...itemDetail,
    });

    Swal.fire({
      title: "Congratulations!",
      text: "Item Updated Successfully!",
      icon: "success"
  });
  }
});

const LogOutBtn = document.querySelector("#LogOutBtn");

LogOutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    localStorage.removeItem("adminUid");
    location.href = "../../index.html";
  });
});

window.delBtnFunction = delBtnFunction;
window.editItem = editItem;
