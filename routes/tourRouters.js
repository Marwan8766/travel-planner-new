const express = require('express');
const tourCintroller = require('../controllers/tourController');

const router = express.Router();

router.post('/', tourCintroller.createTour);

module.exports = router;
