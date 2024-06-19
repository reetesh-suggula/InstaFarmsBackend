let admin = require('firebase-admin');
const serviceAccount = require('./instafarms-serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: "instafarms-14ba5.appspot.com"});
const db = admin.firestore();
const storage = admin.storage();
module.exports = { db, storage };