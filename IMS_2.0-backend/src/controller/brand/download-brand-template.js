const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const path = require("path");
const { createReadStream } = require("fs");


const downloadTemplateForUploadBrand = async (request, response) => {
    try {
        const __dirname = path.resolve();
        const file = `${__dirname}/src/template/Brand.xlsx`;

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

module.exports = downloadTemplateForUploadBrand