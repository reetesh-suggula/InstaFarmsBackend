const express = require('express')
const router = express.Router()
const firestore = require('../firebase/firebase');
const Razorpay = require('razorpay');
const crypto = require('crypto'); 

router.post('/orders', async (req, res) => {
  try {
    const amount = req.query.amount;
    var instance = new Razorpay({ key_id: 'rzp_test_4E89JRRxUmZ6DH', key_secret: '1lqf9rs0bQfS1gQgd68PSLt0' })

    const order = await instance.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt#1",
    notes: {
        key1: "value3",
        key2: "value2"
    }
    })

    res.json(order);
  } catch (err) {
    res.status(500);
  }
});

router.post('/order/validate', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const secret = '1lqf9rs0bQfS1gQgd68PSLt0';      
    const sha = crypto.createHmac('sha256', secret);
    sha.update(orderId + "|" + paymentId);
    const generatedSignature = sha.digest('hex');
    if(generatedSignature === signature) {
        res.send('Success');
    } else {
        res.send('Failure');
    }
     
  } catch (err) {
    res.status(500);
  }
});

module.exports = router