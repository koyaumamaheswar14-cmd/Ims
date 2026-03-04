import { getFirebaseDb } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { UserProfile, UserRole } from "../types";

const USERS_COLLECTION = "users";

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const db = getFirebaseDb();
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  const db = getFirebaseDb();
  await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile);
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const db = getFirebaseDb();
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, data);
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const db = getFirebaseDb();
  const q = query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as UserProfile);
};

export const updateUserRoles = async (uid: string, roles: UserRole[]): Promise<void> => {
  await updateUserProfile(uid, { roles });
};
