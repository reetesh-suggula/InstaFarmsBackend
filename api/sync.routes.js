const express = require('express')
const router = express.Router()
const stayFlexiService = require('../services/stayflexiservice')
const firestore = require('../firebase/firebase');
const { locations } = require('../firebase/document');


router.get('/locations', async (req, res) => {
  try {
    const data = await stayFlexiService.getGroupLocations();
    const locationsMap = {}
    data.forEach(element => {
      let [locationCity, locationState] = element.split(',');
      locationState = locationState.trim();
      locationCity = locationCity.trim();
      if (!locationsMap[locationState]) {
        locationsMap[locationState] = [locationCity];
      } else if (!locationsMap[locationState].includes(locationCity)) {
        locationsMap[locationState].push(locationCity);
      }
    });
    const locationsCollection = firestore.db.collection(locations);
    await locationsCollection.doc('locations').set(locationsMap, { merge: true });
    res.send(data);
  } catch (err) {
    res.status(500);
  }
});

module.exports = router