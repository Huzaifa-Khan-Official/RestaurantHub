import { app } from "../../config.js";

import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    doc,
    query,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

// adding subcollection in a firestore;
const addSubCollection = async () => {
                        // collection name
    const q = query(collection(db, "cities"));
    const querySnapshot = await getDocs(q);

    const queryData = querySnapshot.docs.map((detail) => ({
        ...detail.data(),
        id: detail.id,
    }));

    console.log(queryData);
    queryData.map(async (v) => {
        console.log(v.id);
        const docRef = await addDoc(collection(db, `cities/${v.id}/hello`), {
            name: "zain"
        });
        console.log("Document written with ID: ", docRef.id);

    })
}
// addDocument()