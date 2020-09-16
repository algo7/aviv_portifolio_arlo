// Dependencies
const { expDistro, upload, upload2, } = require('../config/misc');

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

// @desc The edit page
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


module.exports = { quote, edit, };