import { app } from "../../config.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    setDoc,
    doc,
    query,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const db = getFirestore(app);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

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


const downloadImageUrl = (file) => {
    return new Promise((resolve, reject) => {
        const restaurantImageRef = ref(storage, `restaurantImages/${localStorage.getItem("adminUid")}/${file.name}`);
        const uploadTask = uploadBytesResumable(restaurantImageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case 'paused':
                        break;
                    case 'running':
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
})

imgInput.addEventListener("change", async () => {
    if (imgInput.files.length > 0) {
        const file = imgInput.files[0];
        // imgOutput.src = "";
        imgUrl = await downloadImageUrl(file);
        spinnerBorder.style.display = "none";
        if (imgUrl) {
            imgOutput.src = imgUrl;
        }
    }
})

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
        location.href = "#imgInput"
    } else {
        let prevPrice;
        addItemBtn.innerHTML = `
                    <div class="spinner-border addItemBtnSpinner" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
        `;
        if (prevItemPriceValue) {
            prevPrice = prevItemPriceValue
        } else {
            prevPrice = ""
        }

        const itemDetail = {
            itemName: itemNameValue,
            itemDesc: itemDescValue,
            itemType: selectItemTypeValue,
            itemPrice: itemPriceValue,
            itemImg: imgUrl,
            prevPrice
        }
        await addDoc(collection(db, `restaurants/${adminUid}/menue`), {
            ...itemDetail
        });

        addItemBtn.innerHTML = "Save & Continue";
        imgOutput.src = "../../assets/imgGoesHere.png";
        itemName.value = "";
        itemDesc.value = "";
        selectItemType.value = "";
        itemPrice.value = "";
        prevItemPrice.value = "";
    }
})

const getItems = () => {
    const q = query(collection(db, `restaurants/${adminUid}/menue`));
    onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc.data());
            console.log(doc.id);
        });
    });

}

getItems()