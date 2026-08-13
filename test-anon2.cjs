const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const fs = require('fs');

async function test() {
  try {
    const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
    const app = initializeApp(config);
    const auth = getAuth(app);
    const userCredential = await signInAnonymously(auth);
    console.log("SUCCESS:", userCredential.user.uid);
  } catch (error) {
    console.error("ERROR:", error.code, error.message);
  }
}
test();
