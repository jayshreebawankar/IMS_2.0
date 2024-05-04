const verifyCategory = require("./verify.category");

function validateParameterField(category, parameter) {
    if (["", null, undefined].includes(category) || !(verifyCategory(category))) {
        return false;
    };

    if (!Array.isArray(parameter) || parameter.length === 0) {
        return false;
    }

    return true;
};

module.exports = validateParameterField;