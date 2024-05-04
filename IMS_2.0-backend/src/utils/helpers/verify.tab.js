const tabArray = require("./tab-array");

function verifyTab(tabAccessArray) {
    const matchingTabs = [];

    for (const tabAccessItem of tabAccessArray) {
        for (const tab of tabArray) {
            if (tabAccessItem.toLowerCase() === tab.toLowerCase()) {
                matchingTabs.push(tab);
                break;  // Stop checking further once a match is found
            }
        }
    }
    return matchingTabs;
};
module.exports = verifyTab