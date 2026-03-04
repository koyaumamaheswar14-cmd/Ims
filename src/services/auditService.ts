import { getFirebaseDb } from "../lib/firebase";
import { collection, addDoc, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { AuditLog } from "../types";

const AUDIT_COLLECTION = "audit_logs";

export const logAction = async (
  userId: string,
  userEmail: string,
  action: string,
  details: string,
  severity: AuditLog['severity'] = 'low',
  orgId?: string
) => {
  try {
    const db = getFirebaseDb();
    const log: Omit<AuditLog, "id"> = {
      userId,
      userEmail,
      action,
      details,
      severity,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      orgId: orgId || 'default',
    };
    await addDoc(collection(db, AUDIT_COLLECTION), log);
  } catch (error) {
    console.error("Failed to log action:", error);
  }
};

export const getAuditLogs = async (count = 50) => {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, AUDIT_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
  } catch (error: any) {
    console.error("Failed to fetch audit logs:", error);
    if (error.message?.includes("requires an index")) {
      console.warn("Firestore index missing for audit logs. Please follow the link in the console to create it.");
    }
    return [];
  }
};

export const getUserLogs = async (userId: string, count = 20) => {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, AUDIT_COLLECTION),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
  } catch (error: any) {
    console.error("Failed to fetch user logs:", error);
    if (error.message?.includes("requires an index")) {
      console.warn("Firestore index missing for user-specific audit logs. Please follow the link in the console to create it.");
    }
    return [];
  }
};
