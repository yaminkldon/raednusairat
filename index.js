const admin = require('firebase-admin');
const express = require('express');
const app = express();

app.use(express.json());

// Initialize Firebase using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // 🛠️ Convert escaped newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
});

// Subscribe endpoint
app.post('/subscribe', async (req, res) => {
  const { token } = req.body;

  try {
    await admin.messaging().subscribeToTopic(token, 'all');
    res.send({ success: true });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});
