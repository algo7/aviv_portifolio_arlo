// Dependencies
const { expDistro, } = require('../config/misc');

// DB Connection
const { Quote_DB,
    Experience_DB,
    User_DB, } = require('../config/dataBase/mongoConnection');

// Winston
const analyticsLog = require('../config/system/log').get('analyticsLog');

// Custom Error Class
// const ErrorResponse = require('../config/utils/customErrorClass');

// Async Handler
const asyncHandler = require('../config/middlewares/asyncHandler');

// @desc The landing page
// @route GET /
// @access Public
const landing = asyncHandler(async (req, res) => {

    // Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    // Get userInfo
    let user = await User_DB
        .findOne({}, { _id: 0, password: 0, })
        .lean();

    // Render the page
    res.render('landing', {
        layout: 'landing',
        user: user,
        auth: loginStatus,
    });
});

// @desc The index page
// @route GET /index
// @access Public
const index = asyncHandler(async (req, res) => {

    // Set page to be rendered
    let pageRender = null;

    // Set quote type
    let quoteType = null;

    // Set experience type
    let section = null;

    // Check path
    if (req.path === '/hotelier') {
        pageRender = 'main/hotelier';
        quoteType = 'hotelier';
        section = 'hotelier';
    } else {
        pageRender = 'main/developer';
        quoteType = 'developer';
        section = 'developer';
    }

    // Login Status
    let loginStatus = false;
    if (req.user) {
        loginStatus = true;
    }

    // Get quotes authors
    let quoteAuthors = await Quote_DB
        .find({ type: quoteType, })
        .lean();

    // The authors array
    const authorsArray = quoteAuthors.map(authors => authors.author);

    // Pick a random index from the authorsArray
    let randomAuthor = Math.floor(Math.random() * authorsArray.length);


    const [quote, experience, user] = await Promise.all([
        // Pick a quote from a random author
        Quote_DB
            .findOne({ author: authorsArray[randomAuthor], })
            .lean(),


        // Get experience
        Experience_DB
            .find({ section: section, })
            .sort({ date: -1, })
            .lean(),


        // Get user info (to display)
        User_DB
            .findOne({}, { _id: 0, password: 0, })
            .lean()
    ]);

    const expLeft = expDistro(experience)[0];
    const expRight = expDistro(experience)[1];

    // Render the page
    res.render(pageRender, {
        quote: quote.text,
        author: quote.author,
        description: quote.description,
        imgUrl: quote.imgUrl,
        experienceLeft: expLeft,
        experienceRight: expRight,
        user: user,
        auth: loginStatus,
    });

});

// @desc Unauth access
// @route GET /notice
// @access Public
const notice = (req, res) => {
    res.sendStatus(404);
};

// @desc Get IP
// @route POST /analysis
// @access Public
const analysis = (req, res) => {
    const { body, } = req;
    const ip = body.ip;
    const path = body.path;
    analyticsLog.info(`${ip} | ${path}`);
    res.sendStatus(200);
};

module.exports = { landing, index, notice, analysis, };