const multer = require('multer');
const fs = require('fs');

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const path = `./public/excelUploads`;// file added to the public folder of the root directory
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
        cb(null, path)
    },
    filename: function (req, file, cb) {
        try {
            cb(null, file.originalname);
        } catch (error) {
            cb(error, null);
        }
    }
});

const fileType = multerFileTypeFilterForExcel = (req, file, cb) => {

    if (['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel.sheet.macroEnabled.12', 'application/vnd.ms-excel.sheet.binary.macroEnabled.12', 'application/vnd.openxmlformats-officedocument.spreadsheetml.template', 'application/vnd.ms-excel.template'].includes(file.mimetype)) {
        // check for extension also
        const extension = file.originalname.split('.').pop(); // this will give last element
        if (["xlsx", "xlsm", "xls", "xlsb", "xltx", "xlt"].includes(extension?.toLowerCase())) {
            cb(null, true);
        } else {
            cb({ code: "ONLY EXCEL SHEET ALLOWED" }, false);
        }
    } else {
        cb({ code: "ONLY EXCEL SHEET ALLOWED" }, false);
    }
}

const uploadExcel = multer({ storage: multerStorage, fileFilter: fileType });
module.exports = uploadExcel;
