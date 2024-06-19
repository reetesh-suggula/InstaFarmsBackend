const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { properties } = require('../firebase/document');
const multer = require('multer');

const upload = multer();
const bucket = firestore.storage.bucket();



const propertiesCollection = firestore.db.collection(properties);

router.post('/uploadimages', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;

        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No files uploaded' });
            return;
        }

        const uploadPromises = files.map(file => {
            const blob = bucket.file(file.originalname);

            const stream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype
                }
            });

            return new Promise((resolve, reject) => {
                stream.on('error', (err) => {
                    console.error('Error uploading file:', err);
                    reject(err);
                });

                stream.on('finish', () => {
                    resolve();
                });

                stream.end(file.buffer);
            });
        });

        await Promise.all(uploadPromises);
        res.json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Error uploading files' });
    }
});

const cpUpload = upload.fields([{ name: 'displayimage', maxCount: 1 }, { name: 'files', maxCount: 8 }])

router.post('/', cpUpload, async (req, res) => {
    try {
        const files = req.files;
        const newProperty = req.body;
        const newPropertyImages = req.files.files;
        const newPropertyDisplayImage = req.files.displayimage[0];
        const checkPropertyExists = await propertiesCollection.where('name', '==', newProperty.originalName).get();
        if (!checkPropertyExists.empty) {
            return res.status(400).send('Property already exists');
        }
        const docRef = await propertiesCollection.add(newProperty);
        const propertyId = docRef.id
        const propertyImagesPromises = newPropertyImages.map(file => {
            const blob = bucket.file(`${propertyId}/property_images/${file.originalname}`)
            const stream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype
                }
            });

            return new Promise((resolve, reject) => {
                stream.on('error', (err) => {
                    console.error('Error uploading file:', err);
                    reject(err);
                });

                stream.on('finish', () => {
                    resolve();
                });

                stream.end(file.buffer);
            });
        });
        await Promise.all(propertyImagesPromises);

        const displayImageBlob = bucket.file(`${propertyId}/display_image/${newPropertyDisplayImage.originalname}`)
        const displayImageStream = displayImageBlob.createWriteStream({
            metadata: {
                contentType: newPropertyDisplayImage.mimetype
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

            displayImageStream.end(newPropertyDisplayImage.buffer);
        });

        const propertyImagesUrls = await Promise.all(newPropertyImages.map(async (file) => {
            const blob = bucket.file(`${propertyId}/property_images/${file.originalname}`);
            const [url] = await blob.getSignedUrl({
                action: 'read'
            });
            return url;
        }));

        const displayImageUrl = await new Promise((resolve, reject) => {
            const blob = bucket.file(`${propertyId}/display_image/${newPropertyDisplayImage.originalname}`);
            blob.getSignedUrl({
                action: 'read',
            }, (err, url) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(url);
                }
            });
        });

        newProperty.images = propertyImagesUrls;
        newProperty.displayImage = displayImageUrl;

        await propertiesCollection.doc(propertyId).set(newProperty, { merge: true });


        res.send({ id: docRef.id });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error creating document');
    }
});


router.get('/', async (req, res) => {
    try {
        const snapshot = await propertiesCollection.get();
        let properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        return res.send(properties);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.get('/propertiesByFilters', async (req, res) => {
    try {
        const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        const d = new Date();
        let day = weekday[d.getDay()];

        const adultCount = req.query.adultCount || 0;
        const childCount = req.query.childCount || 0;
        const minPrice = req.query.minPrice || 0;
        const maxPrice = req.query.maxPrice || 100000;
        const snapshot = await propertiesCollection.where('maxGuestCount', '>=', adultCount+childCount).get();
        //.where(`basePrice.${day}`, '<=', maxPrice).where(`basePrice.${day}`, '>=', minPrice).get();
        let properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        return res.send(properties);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});


router.get('/propertiesbylocation', async (req, res) => {
    try {
        const snapshot = await propertiesCollection.where('location', '==', req.query.location).get();
        let properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        return res.send(properties);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.get('/propertiesbyCollection', async (req, res) => {
    try {
        const snapshot = await propertiesCollection.where('collection', '==', req.query.collection).get();
        let properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        return res.send(properties);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
}
);

router.get('/properties/:id', async (req, res) => {
    try {
        const property = await propertiesCollection.doc(req.params.id).get();
        if (!property.exists) {
            return res.status(404).send('Property not found');
        }
        return res.send({ id: property.id, ...property.data() });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting document');
    }
});

 router.post('/bookproperty', async (req, res) => {
    try {
        const propertyId = req.body.propertyId;
        const property = await propertiesCollection.doc(propertyId).get();
        if (!property.exists) {
            return res.status(404).send('Property not found');
        }
        const propertyData = property.data();
        if (!propertyData.bookings) {
            propertyData.bookings = [];
        }
        propertyData.bookings.push(req.body);
        await propertiesCollection.doc(propertyId).set(propertyData, { merge: true });
        return res.send({ id: property.id, ...propertyData });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error booking property');
    }   
}   
);

router.post('/cancelbooking', async (req, res) => {
    try {
        const propertyId = req.body.propertyId;
        const bookingId = req.body.bookingId;
        const property = await propertiesCollection.doc(propertyId).get();
        if (!property.exists) {
            return res.status(404).send('Property not found');
        }
        const propertyData = property.data();
        if (!propertyData.bookings) {
            return res.status(404).send('No bookings found');
        }
        propertyData.bookings = propertyData.bookings.filter(booking => booking.id !== bookingId);
        await propertiesCollection.doc(propertyId).set(propertyData, { merge: true });
        return res.send({ id: property.id, ...propertyData });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error cancelling booking');
    }
});


router.post('/updateproperty', async (req, res) => {
    try {
        const propertyId = req.body.propertyId;
        const property = await propertiesCollection.doc(propertyId).get();
        if (!property.exists) {
            return res.status(404).send('Property not found');
        }
        await propertiesCollection.doc(propertyId).set(req.body, { merge: true });
        return res.send({ id: property.id, ...req.body });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating property');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await propertiesCollection.doc(req.params.id).delete();
        return res.send({ id: req.params.id });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting document');
    }
});

router.get('/propertiesbytimerange', async (req, res) => {
    try {
        const snapshot = await propertiesCollection.where('availableFrom', '<=', req.query.from).where('availableTo', '>=', req.query.to).get();
        let properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        return res.send(properties);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.get('/propertiesavailable', async (req, res) => {
    try {
        const snapshot = await propertiesCollection.where('availableFrom', '<=', req.query.from).where('availableTo', '>=', req.query.to).get();
        let properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        return res.send(properties);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.get('/propertiesbyprice', async (req, res) => {
    try {
        const snapshot = await propertiesCollection.where('price', '<=', req.query.price).get();
        let properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        return res.send(properties);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});

router.get('/propertiesbyrating', async (req, res) => {
    try {
        const snapshot = await propertiesCollection.where('rating', '>=', req.query.rating).get();
        let properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        return res.send(properties);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error getting documents');
    }
});








module.exports = router