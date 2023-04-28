const express = require('express');
const tripProgramController = require('../controllers/tripProgramController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.restrictTo('admin','company'));

router.route('/')
.post(tripProgramController.createTripProgram)
.get(tripProgramController.GetAllTripProgram)

router.route('/:id')
.get (tripProgramController.GetTripProgram)
.delete(authController.protect,tripProgramController.deleteTripProgram)
.patch(authController.protect,tripProgramController.UpdateTripProgram)


module.exports = router;