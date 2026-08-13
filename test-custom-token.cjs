const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');

async function test() {
  try {
    const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
    admin.initializeApp({
      projectId: config.projectId,
    });
    const customToken = await getAuth().createCustomToken('test-uid-123');
    console.log("SUCCESS:", customToken);
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}
test();
