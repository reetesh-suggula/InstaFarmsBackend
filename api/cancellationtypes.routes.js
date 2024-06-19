const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { cancellationTypes } = require('../firebase/document');
const multer = require('multer');

const upload = multer();
const bucket = firestore.storage.bucket();

const cancellationTypesCollection = firestore.db.collection(cancellationTypes);

router.get('/', async (req, res) => {
    try {
        const snapshot = await cancellationTypesCollection.get();
        let cancellationTypes = [];
        snapshot.forEach(doc => {
            cancellationTypes.push({ id: doc.id, ...doc.data() });
        });
        return res.send(cancellationTypes);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.post('/', async (req, res) => {
    try {
        const newCancellationType = req.body;
        const checkCancellationTypeExists = await cancellationTypesCollection.where('name', '==', newCancellationType.name).get();
        if(!checkCancellationTypeExists.empty) {
            return res.status(400).send('Cancellation Type already exists');
        }
        const docRef = await cancellationTypesCollection.add(newCancellationType);
        res.send({ id: docRef.id});
    } catch (err) {
        console.log(err);
        res.status(500).send('Error creating document');
    }
});

module.exports = router