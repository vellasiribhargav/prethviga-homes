const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to create a multer upload instance based on the folder name
const createUpload = (folderName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join('uploads', folderName); // Create folder path dynamically
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true }); // Create folder if it doesn't exist
      }
      cb(null, folderPath); // Set the folder destination
    },
    filename: (req, file, cb) => {
      const originalName = file.originalname;
      const filePath = path.join('uploads', folderName, originalName);

      // Check if the file already exists in the folder
      if (fs.existsSync(filePath)) {
        const error = new Error('File with the same name already exists. Please rename the file and try again.');
        error.status = 400;
        return cb(error);
      }

      // Proceed to save the file with the original name
      cb(null, originalName); // Save with original name
    },
  });

  // File filter to allow only PDFs
  const fileFilter = (req, file, cb) => {
    const allowedExtension = '.pdf';
    const allowedMimeType = 'application/pdf';

    const extname = path.extname(file.originalname).toLowerCase() === allowedExtension;
    const mimetype = file.mimetype === allowedMimeType;

    if (extname && mimetype) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed.'));
    }
  };

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB size limit
    fileFilter,
  });
};

// Create upload instances for both `policy` and `assetsale` folders
const uploadPolicy = createUpload('policy');
const uploadAssetSale = createUpload('assetsale');

// Export both upload functions
module.exports = {
  uploadPolicy,
  uploadAssetSale,
};
