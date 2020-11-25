// Dependencies
const { expDistro, } = require('../config/misc');

//DB Connection
const { Quote_DB,
    Experience_DB,
    User_DB, } = require('../config/dataBase/mongoConnection');

//Winston
const miscLog = require('../config/system/log').get('miscLog');
const analysisLog = require('../config/system/log').get('analysisLog');

// @desc The landing page
// @route GET /
// @access Public
const landing = async (req, res) => {

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
};

// @desc The hotelier page
// @route GET /index
// @access Public
const index = async (req, res) => {

    // Set page to be rendered
    let pageRender = null;

    // Set quote type
    let quoteType = null;

    // Set experience type
    let expType = null;

    // Check path
    if (req.path === '/hotelier') {
        pageRender = 'main/hotelier';
        quoteType = 'hotelier';
        expType = 'hotelier';
    } else {
        pageRender = 'main/developer';
        quoteType = 'developer';
        expType = 'developer';
    }

    try {

        //Login Status
        let loginStatus = false;
        if (req.user) {
            loginStatus = true;
        }

        //Get quotes authors
        let quoteAuthors = await Quote_DB
            .find({ type: quoteType, })
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
                .find({ type: expType, })
                .sort({ date: -1, })
                .lean(),


            //Get user info (to display)
            User_DB
                .findOne({}, { _id: 0, password: 0, })
                .lean()
        ]);


        //Render the page
        res.render(pageRender, {
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
};

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
    analysisLog.info(`${ip} | ${path}`);
    res.sendStatus(200);
};

module.exports = { landing, index, notice, analysis, };