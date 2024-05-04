const categoryArray = require("./category.array")

function verifyCategory(category) {
    return (categoryArray?.find((ele) => ele?.toLowerCase() === category?.toLowerCase()))
};

module.exports = verifyCategory