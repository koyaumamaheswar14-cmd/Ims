import { getFirebaseDb } from "../lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { UserInvite, UserRole } from "../types";

const INVITES_COLLECTION = "invites";

export const createInvite = async (
  email: string, 
  roles: UserRole[], 
  invitedBy: string,
  orgId: string = "org_1"
): Promise<string> => {
  const db = getFirebaseDb();
  const inviteId = crypto.randomUUID();
  const invite: UserInvite = {
    id: inviteId,
    email,
    roles,
    orgId,
    invitedBy,
    invitedAt: Date.now(),
    status: 'pending',
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };

  await setDoc(doc(db, INVITES_COLLECTION, inviteId), invite);
  return inviteId;
};

export const getInviteByEmail = async (email: string): Promise<UserInvite | null> => {
  const db = getFirebaseDb();
  const q = query(
    collection(db, INVITES_COLLECTION), 
    where("email", "==", email),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const invite = snapshot.docs[0].data() as UserInvite;
  if (invite.expiresAt < Date.now()) {
    await updateDoc(doc(db, INVITES_COLLECTION, invite.id), { status: 'expired' });
    return null;
  }
  
  return invite;
};

export const acceptInvite = async (inviteId: string): Promise<void> => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, INVITES_COLLECTION, inviteId), { status: 'accepted' });
};
