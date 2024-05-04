const path = require("path");
const { createReadStream } = require("fs");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");


const downloadTemplateForUploadCategory = async (request, response) => {
    try {
        const __dirname = path.resolve();
        const file = `${__dirname}/src/template/Category.xlsx`;

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

module.exports = downloadTemplateForUploadCategory