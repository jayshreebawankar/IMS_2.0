
async function checkTabAccess(tabAccess, tabName) {
    let isUserHasAccess = 0;
    tabAccess?.forEach(element => {
        if (element?.includes(tabName)) {
            isUserHasAccess++;
        }
    });

    return isUserHasAccess
};

module.exports = checkTabAccess;