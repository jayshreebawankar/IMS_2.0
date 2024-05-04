function validateUserFields(role, name, email, mobile, password, location) {

    if (["", null, undefined].includes(role)) {
        return false;
    }

    if (["", null, undefined].includes(name)) {
        return false;
    }

    if (["", null, undefined].includes(email)) {
        return false;
    }

    if (["", null, undefined].includes(mobile)) {
        return false;
    }

    if (["", null, undefined].includes(password)) {
        return false;
    }

    return true;
};

module.exports = validateUserFields;