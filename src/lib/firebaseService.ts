import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {}, // In a real app, populate from auth state if possible
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // Students
  subscribeToStudents: (schoolId: string, callback: (students: any[]) => void) => {
    const q = query(collection(db, `schools/${schoolId}/students`));
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(students);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `schools/${schoolId}/students`));
  },

  addStudent: async (schoolId: string, studentData: any) => {
    try {
      const docRef = await addDoc(collection(db, `schools/${schoolId}/students`), {
        ...studentData,
        schoolId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `schools/${schoolId}/students`);
    }
  },

  updateStudent: async (schoolId: string, studentId: string, studentData: any) => {
    try {
      const docRef = doc(db, `schools/${schoolId}/students`, studentId);
      await updateDoc(docRef, {
        ...studentData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `schools/${schoolId}/students/${studentId}`);
    }
  },

  // Classes
  subscribeToClasses: (schoolId: string, callback: (classes: any[]) => void) => {
    const q = query(collection(db, `schools/${schoolId}/classes`));
    return onSnapshot(q, (snapshot) => {
      const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(classes);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `schools/${schoolId}/classes`));
  },

  addClass: async (schoolId: string, classData: any) => {
    try {
      await addDoc(collection(db, `schools/${schoolId}/classes`), {
        ...classData,
        schoolId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `schools/${schoolId}/classes`);
    }
  },

  // Stats
  getDashboardStats: async (schoolId: string) => {
    try {
      const studentsSnap = await getDocs(collection(db, `schools/${schoolId}/students`));
      const classesSnap = await getDocs(collection(db, `schools/${schoolId}/classes`));
      const teachersSnap = await getDocs(collection(db, `schools/${schoolId}/teachers`));
      const financeSnap = await getDocs(collection(db, `schools/${schoolId}/finance`));

      const financeData = financeSnap.docs.map(d => d.data());
      const income = financeData.filter(d => d.type === 'INCOME').reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const expenses = financeData.filter(d => d.type === 'EXPENSE').reduce((acc, curr) => acc + (curr.amount || 0), 0);

      return {
        activeStudents: studentsSnap.size,
        teachersCount: teachersSnap.size,
        classesCount: classesSnap.size,
        income,
        expenses,
        balance: income - expenses,
        alerts: []
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/stats`);
    }
  }
};
