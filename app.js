const path = require("path");
const fs = require("fs");
const MONGO_USER = "prateek_2016bcs1188",
    MONGO_PASSWORD = "Sunny4321",
    MONGO_DEFAULT_DATABASE = "fibi";
const MONGODB_URI = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0-dec2c.mongodb.net/${MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const express = require("express");
const app = express();
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
var cors = require("cors");
const imageRoutes = require("./routes/images");
var multer = require("multer");
var helmet = require("helmet");
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
var filefilter = (req, file, cb) => {
    if (
        file.mimeType === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};



app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(
    multer({storage:fileStorage,fileFilter:filefilter}).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(imageRoutes);
mongoose
    .connect(MONGODB_URI,{useFindAndModify:false})
    .then((result) => {
        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => console.log(err));
