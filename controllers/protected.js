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
// @route GET /edit/:section
// @access Private
const edit = async (req, res) => {

    try {

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
        let experience = await Experience_DB
            .find(queryObj)
            .sort({ date: -1, })
            .lean();


        res.render('experience/edit', {
            layout: 'id_based',
            experienceLeft: expDistro(experience)[0],
            experienceRight: expDistro(experience)[1],
            filterSelected: filterSelected,
            auth: loginStatus,
        });
    } catch (err) {
        miscLog.error(err);
    }
};

// @desc Add experience page
// @route GET /add
// @access Private
const add = (req, res) => {

    //Login status
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

    } catch (err) {
        res.status(500).send('Error Rendering the Edit Experience Page');
        miscLog.error(`Error Rendering the Edit Experience Page: ${err}`);
    }

};

// @desc Edit personal info. page
// @route GET /bio
// @access Private
const bio = async (req, res) => {
    try {
        //Login status
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
        res.status(500).send('Error Loading Bio');
        miscLog.error(err);
    }
};

// @The add quote route
// @route POST /quote
// @access Private
const quotea = async (req, res) => {

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
        await Quote_DB.create(newQuote);


        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error Adding Quote');
        miscLog.error(err);
    }

};

// @The add experience route
// @route POST /add
// @access Private
const adda = async (req, res) => {

    try {

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

    } catch (err) {
        res.status(500).send('Error Adding Experience!');
        miscLog.error(err);
    }
};

// @The edit personal info. route
// @route PUT /bio
// @access Private
const bioe = async (req, res) => {

    try {

        const { firstName, lastName, email,
            location, phone, interests,
            birthDay, study, bio,
            birthName, degree, resetPass,
            password, passwordC, } = req;

        // The new user object
        let updateUser = {
            firstName: firstName,
            lastName: lastName,
            password: null,
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
            const result = await resetFunc(updateUser, password, passwordC, req.user.id);

            // If the error array is there
            if (result) {
                return res.send(result);
            }

            return res.redirect('/');

        }

        // Remove the password field
        delete updateUser.password;

        // Call the update function
        await updateFunc(updateUser, req.user.id);


        res.redirect('/');

    } catch (err) {
        miscLog.error(`Error Editing personal info.${err}`);
        res.status(500).send('Error Editing personal info.');
    }


};


// @The edit experience route
// @route PUT /edit/:id
// @access Private
const expe = async (req, res) => {

    try {

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

    } catch (err) {
        res.status(500).send('Error Editing Experience!');
        miscLog.error(err);
    }


};

// @The delete experience route
// @route DELETE /delete/:id
// @access Private
const expd = async (req, res) => {

    try {
        // Remove the experience
        await Experience_DB
            .deleteOne({ _id: req.params.id, });

        res.redirect('/');

    } catch (err) {

        res.status(500).send('Error Deleting Experience!');
        miscLog.error(err);
    }
};

module.exports = { quotea, quote, edit, editie, add, adda, bio, bioe, expe, expd, };