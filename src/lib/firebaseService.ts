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
  setDoc,
  orderBy,
  writeBatch
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
      // Ensure a unique RA if not provided
      const currentYear = new Date().getFullYear();
      let generatedRa = studentData.ra;
      
      if (!generatedRa || typeof generatedRa !== 'string' || generatedRa.trim() === '') {
        generatedRa = `${currentYear}${Math.floor(100000 + Math.random() * 900000)}`;
      }
      
      const docRef = await addDoc(collection(db, `schools/${schoolId}/students`), {
        ...studentData,
        ra: generatedRa,
        schoolId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ra: generatedRa };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `schools/${schoolId}/students`);
    }
  },

  updateStudent: async (schoolId: string, studentId: string, studentData: any) => {
    try {
      const docRef = doc(db, `schools/${schoolId}/students`, studentId);
      
      // Clean data for Firestore
      const { id, ...dataToSave } = studentData;
      
      let finalRa = dataToSave.ra;
      if (!finalRa || typeof finalRa !== 'string' || finalRa.trim() === '') {
        const currentYear = new Date().getFullYear();
        finalRa = `${currentYear}${Math.floor(100000 + Math.random() * 900000)}`;
      }

      await updateDoc(docRef, {
        ...dataToSave,
        ra: finalRa.trim(),
        updatedAt: serverTimestamp(),
      });
      return finalRa;
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

  // Performance Management (Grades and Attendance)
  saveGrades: async (schoolId: string, classId: string, subject: string, gradesData: any[]) => {
    try {
      const batch = writeBatch(db);
      gradesData.forEach(grade => {
        const docRef = doc(db, `schools/${schoolId}/students/${grade.studentId}/performance/${classId}_${subject}`);
        batch.set(docRef, {
          ...grade,
          subject,
          classId,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `schools/${schoolId}/students/grades`);
    }
  },

  getGradesByClass: async (schoolId: string, classId: string) => {
    try {
      const studentsQuery = query(collection(db, `schools/${schoolId}/students`), where('classId', '==', classId));
      const studentsSnapshot = await getDocs(studentsQuery);
      
      const studentsGrades = await Promise.all(studentsSnapshot.docs.map(async (studentDoc) => {
        const perfQuery = query(collection(db, `schools/${schoolId}/students/${studentDoc.id}/performance`));
        const perfSnapshot = await getDocs(perfQuery);
        return {
          studentId: studentDoc.id,
          studentName: studentDoc.data().name,
          performance: perfSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        };
      }));
      
      return studentsGrades;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/students/performance`);
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
  },

  // School Settings
  getSchoolConfig: async (schoolId: string) => {
    try {
      const docRef = doc(db, 'schools', schoolId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}`);
    }
  },

  updateSchoolConfig: async (schoolId: string, configData: any) => {
    try {
      const docRef = doc(db, 'schools', schoolId);
      await setDoc(docRef, {
        ...configData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `schools/${schoolId}`);
    }
  },

  // Student Occurrences
  addOccurrence: async (schoolId: string, studentId: string, occurrence: any) => {
    try {
      const colRef = collection(db, 'schools', schoolId, 'students', studentId, 'occurrences');
      await addDoc(colRef, {
        ...occurrence,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `schools/${schoolId}/students/${studentId}/occurrences`);
    }
  },

  getOccurrences: async (schoolId: string, studentId: string) => {
    try {
      const colRef = collection(db, 'schools', schoolId, 'students', studentId, 'occurrences');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/students/${studentId}/occurrences`);
    }
  },

  // Transfer Requests
  requestTransfer: async (schoolId: string, studentId: string, studentName: string, reason: string) => {
    try {
      const colRef = collection(db, 'schools', schoolId, 'transfers');
      await addDoc(colRef, {
        studentId,
        studentName,
        reason,
        status: 'pending',
        requestedAt: serverTimestamp(),
        authorEmail: auth.currentUser?.email
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `schools/${schoolId}/transfers`);
    }
  },

  subscribeToTransfers: (schoolId: string, callback: (transfers: any[]) => void) => {
    const colRef = collection(db, 'schools', schoolId, 'transfers');
    const q = query(colRef, orderBy('requestedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/transfers`);
    });
  },

  updateTransferStatus: async (schoolId: string, transferId: string, status: 'approved' | 'rejected', observations?: string) => {
    try {
      const docRef = doc(db, 'schools', schoolId, 'transfers', transferId);
      await setDoc(docRef, {
        status,
        observations,
        resolvedAt: serverTimestamp(),
        resolvedBy: auth.currentUser?.email
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `schools/${schoolId}/transfers/${transferId}`);
    }
  },

  getStudentTransfers: async (schoolId: string, studentId: string) => {
    try {
      const colRef = collection(db, 'schools', schoolId, 'transfers');
      const q = query(colRef, where('studentId', '==', studentId), orderBy('requestedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/transfers`);
    }
  }
};
