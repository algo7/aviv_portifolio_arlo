//Dependencies
const express = require('express');
const router = express.Router();
const { expDistro, upload, upload2, } = require('../config/misc');
const { EnsureAuthenticated, } = require('../config/auth/ensureAuth');
const { resetFunc, updateFunc, } = require('../config/auth/auth');
const { quote, } = require('../controllers/protected.js');
//DB Connection
const { Quote_DB, Experience_DB, User_DB, } = require('../config/dataBase/mongoConnection');

//Winston
const analysisLog = require('../config/system/log').get('analysisLog');
const miscLog = require('../config/system/log').get('miscLog');

router.get('/xx', quote);

//GET Routes (Unprotected)
//The landing page
router.get('/', async (req, res) => {

    try {
        //Login Status
        let loginStatus = false;
        if (req.user) {
            loginStatus = true;
        }

        //Get userInfo
        let user = await User_DB
            .findOne({}, { _id: 0, password: 0, })
            .lean();

        //Render the page
        res.render('landing', {
            layout: 'landing',
            user: user,
            auth: loginStatus,
        });
    } catch (err) {
        miscLog.error(err);
    }
});

router.get('/te', EnsureAuthenticated, quote);

//The hotelier page
router.get('/index', async (req, res) => {

    try {

        //Login Status
        let loginStatus = false;
        if (req.user) {
            loginStatus = true;
        }

        //Get quotes authors
        let quoteAuthors = await Quote_DB
            .find()
            .lean();

        //The authors array
        const authorsArray = quoteAuthors.map(authors => authors.author);

        //Pick a random index from the authorsArray
        let randomAuthor = Math.floor(Math.random() * authorsArray.length);


        const [quote, experience, user] = await Promise.all([
            //Pick a quote from a random author
            Quote_DB
                .findOne({ author: authorsArray[randomAuthor], })
                .lean(),


            //Get experience
            Experience_DB
                .find({})
                .sort({ date: -1, })
                .lean(),


            //Get experience
            await User_DB
                .findOne({}, { _id: 0, password: 0, })
                .lean()
        ]);


        //Render the page
        res.render('index', {
            quote: quote.text,
            author: quote.author,
            description: quote.description,
            imgUrl: quote.imgUrl,
            experienceLeft: expDistro(experience)[0],
            experienceRight: expDistro(experience)[1],
            user: user,
            auth: loginStatus,
        });

    } catch (err) {

        miscLog.error(err);

    }
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

    try {
        //Login Status
        let loginStatus = false;
        if (req.user) {
            loginStatus = true;
        }

        //Get experience
        let experience = await Experience_DB
            .find({})
            .sort({ date: -1, })
            .lean();


        res.render('experience/edit', {
            layout: 'id_based',
            experienceLeft: expDistro(experience)[0],
            experienceRight: expDistro(experience)[1],
            auth: loginStatus,
        });
    } catch (err) {
        miscLog.error(err);
    }
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

    try {

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
            .lean();


        //Render the page
        res.render('experience/individual_edit', {
            layout: 'id_based',
            experience: experience,
            auth: loginStatus,
        });

    } catch (err) {
        miscLog.error(err);
    }


});

//Edit personal info. page
router.get('/bio', EnsureAuthenticated, async (req, res) => {

    try {
        //Login Status
        let loginStatus = false;
        if (req.user) {
            loginStatus = true;
        }

        //Get user
        let user = await User_DB
            .findOne({}, { _id: 0, password: 0, })
            .lean();



        //Render the page
        res.render('bio/bio', {
            layout: 'id_based',
            user: user,
            auth: loginStatus,
        });
    } catch (err) {
        miscLog.error(err);
    }
});

//POST Routes (Unprotected)
//Get IP
router.post('/analysis', (req, res) => {

    const { body, } = req;
    const ip = body.ip;
    const path = body.path;
    analysisLog.info(`${ip} | ${path}`);
    res.sendStatus(200);
});

//POST Routes (Protected)
//Add quote
router.post('/quote', EnsureAuthenticated, upload.single('file'), (req, res) => {

    try {

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
            .then(res.redirect('/'));


    } catch (err) {
        miscLog.error(err);
    }

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
        .catch(err => { miscLog.error(err); });

});


//PUT Routes
//Edit Personal Info.
router.put('/bio', EnsureAuthenticated, upload2.single('file'), (req, res) => {

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


    //Check if there is a picture
    if (req.file) {
        updateUser.profileImg = req.file.path.replace('assets/', '');
    }

    //If the reset switch is on
    if (body.resetPass === 'yes') {

        //Call the reset function
        resetFunc(updateUser, body.password, body.passwordC, req.user.id)
            .then(result => {
                //If the error array is there
                if (result) {
                    res.send(result);
                    return;
                }
                res.redirect('/');
            })
            .catch(err => { { miscLog.error(err); } });
        return;
    }

    //Remove the password field
    delete updateUser.password;

    //Call the update function
    updateFunc(updateUser, req.user.id)
        .then(result => {
            //If the error array is there
            if (result) {
                res.send(result);
                return;
            }
            res.redirect('/');
        })
        .catch(err => { { miscLog.error(err); } });

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
        .catch(err => { miscLog.error(err); });
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