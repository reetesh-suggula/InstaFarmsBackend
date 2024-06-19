const express = require('express')
const router = express.Router()
const stayFlexiService = require('../services/stayflexiservice')
const db = require('../firebase/firebase');

router.get('/grouplocations', async (req, res) => {
  try {
    await stayFlexiService.getGroupLocations(groupId).then(data =>
      res.send(data)
    )
  } catch (err) {
    res.status(500);
  }
});

router.get('/grouphotelsbylocation', async (req, res) => {
  try {
    const location = req.query.location;
    if (location) {
      await stayFlexiService.getGroupHotelsByLocation(location).then(data =>
        res.send(data)
      )
    }
  } catch (err) {
    res.status(500);
  }
});

router.get('/getGroupHotels', async (req, res) => {
  try {
    await stayFlexiService.getGroupHotels(groupId).then(data =>
      res.send(data)
    )
  } catch (err) {
    res.status(500);
  }
});

router.post('/cancelBooking', async (req, res) => {
  try {
    const bookingId = req.query.bookingId;
    if (bookingId) {
      await stayFlexiService.cancelBooking(bookingId).then(data =>
        res.send(data)
      )
    }
  } catch (err) {
    res.status(500);
  }
});

router.get('/hotelcontent', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    if (hotelId) {
      await stayFlexiService.getHotelContent(hotelId).then(data =>
        res.send(data)
      )
    }
  } catch (err) {
    res.status(500);
  }
});

router.get('/hoteldetailadvanced', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    const checkIn = req.query.checkIn;
    const checkOut = req.query.checkOut;
    const discount = req.query.discount;
    await stayFlexiService.getHotelDetailAdvanced(hotelId, checkIn, checkOut, discount).then(data =>
      res.send(data)
    )
  } catch (err) {
    res.status(500);
  }
});

router.post('/perform-booking', async (req, res) => {
  try {
    const bookingDetails = req.body;
    await stayFlexiService.performBooking(bookingDetails).then(data =>
      res.send(data)
    )
  } catch (err) {
    res.status(500);
  }
});

router.post('/modify-booking', async (req, res) => {
  try {
    const bookingId = req.query.bookingId;
    const bookingDetails = req.body;
    await stayFlexiService.modifyBooking(bookingId, bookingDetails).then(data =>
      res.send(data)
    )
  } catch (err) {
    res.status(500);
  }
});


router.get('/bookinginfo', async (req, res) => {
  try {
    const bookingId = req.query.bookingId;
    if (bookingId) {
      await stayFlexiService.getBookinginfo(bookingId).then(data =>
        res.send(data)
      )
    }
    throw err;
  } catch (err) {
    res.status(500);
  }
});

router.get('/hotelcheckin', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    const date = req.query.date
    if (hotelId) {
      await stayFlexiService.getCheckInTimes(hotelId, date).then(data =>
        res.send(data)
      )
    }
    throw err;
  } catch (err) {
    res.status(500);
  }
});

router.get('/hotelcheckout', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    const date = req.query.date
    if (hotelId) {
      await stayFlexiService.getCheckoutTimes(hotelId, date).then(data =>
        res.send(data)
      )
    }
    throw err;
  } catch (err) {
    res.status(500);
  }
});


router.get('/hotelcalendar', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    if (hotelId) {
      await stayFlexiService.getHotelCalendar(hotelId, fromDate, toDate).then(data =>
        res.send(data)
      )
    }
    throw err;
  } catch (err) {
    res.status(500);
  }
});

router.get('/activepromocodes', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    if (hotelId) {
      await stayFlexiService.getActivePromoCodes(hotelId).then(data =>
        res.send(data)
      )
    }
    throw err;
  } catch (err) {
    res.status(500);
  }
});

router.get('/validpromocodes', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    const checkIn = req.query.checkIn;
    const checkOut = req.query.checkOut;
    const numRooms = req.query.numRooms;
    if (hotelId) {
      await stayFlexiService.getValidPromoCodes(hotelId, checkIn, checkOut, numRooms).then(data =>
        res.send(data)
      )
    }
    throw err;
  } catch (err) {
    res.status(500);
  }
});

router.get('/getpromocode', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    const checkIn = req.query.checkIn;
    const checkOut = req.query.checkOut;
    const numRooms = req.query.numRooms;
    if (hotelId) {
      await stayFlexiService.getDiscountForPromoCode(hotelId, checkIn, checkOut, numRooms).then(data =>
        res.send(data)
      )
    }
    throw err;
  } catch (err) {
    res.status(500);
  }
});

router.get('/updatehotelcontent', async (req, res) => {
  try {
    const hotelId = req.query.hotelId;
    if (hotelId) {
      const data = await stayFlexiService.getHotelContent(hotelId);
      const propertyCollection = db.collection('properties');
      await propertyCollection.doc(data.propertyId).set(data);
      res.status(200);
    }
  } catch (err) {
    res.status(500);
  }
});

router.get('/getProperties', async (req, res) => {
  try {
    const propertyCollection = db.collection('properties');
    const snapshot = await propertyCollection.get();
    const data = [];
    snapshot.forEach(doc => {
      data.push(doc.data());
    });
    res.send(data);
  } catch (err) {
    res.status(500);
  }
});


router.get('/synchotels', async (req, res) => {
  try {
    const data = await stayFlexiService.getGroupHotels()
    const propertyCollection = db.collection('properties');
    await Promise.all(data.map(async property => {
      const data = await stayFlexiService.getHotelDetailAdvanced(property.hotelId);
      await propertyCollection.doc(data.propertyId).set(data);
    }
    ));
    res.status(200).send('ok');
  } catch (err) {
    res.status(500);
  }
});

module.exports = router