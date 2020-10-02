// Dependencies
const { expDistro, } = require('../config/misc');
const { resetFunc, updateFunc, } = require('../config/auth/auth');

//DB Connection
const { Quote_DB,
    Experience_DB,
    User_DB, } = require('../config/dataBase/mongoConnection');

//Winston
const miscLog = require('../config/system/log').get('miscLog');

// @desc The add quote page
// @route GET /quote
// @access Private
const quote = async (req, res) => {

    //Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }
    res.render('quote/quote', {
        layout: 'id_based',
        auth: loginStatus,
    });

};

// @desc The edit experience page
// @route GET /edit
// @access Private
const edit = async (req, res) => {

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
};

// @desc Add experience page
// @route GET /add
// @access Private
const add = async (req, res) => {

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

};

// @desc Individual experience edit page
// @route GET /edit/:id
// @access Private
const editie = async (req, res) => {

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

};

// @desc Edit personal info. page
// @route GET /bio
// @access Private
const bio = async (req, res) => {
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
};

// @The add quote route
// @route POST /quote
// @access Private
const quotea = (req, res) => {

    try {

        // Extract data from the request body
        const { type, author, description, text, } = req.body;

        //Check if there is a picture
        if (!req.file) {
            res.status(400).send('A picture is required');
            return;
        }

        //The new quote object
        let newQuote = {
            type: type,
            author: author,
            description: description,
            text: text,
            imgUrl: req.file.path.replace('assets/', ''),
        };

        // Save the quote
        new Quote_DB(newQuote)
            .save()
            .then(res.redirect('/'));


    } catch (err) {
        miscLog.error(err);
    }

};

// @The add experience route
// @route POST /add
// @access Private
const adda = (req, res) => {

    //Get the experience type (for the icon)
    let typeImageUrl = req.body.typeImageUrl;

    // Extract data from the request body
    const { type, year, location, position, description, } = req.body;

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
        type: type,
        year: year,
        location: location,
        position: position,
        description: description,
        typeImageUrl: typeImageUrl,
        link: link,
        hrefClass: hrefClass,
    };

    new Experience_DB(newExperience)
        .save()
        .then(res.redirect('/'))
        .catch(err => { miscLog.error(err); });

};

// @The edit personal info. route
// @route PUT /bio
// @access Private
const bioe = (req, res) => {

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

};

// @The edit experience route
// @route PUT /edit/:id
// @access Private
const expe = (req, res) => {

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
};

// @The delete experience route
// @route DELETE /delete/:id
// @access Private
const expd = (req, res) => {
    //Remove the experience
    Experience_DB
        .deleteOne({ _id: req.params.id, })
        .then(res.redirect('/'));
};

module.exports = { quotea, quote, edit, editie, add, adda, bio, bioe, expe, expd, };