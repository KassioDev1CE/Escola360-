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
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
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

  deleteStudent: async (schoolId: string, studentId: string) => {
    try {
      const docRef = doc(db, `schools/${schoolId}/students`, studentId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `schools/${schoolId}/students/${studentId}`);
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

  updateClass: async (schoolId: string, classId: string, classData: any) => {
    try {
      const docRef = doc(db, `schools/${schoolId}/classes`, classId);
      await updateDoc(docRef, {
        ...classData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `schools/${schoolId}/classes/${classId}`);
    }
  },

  deleteClass: async (schoolId: string, classId: string) => {
    try {
      const docRef = doc(db, `schools/${schoolId}/classes`, classId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `schools/${schoolId}/classes/${classId}`);
    }
  },

  // Teachers
  subscribeToTeachers: (schoolId: string, callback: (teachers: any[]) => void) => {
    const q = query(collection(db, `schools/${schoolId}/teachers`));
    return onSnapshot(q, (snapshot) => {
      const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(teachers);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `schools/${schoolId}/teachers`));
  },

  addTeacher: async (schoolId: string, teacherData: any) => {
    try {
      await addDoc(collection(db, `schools/${schoolId}/teachers`), {
        ...teacherData,
        schoolId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `schools/${schoolId}/teachers`);
    }
  },

  updateTeacher: async (schoolId: string, teacherId: string, teacherData: any) => {
    try {
      const docRef = doc(db, `schools/${schoolId}/teachers`, teacherId);
      await updateDoc(docRef, {
        ...teacherData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `schools/${schoolId}/teachers/${teacherId}`);
    }
  },

  deleteTeacher: async (schoolId: string, teacherId: string) => {
    try {
      const docRef = doc(db, `schools/${schoolId}/teachers`, teacherId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `schools/${schoolId}/teachers/${teacherId}`);
    }
  },

  // Finance
  subscribeToFinance: (schoolId: string, callback: (transactions: any[]) => void) => {
    const q = query(collection(db, `schools/${schoolId}/finance`));
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(transactions);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `schools/${schoolId}/finance`));
  },

  addTransaction: async (schoolId: string, transactionData: any) => {
    try {
      await addDoc(collection(db, `schools/${schoolId}/finance`), {
        ...transactionData,
        schoolId,
        date: transactionData.date || new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `schools/${schoolId}/finance`);
    }
  },

  // Schedules
  subscribeToSchedules: (schoolId: string, callback: (schedules: any) => void) => {
    const q = collection(db, `schools/${schoolId}/schedules`);
    return onSnapshot(q, (snapshot) => {
      const schedules: any = {};
      snapshot.docs.forEach(doc => {
        schedules[doc.id] = doc.data().slots;
      });
      callback(schedules);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `schools/${schoolId}/schedules`));
  },

  saveSchedule: async (schoolId: string, classId: string, slots: any[]) => {
    try {
      const docRef = doc(db, `schools/${schoolId}/schedules`, classId);
      await setDoc(docRef, {
        slots,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `schools/${schoolId}/schedules/${classId}`);
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
