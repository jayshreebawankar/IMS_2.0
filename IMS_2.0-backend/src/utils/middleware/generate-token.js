const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;


module.exports = function generateUserJWT(userId, name, email, mobile, roleId) {
    return jwt.sign({ userId, name, email, mobile, roleId }, secretKey, { expiresIn: process.env.JWT_EXPIRE_TIME });
}