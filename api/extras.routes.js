const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { extrasplan } = require('../firebase/document');

const extrasplanCollection = firestore.db.collection(extrasplan);

router.get('/', async (req, res) => {
    try {
        const snapshot = await extrasplanCollection.get();
        let extrasplan = [];
        snapshot.forEach(doc => {
            extrasplan.push({ id: doc.id, ...doc.data() });
        });
        return res.send(extrasplan);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.post('/', async (req, res) => {
    try {
        const newExtraPlan = req.body;
        const checkExtraPlanExists = await extrasplanCollection.where('name', '==', newExtraPlan.name).get();
        if(!checkExtraPlanExists.empty) {
            return res.status(400).send('extra plan already exists');
        }
        const docRef = await extrasplanCollection.add(newExtraPlan);
        res.send({ id: docRef.id});
    } catch (err) {
        console.log(err);
        res.status(500).send('Error creating document');
    }
});



module.exports = router