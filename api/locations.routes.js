const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { locations, states, cities, areas } = require('../firebase/document');

// const locationsCollection = db.collection(locations);
const statesCollection = firestore.db.collection(states);
const citiesCollection = firestore.db.collection(cities);
const areasCollection = firestore.db.collection(areas);

router.get('/states', async (req, res) => {
  try {
    const snapshot = await statesCollection.get();
    let states = [];
    snapshot.forEach(doc => {
      states.push({ id: doc.id, ...doc.data() });
    });
    return res.send(states);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error getting documents');
  }
});

router.post('/states', async (req, res) => {
  try {
    const newState = req.body.name;
    const snapshot = await statesCollection.where('name', '==', newState).get();
    if (!snapshot.empty) {
      return res.status(400).send('State already exists');
    }
    const transaction = firestore.db.runTransaction(async (transaction) => {
      const docRef = statesCollection.doc();
      transaction.create(docRef, { name: newState, cityIds: [] });
      return docRef;
    });
    res.send({ id: transaction.id, ...newState });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error creating document');
  }
});

router.put('/states/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const doc = await statesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('State not found');
    }
    await statesCollection.doc(id).update({ name });
    res.send({ id, name });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating document');
  }
});

router.delete('/states/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await statesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('State not found');
    }
    await statesCollection.doc(id).delete();
    res.send('State deleted');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error deleting document');
  }
});

router.get('/cities', async (req, res) => {
  try {
    const snapshot = await citiesCollection.get();
    let cities = [];
    snapshot.forEach(doc => {
      cities.push({ id: doc.id, ...doc.data() });
    });
    return res.send(cities);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error getting documents');
  }
});

router.post('/cities', async (req, res) => {
  try {
    const newCity = req.body.city;
    const stateId = req.body.stateId;

    const statedocRef = await statesCollection.doc(stateId).get();
    if (!statedocRef.exists) {
      return res.status(404).send('State not found');
    }
    const stateData = statedocRef.data();
    const promises = stateData.cityIds.map(async id => {
      const targetDocSnapshot = await citiesCollection.doc(id).get();
      return targetDocSnapshot.data();
    });
    const results = await Promise.all(promises);
    const existingCity = results.find(city => city.name === newCity);
    if (existingCity) {
      return res.status(400).send('City already exists');
    }
    const citydocRef = await citiesCollection.add({ name: newCity, areaIds: [] });
    stateData.cityIds.push(citydocRef.id);
    await statesCollection.doc(stateId).update(stateData);
    res.send({ id: citydocRef.id, ...newCity });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error creating document');
  }
});

router.delete('/cities', async (req, res) => {
  try {
    const stateId = req.body.stateId;
    const cityId = req.body.cityId;
    const doc = await citiesCollection.doc(cityId).get();
    if (!doc.exists) {
      return res.status(404).send('city not found');
    }
    const statedocRef = await statesCollection.doc(stateId).get();
    if (!statedocRef.exists) {
      return res.status(404).send('State not found');
    }
    const stateData = statedocRef.data();
    stateData.cityIds = stateData.cityIds.filter((id) => id !== cityId);
    await statesCollection.doc(stateId).update(stateData);
    await citiesCollection.doc(cityId).delete();
    res.send('city deleted');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error deleting document');
  }
});

router.put('/cities/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.city;
    const doc = await citiesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('City not found');
    }
    await citiesCollection.doc(id).update({ name });
    res.send({ id, name });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating document');
  }
});

router.get('/areas', async (req, res) => {
  try {
    const snapshot = await areasCollection.get();
    let areas = [];
    snapshot.forEach(doc => {
      areas.push({ id: doc.id, ...doc.data() });
    });
    return res.send(areas);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error getting documents');
  }
});

router.post('/areas', async (req, res) => {
  try {
    const newArea = req.body.area;
    const cityId = req.body.cityId;
    const weight = req.body.weight || 0;

    const citydocRef = await citiesCollection.doc(cityId).get();
    if (!citydocRef.exists) {
      return res.status(404).send('State not found');
    }
    const cityData = citydocRef.data();
    const promises = cityData.areaIds.map(async id => {
      const targetDocSnapshot = await areasCollection.doc(id).get();
      return targetDocSnapshot.data();
    });
    const results = await Promise.all(promises);
    const existingArea = results.find(area => area.name === newArea);
    if (existingArea) {
      return res.status(400).send('Area already exists');
    }
    const areadocRef = await areasCollection.add({ name: newArea, propertyIds: [], weight: 0 });
    cityData.areaIds.push(areadocRef.id);
    await citiesCollection.doc(cityId).update(cityData);
    res.send({ id: areadocRef.id, ...newArea });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error creating document');
  }
});

router.delete('/areas', async (req, res) => {
  try {
    const cityId = req.body.cityId;
    const areaId = req.body.areaId;
    const doc = await areasCollection.doc(areaId).get();
    if (!doc.exists) {
      return res.status(404).send('Area not found');
    }
    const citydocRef = await citiesCollection.doc(cityId).get();
    if (!citydocRef.exists) {
      return res.status(404).send('City not found');
    }
    const cityData = citydocRef.data();
    cityData.areaIds = cityData.areaIds.filter((id) => id !== areaId);
    await citiesCollection.doc(cityId).update(cityData);
    await areasCollection.doc(areaId).delete();
    res.send('Area deleted');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error deleting document');
  }
});

router.put('/areas/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.area;
    const doc = await areasCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('Area not found');
    }
    await areasCollection.doc(id).update({ name });
    res.send({ id, name });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating document');
  }
});



// adding user to db after authentication
// router.get('/data', async (req, res) => {
//   try {
//     let locationsdata = {}
//     const locations = await locationsCollection.doc('locations').get().then(doc => {
//         if (!doc.exists) {
//             console.log('No such document!');
//         } else {
//             locationsdata = doc.data();
//         }
//     })
//     .catch(err => {
//         console.error('Error getting document:', err);
//     });
//     return res.send(locationsdata);
//   } catch (err) {
//     console.log(err)
//     res.status(500);
//   }
// });

module.exports = router