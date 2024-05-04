function validateBlockFields(location, bockNo, isRackAdded) {
    if (["", null, undefined].includes(location)) {
        return false;
    }

    if (["", null, undefined].includes(bockNo)) {
        return false;
    }

    if (["", null, undefined].includes(isRackAdded)) {
        return false;
    }

    return true;
};

module.exports = validateBlockFields;