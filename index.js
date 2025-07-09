// index.js or main.js in your Cloud Code
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

Parse.Cloud.define('subscribeToTopic', async (request) => {
  const token = request.params.token;

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    await admin.messaging().subscribeToTopic(token, 'all');
    return { success: true };
  } catch (e) {
    throw new Error(e.message);
  }
});
