
//multer helper function
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error || result?.code) {
                return reject(result)
            }
            return resolve(result)
        });
    });
};

module.exports = runMiddleware;