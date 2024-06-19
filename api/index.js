const express = require('express')
const router = express.Router()

router.route('/test').get((req, res) => {
    res.send('Server works!')
});

router.use('/hotelsinfo', require('./hotels.routes'));
router.use('/user', require('./user.routes'));
router.use('/owner', require('./owner.routes'));
router.use('/locations', require('./locations.routes'));
router.use('/sync', require('./sync.routes'));
router.use('/payment', require('./payment.routes'));
router.use('/properties', require('./properties.routes'));
router.use('/amenities', require('./amenities.routes'));
router.use('/discounts', require('./discount.routes'));
router.use('/extrasplan', require('./extras.routes'));
router.use('/cancellationtypes', require('./cancellationtypes.routes'));
router.use('/caretaker', require('./caretaker.routes'));
router.use('/collections', require('./collections.routes'));

module.exports = router