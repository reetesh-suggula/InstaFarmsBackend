const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { amenities } = require('../firebase/document');

const amenitiesCollection = firestore.db.collection(amenities);
const multer = require('multer');

const upload = multer();
const bucket = firestore.storage.bucket();

router.get('/', async (req, res) => {
  try {
    const snapshot = await amenitiesCollection.get();
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

const cpUpload = upload.fields([{ name: 'iconImage', maxCount: 1 }, { name: 'files', maxCount: 8 }])
router.post('/', cpUpload, async (req, res) => {
  try {
    const newAmenity = req.body.name;
    const newAmenityIconImage = req.files.iconImage[0];
    const checkAmenity = await amenitiesCollection.where('name', '==', newAmenity).get();
    if (!checkAmenity.empty) {
      return res.status(400).send('Amenity already exists');
    }
    const iconImageUrl = await uploadImage(newAmenityIconImage, `amenities/${newAmenityIconImage.originalname}`);
    const docRef = await amenitiesCollection.add({ name: newAmenity, iconImage: iconImageUrl });
    res.send({ id: docRef.id, ...newAmenity });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error creating document');
  }
});

router.put('/:id', cpUpload, async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const doc = await amenitiesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('Amenity not found');
    }
    if (req.files.iconImage) {
      const iconImage = req.files.iconImage[0];
      const iconImageUrl = await uploadImage(iconImage, `amenities/${iconImage.originalname}`);
      await amenitiesCollection.doc(id).update({ name, iconImage: iconImageUrl });
      res.send({ id, name, iconImage: iconImageUrl });
    }
    else {
      await amenitiesCollection.doc(id).update({ name });
      res.send({ id, name });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating document');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await amenitiesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('Amenity not found');
    }
    await amenitiesCollection.doc(id).delete();
    res.send('Amenity deleted');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error deleting document');
  }
});

async function uploadImage(file, path) {
  const blob = bucket.file(path);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });
  await new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      console.error('Error uploading file:', err);
      reject(err);
    });

    blobStream.on('finish', () => {
      resolve();
    });

    blobStream.end(file.buffer);
  });
  const imageUrl = await new Promise((resolve, reject) => {
    const blob = bucket.file(path);
    blob.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    }, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
  return imageUrl;
}


module.exports = router