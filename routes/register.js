//Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { emptyInputCheck, } = require('express-suite');
// const { registerFunc, } = require('../config/auth/register');

//Redis
const { client, } = require('../config/dataBase/redisConnection');

//Empty Input Check Config
router.use(emptyInputCheck({
    checkGet: false,
    emptyBodyMsg: 'Empty Request',
    emptyFieldMsg: 'Some Fields are Missing',
    supressFieldKey: false,
}));

//GET Routes
//Login
router.get('/login', (req, res) => {
    res.render('auth/login', { layout: 'id_based', });
});

//Log Out
router.get('/out', (req, res) => {

    //Delete the session key in redis
    client.del(`sess:${req.sessionID}`);

    //Count redis keys
    client.keys('*', (err) => {

        if (err) {
            res.send(500).json({
                msg: 'Logout Error',
            });
            return;
        }
    });
    console.info('User Logged Out');

    //Express Logout func
    req.logOut();
    req.session.destroy();

    //Back to the login page
    res.redirect('/');

});


//POST Routes
//Login
router.post('/login', (req, res, next) => {

    //Using passport-local
    passport.authenticate('local', (err, user) => {

        //Check for error (the user's verification status)
        if (err) {
            return res.status(401)
                .json({
                    msg: 'Error Comparing Password',
                });
        }

        //If user object does not exist => login failed
        if (!user) {
            return res.status(401)
                .json({
                    msg: 'No Such User',
                });
        }


        //If all good, log the dude in
        req.logIn(user, (err) => {
            if (err) {
                return res.status(401)
                    .json({
                        msg: 'Login Error',
                    });
            }

            res.redirect('/');
            return;
        });
    })(req, res, next);
});

//Locked Routes
//Register
// router.get('/reg', (req, res) => {
//     res.render('auth/register', { layout: 'id_based', });
// });

//Register
// router.post('/reg', (req, res) => {

//     //Extract the request body
//     const { body, } = req;

//     // The registeration function
//     registerFunc(
//         body.firstName,
//         body.lastName,
//         body.password,
//         body.passwordC,
//         body.email
//     )
//         .then(result => {
//             //If the error array is there
//             if (result) {
//                 res.send(result);
//                 return;
//             }
//             res.sendStatus(200);
//         })
//         .catch(err => { console.log(err); });
// });


//Export the Module
module.exports = router;