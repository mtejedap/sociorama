const express = require('express');
const applicationsController = require('../controllers/applicationsController');
const router = express.Router();

router.get('/', applicationsController.index);

router.get('/new', applicationsController.application_create_get);

module.exports = router;