// No filepath: for user to decide
const admin = require('firebase-admin');
const express = require('express');
const app = express();
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

app.post('/subscribe', async (req, res) => {
  const { token } = req.body;
  try {
    await admin.messaging().subscribeToTopic(token, 'all');
    res.send({ success: true });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

app.listen(3000);
