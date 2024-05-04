function validateStockField(location, bockNo, rackNo, category, parameter, brand, conditionType, status, itemCode, modelName, serialNo, quantity) {
    if (["", null, undefined].includes(location)) {
        return false;
    }

    if (["", null, undefined].includes(bockNo)) {
        return false;
    }

    if (["", null, undefined].includes(rackNo)) {
        return false;
    }

    if (["", null, undefined].includes(category)) {
        return false;
    }

    if (["", null, undefined].includes(parameter)) {
        return false;
    }

    if (["", null, undefined].includes(brand)) {
        return false;
    }

    if (["", null, undefined].includes(conditionType)) {
        return false;
    }

    if (["", null, undefined].includes(status)) {
        return false;
    }

    if (["", null, undefined].includes(itemCode)) {
        return false;
    }

    if (["", null, undefined].includes(serialNo)) {
        return false;
    }

    if (["", null, undefined].includes(quantity)) {
        return false;
    }

    if (["", null, undefined].includes(modelName)) {
        return false;
    }

    return true;
};

module.exports = validateStockField;