//Dependencies
const express = require('express');
const router = express.Router();
const { upload, upload2, } = require('../config/misc');
const { EnsureAuthenticated, } = require('../config/auth/ensureAuth');

// Unprotected Controllers
const { landing, index, notice, analysis, }
    = require('../controllers/unprotected.js');

// Protected Controllers
const { add, adda, editie, edit, bio, bioe, quotea, quote, expe, expd, }
    = require('../controllers/protected.js');

//GET Routes (Unprotected)
//The landing page
router.get('/', landing);

//The hotelier page
router.get('/index', index);

//Unauth access
router.get('/notice', notice);

//GET Routes (Protected)
//Th add quote page
router.get('/quote', EnsureAuthenticated, quote);

//Th edit experience page
router.get('/edit', EnsureAuthenticated, edit);

//Add experience page
router.get('/add', EnsureAuthenticated, add);

//Individual experience edit page
router.get('/edit/:id', EnsureAuthenticated, editie);

//Edit personal info. page
router.get('/bio', EnsureAuthenticated, bio);

//POST Routes (Unprotected)
//Get IP
router.post('/analysis', analysis);

//POST Routes (Protected)
//Add quote
router.post('/quote', EnsureAuthenticated, upload.single('file'), quotea);

//Add experience
router.post('/add', EnsureAuthenticated, adda);

//PUT Routes
//Edit Personal Info.
router.put('/bio', EnsureAuthenticated, upload2.single('file'), bioe);

//Edit experience
router.put('/edit/:id', EnsureAuthenticated, expe);

//DELETE Routes
//Delete experience
router.delete('/delete/:id', EnsureAuthenticated, expd);

//Export the Module
module.exports = router;