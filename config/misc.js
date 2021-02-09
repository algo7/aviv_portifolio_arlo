// Dependencies
const multer = require('multer');
const crypto = require('crypto');
const miscLog = require('./system/log').get('miscLog');

// Experience distribution function
const expDistro = (experience) => {

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

};

// SHA1 hash function for file name
const hashFunc = (fileName, type) => {
    const hash = crypto.createHash('sha1');
    hash.update(fileName);
    const sha1sum = hash.digest('hex');
    miscLog.info(`${type} picture uploaded ${sha1sum}`);
    return sha1sum;
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

        // Hash the file name
        const sha1sum = hashFunc(file.originalname, 'Profile');

        //Get the extention
        let ext = '';
        try {
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
