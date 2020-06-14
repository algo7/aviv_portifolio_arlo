//Dependencies
const express = require('express');
const router = express.Router();
const { expDistro, upload, } = require('../config/misc');
const { EnsureAuthenticated, } = require('../config/auth/ensureAuth');
const { updateFunc, } = require('../config/auth/auth');
//DB Connection
const { Quote_DB, Experience_DB, User_DB, } = require('../config/dataBase/mongoConnection');

//GET Routes (Unprotected)
//The landing page
router.get('/', async (req, res) => {

    //Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    //Get experience
    let user = await User_DB
        .findOne({})
        .lean()
        .catch(err => console.log(err));

    //Remove senstive fields from the user object
    let safeUser = user;
    delete safeUser.password;
    delete safeUser._id;

    //Render the page
    res.render('landing', {
        layout: 'landing',
        user: safeUser,
        auth: loginStatus,
    });
});

//The hotelier page
router.get('/index', async (req, res) => {

    //Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    //Get quotes authors
    let quoteAuthors = await Quote_DB
        .find()
        .lean()
        .catch(err => console.log(err));

    //The authors array
    const authorsArray = quoteAuthors.map(authors => authors.author);

    //Pick a random index from the authorsArray
    let randomAuthor = Math.floor(Math.random() * authorsArray.length);

    //Pick a quote from a random authors
    let quote = await Quote_DB
        .findOne({ author: authorsArray[randomAuthor], })
        .lean()
        .catch(err => console.log(err));

    //Get experience
    let experience = await Experience_DB
        .find({})
        .sort({ date: -1, })
        .lean()
        .catch(err => console.log(err));

    //Get experience
    let user = await User_DB
        .findOne({})
        .lean()
        .catch(err => console.log(err));



    //Remove senstive fields from the user object
    let safeUser = user;
    delete safeUser.password;
    delete safeUser._id;

    //Render the page
    res.render('index', {
        quote: quote.text,
        author: quote.author,
        description: quote.description,
        imgUrl: quote.imgUrl,
        experienceLeft: expDistro(experience)[0],
        experienceRight: expDistro(experience)[1],
        user: safeUser,
        auth: loginStatus,
    });
});

//Unauth access
router.get('/notice', (req, res) => {
    res.sendStatus(404);
});

//GET Routes (Protected)
//Th add quote page
router.get('/quote', EnsureAuthenticated, (req, res) => {

    //Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }
    res.render('quote/quote', {
        layout: 'id_based',
        auth: loginStatus,
    });
});

//Th edit page
router.get('/edit', EnsureAuthenticated, async (req, res) => {

    //Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    //Get experience
    let experience = await Experience_DB
        .find({})
        .sort({ date: -1, })
        .lean()
        .catch(err => console.log(err));


    res.render('experience/edit', {
        layout: 'id_based',
        experienceLeft: expDistro(experience)[0],
        experienceRight: expDistro(experience)[1],
        auth: loginStatus,
    });
});

//Add experience page
router.get('/add', EnsureAuthenticated, (req, res) => {

    //Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    //Render the page
    res.render('experience/add', {
        layout: 'id_based',
        auth: loginStatus,
    });

});

//Individual experience edit page
router.get('/edit/:id', EnsureAuthenticated, async (req, res) => {

    //Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    //Check for valid input
    if ((req.params.id).length !== 24) {
        res.redirect('/');
        return;
    }

    //Get experience
    let experience = await Experience_DB
        .findById(req.params.id)
        .sort({ date: -1, })
        .lean()
        .catch(err => console.log(err));

    //Render the page
    res.render('experience/individual_edit', {
        layout: 'id_based',
        experience: experience,
        auth: loginStatus,
    });

});

//Edit personal info. page
router.get('/bio', EnsureAuthenticated, async (req, res) => {

    //Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    //Get user
    let user = await User_DB
        .findOne({})
        .lean()
        .catch(err => console.log(err));

    //Remove senstive fields from the user object
    let safeUser = user;
    delete safeUser.password;
    delete safeUser._id;

    //Render the page
    res.render('bio/bio', {
        layout: 'id_based',
        user: safeUser,
        auth: loginStatus,
    });
});

