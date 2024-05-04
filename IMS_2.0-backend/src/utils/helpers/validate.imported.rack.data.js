function validateRackField(rackNo, partition) {
    if (["", null, undefined].includes(rackNo)) {
        return false;
    }

    if (["", null, undefined].includes(partition)) {
        return false;
    }

    return true;
};

module.exports = validateRackField;