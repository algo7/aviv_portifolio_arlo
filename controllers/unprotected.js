// Dependencies
const { expDistro, } = require('../config/misc');

//DB Connection
const { Quote_DB,
    Experience_DB,
    User_DB, } = require('../config/dataBase/mongoConnection');

//Winston
const miscLog = require('../config/system/log').get('miscLog');

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
};

// @desc Unauth access
// @route GET /notice
// @access Public
const notice = (req, res) => {
    res.sendStatus(404);
};

module.exports = { landing, index, notice, };