// Dependencies
const { expDistro, } = require('../config/misc');
const { resetFunc, updateFunc, } = require('../config/auth/auth');

// DB Connection
const { Quote_DB,
    Experience_DB,
    User_DB, } = require('../config/dataBase/mongoConnection');

// Async Handler
const asyncHandler = require('../config/middlewares/asyncHandler');

// @desc The add quote page
// @route GET /quote
// @access Private
const quote = (req, res) => {

    //Login status
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
const edit = asyncHandler(async (req, res) => {

    const { section, } = req.query;

    // Experience edit page filter
    let queryObj = null;
    let filterSelected = null;

    if (!section ||
        section !== 'Hotelier' &&
        section !== 'Developer' &&
        section !== 'Martial Artist') {
        filterSelected = 'All';
        queryObj = {};
    } else {
        filterSelected = section;
        queryObj = { section: section.toLowerCase(), };
    }

    // Login status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    // Get experience
    const experience = await Experience_DB
        .find(queryObj)
        .sort({ date: -1, })
        .lean();

    const expLeft = expDistro(experience)[0];
    const expRight = expDistro(experience)[1];

    res.render('experience/edit', {
        layout: 'id_based',
        experienceLeft: expLeft,
        experienceRight: expRight,
        filterSelected: filterSelected,
        auth: loginStatus,
    });
});

// @desc Add experience page
// @route GET /add
// @access Private
const add = (req, res) => {

    // Login status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    // Render the page
    res.render('experience/add', {
        layout: 'id_based',
        auth: loginStatus,
    });

};

// @desc Individual experience edit page
// @route GET /edit/:id
// @access Private
const editie = asyncHandler(async (req, res) => {

    // Login status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    // Check for valid input
    if ((req.params.id).length !== 24) {
        return res.redirect('/');
    }

    // Get experience
    const experience = await Experience_DB
        .findById(req.params.id)
        .sort({ date: -1, })
        .lean();

    // Render the page
    res.render('experience/individual_edit', {
        layout: 'id_based',
        experience: experience,
        auth: loginStatus,
    });

});

// @desc Edit personal info. page
// @route GET /bio
// @access Private
const bio = asyncHandler(async (req, res) => {

    // Login status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    // Get the user
    const user = await User_DB
        .findOne({}, { _id: 0, password: 0, })
        .lean();

    // Render the page
    res.render('bio/bio', {
        layout: 'id_based',
        user: user,
        auth: loginStatus,
    });


});

// @The add quote route
// @route POST /quote
// @access Private
const quotea = asyncHandler(async (req, res) => {

    // Extract data from the request body
    const { type, author, description, text, } = req.body;

    //Check if there is a picture
    if (!req.file) {
        res.status(400).send('A picture is required');
        return;
    }

    //The new quote object
    const newQuote = {
        type: type,
        author: author,
        description: description,
        text: text,
        imgUrl: req.file.path.replace('assets/', ''),
    };

    // Save the quote
    await Quote_DB.create(newQuote);

    res.redirect('/');

});

// @The add experience route
// @route POST /add
// @access Private
const adda = asyncHandler(async (req, res) => {

    // Extract data from the request body
    const { type, year, location,
        position, description, link: reqLink,
        section, } = req.body;

    // Experience icon type
    let typeImageUrl = null;

    // Assign the correct image url base on the type
    switch (type) {
        case 'study':
            typeImageUrl = 'img/svg/degree.svg';
            break;
        case 'work':
            typeImageUrl = 'img/svg/work.svg';
            break;
        default:
            res.send('Invalid Experience Type!');
            return;
    }

    // Set links for external website if there is any
    let hrefClass = 'href_location';
    let link = '#';
    if (reqLink) {
        hrefClass = '';
        link = reqLink;
    }

    // The new experience object
    const newExperience = {
        type: type,
        section: section,
        year: year,
        location: location,
        position: position,
        description: description,
        typeImageUrl: typeImageUrl,
        link: link,
        hrefClass: hrefClass,
    };

    await Experience_DB.create(newExperience);

    res.redirect('/');

});

// @The edit personal info. route
// @route PUT /bio
// @access Private
const bioe = asyncHandler(async (req, res) => {

    const { firstName, lastName, email,
        location, phone, interests,
        birthDay, study, bio,
        birthName, degree, resetPass,
        password, passwordC, } = req;

    // The new user object
    let updateUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        birthDay: birthDay,
        birthName: birthName,
        location: location,
        phone: phone,
        interests: interests,
        study: study,
        degree: degree,
        bio: bio,
    };


    // Check if there is a picture
    if (req.file) {
        updateUser.profileImg = req.file.path.replace('assets/', '');
    }

    // If the reset switch is on
    if (resetPass === 'yes') {

        // Call the reset function
        await resetFunc(updateUser, password, passwordC, req.user.id);

        return res.redirect('/');
    }

    // Call the update function
    await updateFunc(updateUser, req.user.id);

    res.redirect('/');


});

// @The edit experience route
// @route PUT /edit/:id
// @access Private
const expe = asyncHandler(async (req, res) => {

    const { type, year, location,
        position, description, link: reqLink,
        section, } = req.body;

    // Experience icon type
    let typeImageUrl = null;

    // Assign the correct image url base on the type
    switch (type) {
        case 'study':
            typeImageUrl = 'img/svg/degree.svg';
            break;
        case 'work':
            typeImageUrl = 'img/svg/work.svg';
            break;
        default:
            res.status(400).send('Invalid Experience Type!');
            return;
    }

    //Set links for external website if there is any
    let hrefClass = 'href_location';
    let link = '#';
    if (reqLink) {
        hrefClass = '';
        link = reqLink;
    }

    //Update the db
    await Experience_DB
        .updateOne({ _id: req.params.id, }, {
            year: year,
            section: section,
            location: location,
            position: position,
            description: description,
            typeImageUrl: typeImageUrl,
            link: link,
            hrefClass: hrefClass,
        });

    res.redirect('/edit');

});

// @The delete experience route
// @route DELETE /delete/:id
// @access Private
const expd = asyncHandler(async (req, res) => {

    // Remove the experience
    await Experience_DB
        .deleteOne({ _id: req.params.id, });

    res.redirect('/');

});

module.exports = { quotea, quote, edit, editie, add, adda, bio, bioe, expe, expd, };