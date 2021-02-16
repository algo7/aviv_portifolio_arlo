// Dependencies
const multer = require('multer');
const crypto = require('crypto');
const miscLog = require('./system/log').get('miscLog');

/**
* Experience distribution function for displaying the experience on the index page
* @param {Array<Object>} experience - An array of mongodb document
* @returns {Array<Object>} An array with 2 elements, each of them contains an equal amount of mongodb document if even number of inputs is given
*/
const expDistro = (experience) => {

    try {

        const expLength = experience.length;
        const halfPoint = expLength / 2;
        const roundedHalfPoint = Math.round(expLength / 2);
        const rightSide = experience.slice(roundedHalfPoint);
        const sliceEndIndex = expLength - roundedHalfPoint;

        // If the rounded half point != the original half point
        // 2 Array are not of the same length
        if (roundedHalfPoint != halfPoint) {
            const leftSide = experience.slice(0, sliceEndIndex + 1);
            return [leftSide, rightSide];

            // 2 Array are of the same length
        } else {
            const leftSide = experience.slice(0, sliceEndIndex);
            return [leftSide, rightSide];
        }
    } catch (err) {
        // Rethrow the error
        throw (`Error distributing the experience ${err}`);
    }

};

/**
* SHA1 hash function for the file name
* @param {String} fileName - The name of the file to be saved
* @param {String} type - The usage type of the file (quote or profile pig)
* @returns {String} the SHA1 hash of the file name
*/
const hashFunc = (fileName, type) => {
    try {
        const hash = crypto.createHash('sha1');
        hash.update(fileName + Date.now());
        const sha1sum = hash.digest('hex');
        miscLog.info(`${type} picture uploaded ${sha1sum}`);
        return sha1sum;
    } catch (err) {
        // Rethrow the error
        throw (`Error Hashing the File Name: ${err}`);
    }
};

// Multer DiskStorage Config
const diskStorage = multer.diskStorage({
    destination: 'assets/img/quote',
    filename: (req, file, call_back) => {

        // Hash the file name
        const sha1sum = hashFunc(file.originalname, 'Quote');

        // Get the extention
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

// Multer DiskStorage Config2
const diskStorage2 = multer.diskStorage({
    destination: 'assets/img/profile',
    filename: (req, file, call_back) => {

        //Get the extention
        let ext = '';
        try {
            // Hash the file name
            const sha1sum = hashFunc(file.originalname, 'Profile');

            ext = file.mimetype.split('/')[1];
            //Prepend date to the file name hash
            call_back(null, `${Date.now()}_${sha1sum}.${ext}`);
        } catch (error) {
            call_back('Image Upload Failed', null);
            miscLog.error(`Profile upload error: ${error}`);
        }
    },
});

// Create Multer Instance
const upload = multer({ storage: diskStorage, });
const upload2 = multer({ storage: diskStorage2, });

module.exports = { expDistro, upload, upload2, };
