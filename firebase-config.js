const firebaseConfig = {
  apiKey: "AIzaSyCAgMFuqobOQTOc5WmfVuZfNHAIdvJ4Vwo",
  authDomain: "salalahschooldatabase.firebaseapp.com",
  projectId: "salalahschooldatabase",
  storageBucket: "salalahschooldatabase.firebasestorage.app",
  messagingSenderId: "238841539748",
  appId: "1:238841539748:web:211e56160881c8c0f48a31",
  measurementId: "G-WTHY5MB9CF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
