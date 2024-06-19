const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { discounts } = require('../firebase/document');

const discountsCollection = firestore.db.collection(discounts);

router.get('/', async (req, res) => {
    try {
        const snapshot = await discountsCollection.get();
        let discounts = [];
        snapshot.forEach(doc => {
            discounts.push({ id: doc.id, ...doc.data() });
        });
        return res.send(discounts);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.post('/', async (req, res) => {
    try {
        const newdiscount = req.body;
        const checkdiscountExists = await discountsCollection.where('type' , '==', newdiscount.type).where('name', '==', newdiscount.name).get();
        if(!checkdiscountExists.empty) {
            return res.status(400).send('discount already exists');
        }
        const docRef = await discountsCollection.add(newdiscount);
        res.send({ id: docRef.id});
    } catch (err) {
        console.log(err);
        res.status(500).send('Error creating document');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const discount = req.body;
        const doc = await discountsCollection.doc(id).get();
        if (!doc.exists) {
            return res.status(404).send('discount not found');
        }
        await discountsCollection.doc(id).update(discount);
        res.send({ id, ...discount });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating document');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const doc = await discountsCollection.doc(id).get();
        if (!doc.exists) {
            return res.status(404).send('discount not found');
        }
        await discountsCollection.doc(id).delete();
        res.send({ id });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting document');
    }
});

module.exports = router