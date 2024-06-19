const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const { getUserDetails } = require('../models/user.model');
const { user } = require('../firebase/document');

const userCollection = firestore.db.collection(user);
// adding user to db after authentication
router.post('/signIn', async (req, res) => {
  try {
    const reqBody = req.body;
    const phoneNumber = reqBody.phoneNumber;
    const checkUser = await userCollection.where('phoneNumber', '==', phoneNumber).get();
    if (checkUser.size > 0) {
      const check = checkUser.docs[0].data();
      if (check.firstName =='' && check.lastName =='' && check.email =='') {
        return res.status(200).send({message: 'User already exists', missingData: true});
      } else {
        return res.status(400).send('User already exists');
      }
    } else {
      const userDetails = getUserDetails(reqBody.firstName, reqBody.lastName, reqBody.email, reqBody.phoneNumber)
      await userCollection.add({...userDetails, createdAt: new Date()}).then(() => {
        return res.status(200).send({message: 'User added successfully', missingData:true});
      }).catch((err) => {
        res.status(500);
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500);
  }
});


router.put('/updateUser', async (req, res) => {
  try {
    const reqBody = req.body;
    const phoneNumber = reqBody.phoneNumber;
    const checkUser = await userCollection.where('phoneNumber', '==', phoneNumber).get();
    if (checkUser.size > 0) {
      const userDetails = checkUser.docs[0].data();
      userDetails = [...userDetails, ...reqBody]
      await userCollection.doc(userDetails.id).set({...userDetails, updatedAt: new Date()}).then(() => {
        return res.status(200).send('User updated successfully');
      }).catch((err) => {
        res.status(500);
      })
    } else {
      return res.status(400).send('User does not exist');
    }
  } catch (err) {
    console.log(err)
    res.status(500);
  }
}
);

// router.post('/signIn', async (req, res) => {
//   try {
//     let status = false;
//     console.log(req.body)
//     const userDetails = getUserDetails(req.body.firstName, req.body.lastName, req.body.email, req.body.phoneNumber)
//     console.log(userDetails)
//     await userCollection.doc(userDetails.uid).set({...userDetails, createdAt: new Date()},{ merge: true }).then(() => {
//       status = true;
//     }).catch((err) => {
//       status = false;
//       throw err;
//     })
//     return res.status(200).send(status);
//   } catch (err) {
//     console.log(err)
//     res.status(500);
//   }
// });


router.get('/bookingDetails', async (req, res) => {
  try {
    const userId = req.query.userId;
    const bookingSnapshot = await userCollection.doc(userId).collection('bookings').get();
    const bookingDetails = [];
    bookingSnapshot.forEach((doc) => {
      bookingDetails.push(doc.data());
    });
    return res.status(200).send(bookingDetails);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

router.get('bookings/:bookingId', async (req, res) => {
  try {
    const userId = req.query.userId;
    const bookingId = req.params.bookingId;
    const bookingSnapshot = await userCollection.doc(userId).collection('bookings').doc(bookingId).get();
    return res.status(200).send(bookingSnapshot.data());
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

router.get('cancelBooking/:bookingId', async (req, res) => {
  try {
    const userId = req.query.userId;
    const bookingId = req.params.bookingId;
    await userCollection.doc(userId).collection(',cancelledbookings').doc(bookingId).delete();
    return res.status(200).send('Booking cancelled');
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

module.exports = router