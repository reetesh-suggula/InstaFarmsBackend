const axios = require('axios');
const url = `https://api.razorpay.com/v1/orders`;
var instance = new Razorpay({
    key_id: 'YOUR_KEY_ID',
    key_secret: 'YOUR_KEY_SECRET',
  });

async function triggerPayment(uid, amount, ){
    try{
        const orderResponse = await axios.post(url, {
            amount: 50000,  // Amount in paisa (example: 500 INR)
            currency: 'INR',
            receipt: 'order_rcptid_11',
            payment_capture: 1
          }, {
            headers: {
              Authorization: 'Bearer YOUR_RAZORPAY_API_KEY'
            }
          });
       
        const orderId = orderResponse.data.id;
        await admin.firestore().collection('orders').add({
            orderId,
        });
        return res.json({ orderId });
    }  catch(err){
        console.log(err);
    }
}