//POST Routes (Protected)
//Add quote
router.post('/quote', EnsureAuthenticated, upload.single('file'), (req, res) => {

    //Check if there is a picture
    if (!req.file) {
        res.status(400).send('A picture is required');
        return;
    }

    //The new quote object
    let newQuote = {
        author: req.body.author,
        description: req.body.description,
        text: req.body.text,
        imgUrl: req.file.path.replace('assets/', ''),
    };

    // Save the quote
    new Quote_DB(newQuote)
        .save()
        .then(res.redirect('/'))
        .catch(err => console.log(err));
});

//Add experience
router.post('/add', EnsureAuthenticated, (req, res) => {

    //Get the experience type
    let typeImageUrl = req.body.typeImageUrl;

    //Assign the correct image url base on the type
    switch (typeImageUrl) {
        case 'study':
            typeImageUrl = 'img/svg/degree-5.svg';
            break;
        case 'work':
            typeImageUrl = 'img/svg/portfolio.svg';
            break;
        default:
            res.send('Invalid Experience Type!');
            return;
    }

    //Set links for external website if there is any
    let hrefClass = 'href_location';
    let link = '#';
    if (req.body.link) {
        hrefClass = '';
        link = req.body.link;
    }

    //The new experience object
    let newExperience = {
        year: req.body.year,
        location: req.body.location,
        position: req.body.position,
        description: req.body.description,
        typeImageUrl: typeImageUrl,
        link: link,
        hrefClass: hrefClass,
    };

    new Experience_DB(newExperience)
        .save()
        .then(res.redirect('/'))
        .catch(err => console.log(err));

});


//PUT Routes
//Edit Personal Info.
router.put('/bio', EnsureAuthenticated, (req, res) => {
    const { body, } = req;

    //The new user object
    let updateUser = {
        firstName: body.firstName,
        lastName: body.lastName,
        password: null,
        email: body.email,
        birthDay: body.birthDay,
        birthName: body.birthName,
        location: body.location,
        phone: body.phone,
        interests: body.interests,
        study: body.study,
        degree: body.degree,
        bio: body.bio,
    };

    //Call the update function
    updateFunc(updateUser, body.password, body.passwordC, req.user.id)
        .then(result => {
            //If the error array is there
            if (result) {
                res.send(result);
                return;
            }
            res.redirect('/');
        })
        .catch(err => { console.log(err); });

});

//Edit experience
router.put('/edit/:id', EnsureAuthenticated, (req, res) => {

    //Get the experience type
    let typeImageUrl = req.body.typeImageUrl;

    //Assign the correct image url base on the type
    switch (typeImageUrl) {
        case 'study':
            typeImageUrl = 'img/svg/degree-5.svg';
            break;
        case 'work':
            typeImageUrl = 'img/svg/portfolio.svg';
            break;
        default:
            res.send('Invalid Experience Type!');
            return;
    }

    //Set links for external website if there is any
    let hrefClass = 'href_location';
    let link = '#';
    if (req.body.link) {
        hrefClass = '';
        link = req.body.link;
    }

    //Update the db
    Experience_DB
        .updateOne({ _id: req.params.id, }, {
            year: req.body.year,
            location: req.body.location,
            position: req.body.position,
            description: req.body.description,
            typeImageUrl: typeImageUrl,
            link: link,
            hrefClass: hrefClass,
        })
        .then(res.redirect('/edit'))
        .catch(err => console.log(err));
});

//DELETE Routes
//Delete experience
router.delete('/delete/:id', EnsureAuthenticated, (req, res) => {

    //Remove the experience
    Experience_DB
        .deleteOne({ _id: req.params.id, })
        .then(res.redirect('/'));
});

//Export the Module
module.exports = router;