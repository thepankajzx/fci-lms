/**
 * API Service (Firebase Version)
 * Handles all communication with Firebase Auth & Firestore.
 */
window.ApiService = class ApiService {
  
  // --- Auth & Users ---

  static async login(email, password) {
    try {
      const userCredential = await window.FirebaseAuth.signInWithEmailAndPassword(email, password);
      // Fetch user profile from Firestore
      const userDoc = await window.FirebaseDB.collection('users').doc(userCredential.user.uid).get();
      if (!userDoc.exists) {
        throw new Error('User profile not found in database.');
      }
      const userData = userDoc.data();
      return {
        id: userCredential.user.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: email,
        role: userData.role || 'Employee',
        department: userData.department
      };
    } catch (error) {
      console.error('Firebase Login Error:', error);
      throw new Error(error.message);
    }
  }

  static async signup(payload) {
    try {
      const userCredential = await window.FirebaseAuth.createUserWithEmailAndPassword(payload.email, payload.password);
      const user = userCredential.user;
      
      const userData = {
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        email: payload.email,
        role: payload.role || 'Employee',
        department: payload.department || 'HR',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Save to Firestore 'users' collection
      await window.FirebaseDB.collection('users').doc(user.uid).set(userData);

      return {
        id: user.uid,
        ...userData
      };
    } catch (error) {
      console.error('Firebase Signup Error:', error);
      throw new Error(error.message);
    }
  }

  // --- Admin User Management ---

  static async getUsers() {
    try {
      const snapshot = await window.FirebaseDB.collection('users').get();
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, users: users };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async addUser(userData) {
    // Note: Creating a secondary user via Firebase Auth on the client will sign out the current admin.
    // In a real production app, this requires a Cloud Function or Admin SDK.
    // For this prototype, we'll just insert the user record directly into Firestore without an Auth account,
    // OR we can simulate it for now.
    try {
      const fakeId = 'U' + new Date().getTime();
      await window.FirebaseDB.collection('users').doc(fakeId).set({
        ...userData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async removeUser(userId) {
    try {
      await window.FirebaseDB.collection('users').doc(userId).delete();
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // --- Dashboard & Analytics ---

  static async getDashboard() {
    // Dummy dynamic dashboard data for now
    try {
      const user = window.Auth.getUser();
      const snapshot = await window.FirebaseDB.collection('courses').where('status', '==', 'Active').get();
      let pending = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        pending.push({
          id: doc.id,
          name: data.course.name,
          time: '15 mins'
        });
      });

      return {
        success: true,
        data: {
          assigned: pending.length,
          completed: 0,
          progress: 0,
          pendingTasks: pending
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAdminData() {
    try {
      const usersSnap = await window.FirebaseDB.collection('users').get();
      return {
        success: true,
        totalUsers: usersSnap.size,
        totalCompleted: 0,
        avgScore: 0,
        recentActivity: []
      };
    } catch(error) {
      throw new Error(error.message);
    }
  }

  // --- Course Management (Phase 2) ---

  static async getCourses() {
    try {
      const snapshot = await window.FirebaseDB.collection('courses').get();
      const courses = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        courses.push({
          id: doc.id,
          name: data.course.name,
          category: data.course.category,
          status: data.status || 'Active'
        });
      });
      return { success: true, courses: courses };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async addCourse(courseData) {
    try {
      courseData.status = 'Active';
      courseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await window.FirebaseDB.collection('courses').add(courseData);
      return { success: true, id: docRef.id };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteCourse(courseId) {
    try {
      await window.FirebaseDB.collection('courses').doc(courseId).delete();
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
