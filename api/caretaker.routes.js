const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { careTaker } = require('../firebase/document');

const careTakerCollection = firestore.db.collection(careTaker);

router.get('/', async (req, res) => {
    try {
        const snapshot = await careTakerCollection.get();
        let careTaker = [];
        snapshot.forEach(doc => {
            careTaker.push({ id: doc.id, ...doc.data() });
        });
        return res.send(careTaker);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.post('/', async (req, res) => {
    try {
        const newCareTaker = req.body;
        // const checkCareTakerExists = await careTakerCollection.where('name', '==', newCareTaker.name).get();
        // if(!checkCareTakerExists.empty) {
        //     return res.status(400).send('CareTaker already exists');
        // }
        const docRef = await careTakerCollection.add(newCareTaker);
        res.send({ id: docRef.id});
    } catch (err) {
        console.log(err);
        res.status(500).send('Error creating document');
    }
});



module.exports = router