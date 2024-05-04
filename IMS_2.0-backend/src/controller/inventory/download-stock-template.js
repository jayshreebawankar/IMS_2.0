const path = require("path");
const { createReadStream } = require("fs");


const downloadTemplateForUploadStock = async (request, response) => {
    try {
        //check user have access of this tab or not
        const tabAccess = request.tab
        // const isUserHasAccess = await checkTabAccess(tabAccess, "category");
        // if (isUserHasAccess === 0) {
        //     response.status(200).json({
        //         status: "FAILED",
        //         message: "You don't have access to this tab."
        //     })
        //     return;
        // }
        const __dirname = path.resolve();
        const file = `${__dirname}/src/template/Stock.xlsx`;

        const src = createReadStream(file);
        src.pipe(response);
        src.on('close', () => {
            response.end()
        });

        response.sendFile(file);
        return;
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        });
    };
};

module.exports = downloadTemplateForUploadStock