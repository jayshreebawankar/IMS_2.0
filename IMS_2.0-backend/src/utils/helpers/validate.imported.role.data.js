const tabArray = require("./tab-array");



function validateRoleData(role, tabAccess) {
    if (["", null, undefined].includes(role) || !Array.isArray(tabAccess) || tabAccess.length === 0) {
        return false;
    }

    // Check if all tab names in the array are valid
    for (const tabName of tabAccess) {
        if (!(tabArray.some(tabArrayValue => tabName.toLowerCase() === tabArrayValue.toLowerCase()))) {
            return false;
        }
    }

    return true;
}

module.exports = validateRoleData;
