const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { collectionOfProperties } = require('../firebase/document');
const multer = require('multer');

const upload = multer();
const bucket = firestore.storage.bucket();


const collectionOfPropertiesCollection = firestore.db.collection(collectionOfProperties);

router.get('/', async (req, res) => {
    try {
        const snapshot = await collectionOfPropertiesCollection.get();
        let amenities = [];
        snapshot.forEach(doc => {
            amenities.push({ id: doc.id, ...doc.data() });
        });
        return res.send(amenities);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});


const cpUpload = upload.fields([{ name: 'displayimage', maxCount: 1 }])

router.post('/', cpUpload, async (req, res) => {
    try {
        const newCollectionImage = req.files.displayimage[0];
        const checkPropertyExists = await collectionOfPropertiesCollection.where('name', '==', req.body.name).get();
        if (!checkPropertyExists.empty) {
            return res.status(400).send('Collection already exists');
        }
        const docRef = await collectionOfPropertiesCollection.add(req.body);
        const collectionId = docRef.id
        
        const displayImageBlob = bucket.file(`${collectionId}/collection_image/${newCollectionImage.originalname}`)
        const displayImageStream = displayImageBlob.createWriteStream({
            metadata: {
                contentType: newCollectionImage.mimetype
            }
        });

        await new Promise((resolve, reject) => {
            displayImageStream.on('error', (err) => {
                console.error('Error uploading file:', err);
                reject(err);
            });

            displayImageStream.on('finish', () => {
                resolve();
            });

            displayImageStream.end(newCollectionImage.buffer);
        });

       

        const displayImageUrl = await new Promise((resolve, reject) => {
            const blob = bucket.file(`${propertyId}/display_image/${newCollectionImage.originalname}`);
            blob.getSignedUrl({
                action: 'read',
                expires: Date.now() + 1000 * 60 * 60 * 24 * 7
            }, (err, url) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(url);
                }
            });
        });


        req.body.displayImage = displayImageUrl;

        await propertiesCollection.doc(propertyId).set(newProperty, { merge: true });


        res.send({ id: docRef.id });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error creating document');
    }
});



module.exports = router