const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

async function test() {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${config.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test-rest-api@example.com',
      password: 'superSecretPassword123!',
      returnSecureToken: true
    })
  });
  const data = await res.json();
  console.log(data);
}
test();
