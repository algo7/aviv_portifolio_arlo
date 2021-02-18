const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);


// Without arrow function
// const asyncHandler = function (fn) {
//     return function (req, res, next) {
//         return new Promise(function (resolve) {
//             resolve(fn(req, res, next));
//         }).catch(next);
//     };
// };

module.exports = asyncHandler;