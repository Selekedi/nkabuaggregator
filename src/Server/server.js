import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";


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