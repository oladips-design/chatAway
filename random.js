const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: "<your-cloud-name>",
  api_key: "<your-api-key>",
  api_secret: "<your-api-secret>",
});

// Configure Multer and Multer-Storage-Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "my-folder-name",
    allowed_formats: ["jpg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});
const upload = multer({ storage: storage });

// Define the endpoint that handles the file upload
app.post("/upload", upload.single("file"), (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse("No file uploaded", 400));
  }

  // Get the URL of the uploaded image from Cloudinary
  const imageUrl = req.file.path;

  // Do something with the image URL, like saving it to a database
  // ...

  res.status(200).json({
    success: true,
    data: imageUrl,
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
