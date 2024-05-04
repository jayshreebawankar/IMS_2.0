const checkTabAccess = require("../helpers/check-user-tab-access");

// Define the middleware function
const tabAccessMiddleware = (tabName) => {
    return async (request, response, next) => {
        const tabAccess = request.tab;

        // Check if the user has access to the tab
        const isUserHasAccess = await checkTabAccess(tabAccess, tabName);

        if (isUserHasAccess === 0) {
            // If user doesn't have access, send a response and stop further execution
            return response.status(200).json({
                status: "FAILED",
                message: "You don't have access to this tab."
            });
        }

        // If user has access, proceed to the next middleware or route handler
        next();
    };
};

module.exports = tabAccessMiddleware;
