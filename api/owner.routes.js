const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { getOwnerDetails } = require('../models/owner.model');
const { owner } = require('../firebase/document');

const ownerCollection = firestore.db.collection(owner);
// adding user to db after authentication

router.get('/', async (req, res) => {
    try {
        const snapshot = await ownerCollection.get();
        let owners = [];
        snapshot.forEach(doc => {
            owners.push({ id: doc.id, ...doc.data() });
        });
        return res.send(owners);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.post('/', async (req, res) => {
    try {
        const newOwner = req.body;
        const checkOwnerExists = await ownerCollection.where('email', '==', newOwner.email).get();
        if(!checkOwnerExists.empty) {
            return res.status(400).send('Owner already exists');
        }
        const docRef = await ownerCollection.add(newOwner);
        res.send({ id: docRef.id});
    } catch (err) {
        console.log(err);
        res.status(500).send('Error creating document');
    }
});

module.exports = router