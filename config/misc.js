//Dependencies
const multer = require('multer');

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
        //Prepend date to the filename
        call_back(null, Date.now() + '_' + file.originalname);
    },
});

//Multer DiskStorage Config2
const diskStorage2 = multer.diskStorage({
    destination: 'assets/img/about',
    filename: (req, file, call_back) => {
        //Prepend date to the filename
        call_back(null, Date.now() + '_' + file.originalname);
    },
});

//Create Multer Instance
const upload = multer({ storage: diskStorage, });
const upload2 = multer({ storage: diskStorage2, });

module.exports = { expDistro, upload, upload2, };