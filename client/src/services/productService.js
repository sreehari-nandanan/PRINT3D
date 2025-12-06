import { db } from '../firebase';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';

const COLLECTION_NAME = 'products';

export const getAllProducts = async (category = null) => {
    try {
        let q = collection(db, COLLECTION_NAME);

        if (category && category !== 'All') {
            q = query(q, where('category', '==', category));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting products: ", error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        // First try to find by the numeric 'id' field (legacy from JSON)
        const q = query(collection(db, COLLECTION_NAME), where('id', '==', parseInt(id)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }

        // If not found, try by document ID (Firebase ID)
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting product: ", error);
        throw error;
    }
};

export const addProduct = async (productData) => {
    try {
        // We can let Firestore generate the ID, or manage our own numeric IDs if we want to keep compatibility
        // For now, let's just add it. If we need a numeric ID, we'd need a counter.
        // To keep it simple and consistent with the existing frontend that expects numeric IDs for routing sometimes,
        // we might want to generate one, but Firestore IDs are strings.
        // Let's stick to Firestore IDs for new products, but handle legacy numeric IDs in fetching.

        const docRef = await addDoc(collection(db, COLLECTION_NAME), productData);
        return { id: docRef.id, ...productData };
    } catch (error) {
        console.error("Error adding product: ", error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, productData);
        return { id, ...productData };
    } catch (error) {
        console.error("Error updating product: ", error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        return true;
    } catch (error) {
        console.error("Error deleting product: ", error);
        throw error;
    }
};

// Migration helper
export const migrateProductsToFirebase = async (products) => {
    const collectionRef = collection(db, COLLECTION_NAME);
    const results = [];

    for (const product of products) {
        // Check if product with this numeric ID already exists to avoid duplicates
        const q = query(collectionRef, where('id', '==', product.id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            const docRef = await addDoc(collectionRef, product);
            results.push({ ...product, firebaseId: docRef.id, status: 'migrated' });
        } else {
            results.push({ ...product, status: 'skipped (exists)' });
        }
    }
    return results;
};
