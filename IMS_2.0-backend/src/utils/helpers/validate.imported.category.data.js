function validateCategoryField(name) {
    if (["", null, undefined].includes(name)) {
        return false;
    }

    return true;
};

module.exports = validateCategoryField;