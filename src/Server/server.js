import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";


export async function registerUserWithProfile(email, password, type, extraDetails) {
  try {
    // A. Create the authentication account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // B. Reference a document in the 'users' collection using the Auth UID
    const userDocRef = doc(db, "users", user.uid);

    // C. Write the custom profile data to Firestore
    await setDoc(userDocRef, {
      email: user.email,
      userType:type,
      approved:false,
      ...extraDetails, // Optional: great for managing user permissions
    });

    console.log("User authenticated and Firestore profile created successfully!");
    return user.uid;

  } catch (error) {
    console.error("Error during registration:", error.message);
    throw error;
  }
}

export const getFarmers = async () => {
  const userRef = collection(db,"users")
  const q = query(userRef,
    where("userType","==","farmer")
  )

  try {
    const snapshot = await getDocs(q)
    if(!snapshot.empty){
      return snapshot.docs.map(doc => ({
        id:doc.id,
        ...doc.data()
      }))
    }
    return []
  } catch (error) {
    console.error(error)
  }
}

export async function getTransportersByVehicleTypes(vehicleTypes){
  const userRef = collection(db,"users")
  const q = query(userRef,
    where("userType","==","transporter"),
    where("typeOfVehicle","in",vehicleTypes)
  )

  try {
    const snapshot = await getDocs(q)
    if(!snapshot.empty){
      return snapshot.docs.map(doc => ({
        id:doc.id,
        ...doc.data()
      }))
    }
    return []
  } catch (error) {
    console.error(error)
  }
}

export async function logOut(){
  try {
    await signOut(auth)
  } catch (error) {
    console.error(error)
  }
}

export async function getUserProfile(userId){
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef)
  if(userDoc.exists){
    return ({
      id:userDoc.id,
      ...userDoc.data()
    })
  }
  else return null
}

export async function placeOrder(orderObject){
	const ordersRef = collection(db,"orders")
	try{
		const docRef = await addDoc(ordersRef,{
			...orderObject,
			farmerApproval:"pending",
			transporterApproval:"pending",
			buyerPaid:"pending",
			status:"pending"
		})
		return docRef.id
	} catch (error) {
		console.error(error)
	}
}

export async function getOrderById(Id){
  const orderDocRef = doc(db, "orders", Id);
  const orderDoc = await getDoc(orderDocRef)
  if(orderDoc.exists){
    return ({
      id:orderDoc.id,
      ...orderDoc.data()
    })
  }
  else return null
}

export async function getOrderByTransporterId(id){
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef,
    where("transporter.id","==",id)
  )
  const ordersSnapshot = await getDocs(q)
  if(!ordersSnapshot.empty){
    return ordersSnapshot.docs.map(doc => (
    	{
		  id:doc.id,
		  ...doc.data()
		}
    ))
  }
  else return []
}

export async function getOrderByFarmerId(id){
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef,
    where("farmer.id","==",id)
  )
  const ordersSnapshot = await getDocs(q)
  if(!ordersSnapshot.empty){
    return ordersSnapshot.docs.map(doc => (
    	{
		  id:doc.id,
		  ...doc.data()
		}
    ))
  }
  else return []
}

export async function getOrderByBuyerId(id){
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef,
    where("buyer.id","==",id)
  )
  const ordersSnapshot = await getDocs(q)
  if(!ordersSnapshot.empty){
    return ordersSnapshot.docs.map(doc => (
    	{
		  id:doc.id,
		  ...doc.data()
		}
    ))
  }
  else return []
}

export async function updateOrderById(id,field,value){
  if(field !== "farmerApproval" && field !== "transporterApproval") return
  const orderDocRef = doc(db, "orders", id);
  try{
	  await updateDoc(orderDocRef,{
	  	[field]:value
	  })
  }catch (err){
  	console.error(err)
  }
  
}

import { collection, query, where, getDocs, doc, getDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

// ⚡ Tier 1 In-Memory Cache
const sessionCache = new Map();

function formatCoord(coords) {
  return `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
}

/**
 * Fetches only the farmers producing the selected crop, calculates distances,
 * caches data locally/globally, and returns them sorted closest-first.
 * 
 * @param {Object} buyerCoords - {lat: number, lng: number}
 * @param {string} selectedCrop - The crop type selected in the UI (e.g., "Apples")
 * @returns {Promise<Array>} - Filtered, calculated, and sorted farm list.
 */
export async function getMarketplaceByCrop(buyerCoords, selectedCrop) {
  try {
    // 1. Fetch ONLY farmers matching the selected crop from Firestore
    const farmersCollectionRef = collection(db, "farmers");
    
    // Assumes your Firestore document has a field like: produce: ["Apples", "Kale"]
    const cropQuery = query(
      farmersCollectionRef, 
      where("produce", "array-contains", selectedCrop)
    );
    
    const querySnapshot = await getDocs(cropQuery);
    
    const farmsArray = [];
    querySnapshot.forEach((doc) => {
      farmsArray.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (farmsArray.length === 0) return [];

    const firestoreChecks = [];
    const buyerKeyPart = formatCoord(buyerCoords);

    // --- TIER 1: INSTANT SESSION MEMORY LOOKUP ---
    farmsArray.forEach((farm) => {
      const farmKeyPart = formatCoord(farm.coords);
      const fullCacheKey = `${buyerKeyPart}__${farmKeyPart}`;

      if (sessionCache.has(fullCacheKey)) {
        farm.distanceInfo = sessionCache.get(fullCacheKey);
      } else {
        firestoreChecks.push({ farmReference: farm, cacheKey: fullCacheKey });
      }
    });

    if (firestoreChecks.length === 0) {
      return sortFarms(farmsArray);
    }

    // --- TIER 2: BATCH GLOBAL FIRESTORE CACHE CHECK ---
    const apiMisses = [];

    const dbPromises = firestoreChecks.map(async (item) => {
      const docRef = doc(db, "route_cache", item.cacheKey);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const payload = snap.data().payload;
        item.farmReference.distanceInfo = payload;
        sessionCache.set(item.cacheKey, payload); 
      } else {
        apiMisses.push(item); 
      }
    });

    await Promise.all(dbPromises);

    if (apiMisses.length === 0) {
      return sortFarms(farmsArray);
    }

    // --- TIER 3: GOOGLE DISTANCE MATRIX BACKEND ---
    const functions = getFunctions();
    const fetchMatrixDistance = httpsCallable(functions, 'fetchMatrixDistance');

    const payload = {
      buyer: buyerCoords,
      farmers: apiMisses.map(m => m.farmReference.coords)
    };

    const response = await fetchMatrixDistance(payload);
    const freshRoutes = response.data.routes;

    const batch = writeBatch(db);

    freshRoutes.forEach((routePayload, i) => {
      const missInfo = apiMisses[i];

      missInfo.farmReference.distanceInfo = routePayload;
      sessionCache.set(missInfo.cacheKey, routePayload);

      const docRef = doc(db, "route_cache", missInfo.cacheKey);
      batch.set(docRef, {
        buyer: JSON.stringify(buyerCoords),
        farmer: JSON.stringify(missInfo.farmReference.coords),
        payload: routePayload,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();

    return sortFarms(farmsArray);

  } catch (error) {
    console.error(`Error loading marketplace for crop: ${selectedCrop}`, error);
    return [];
  }
}

function sortFarms(farms) {
  return [...farms].sort((a, b) => {
    const distA = a.distanceInfo?.distanceMeters ?? Infinity;
    const distB = b.distanceInfo?.distanceMeters ?? Infinity;
    return distA - distB;
  });
}


