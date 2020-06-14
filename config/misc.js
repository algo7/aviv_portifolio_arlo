//Dependencies
const multer = require('multer');
const crypto = require('crypto');
const hash = crypto.createHash('sha1');
const miscLog = require('./system/log').get('miscLog');

// Experience distribution function
const expDistro = (experience) => {

    const expLength = experience.length;
    const halfPoint = expLength / 2;
    const roundedHalfPoint = Math.round(expLength / 2);
    const rightSide = experience.slice(roundedHalfPoint);
    const sliceEndIndex = expLength - roundedHalfPoint;

    //If the rounded half point != the original half point
    //2 Array are not of the same length
    if (roundedHalfPoint != halfPoint) {
        const leftSide = experience.slice(0, sliceEndIndex + 1);
        return [leftSide, rightSide];

        //2 Array are of the same length
    } else {
        const leftSide = experience.slice(0, sliceEndIndex);
        return [leftSide, rightSide];
    }

};


//Multer DiskStorage Config
const diskStorage = multer.diskStorage({
    destination: 'assets/img/quote',
    filename: (req, file, call_back) => {

        //Hash the file name
        hash.update(file.originalname);
        const sha1sum = hash.digest('hex');
        miscLog.info(`Quote picture uploaded ${sha1sum}`);

        //Get the extention
        let ext = '';
        try {
            ext = file.mimetype.split('/')[1];
            //Prepend date to the file name hash
            call_back(null, `${Date.now()}_${sha1sum}.${ext}`);
        } catch (error) {
            miscLog.error(`Quote file upload error: ${error}`);
        }
    },
});

//Multer DiskStorage Config2
const diskStorage2 = multer.diskStorage({
    destination: 'assets/img/profile',
    filename: (req, file, call_back) => {

        //Hash the file name
        hash.update(file.originalname);
        const sha1sum = hash.digest('hex');
        miscLog.info(`Profile picture uploaded ${sha1sum}`);

        //Get the extention
        let ext = '';
        try {
            ext = file.mimetype.split('/')[1];
            //Prepend date to the file name hash
            call_back(null, `${Date.now()}_${sha1sum}.${ext}`);
        } catch (error) {
            miscLog.error(`Profile upload error: ${error}`);
        }
    },
});

//Create Multer Instance
const upload = multer({ storage: diskStorage, });
const upload2 = multer({ storage: diskStorage2, });

module.exports = { expDistro, upload, upload2, };
