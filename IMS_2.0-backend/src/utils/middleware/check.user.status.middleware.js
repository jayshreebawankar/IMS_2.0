// Middleware function to check user status
function checkUserStatusMiddleware(request, response, next) {
    const isActive = request.isActive;

    if (isActive === false) {
        response.status(200).json({
            status: "JWT_INVALID",
            message: "Your session has ended. Please login again."
        });
        return;
    }

    next();
}

module.exports = checkUserStatusMiddleware;
