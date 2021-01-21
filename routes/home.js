// ============ Node-Packages ============ 
const express = require('express');

// ============ My-Modules ============ 
const homeController = require('../controllers/homeController');

const router = express.Router();

router.get('/', homeController.getHome);

router.get('/roadmaps', homeController.getRoadmaps)

module.exports = router;
