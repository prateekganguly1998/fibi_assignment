const express = require("express");
const router = express.Router();
const Image = require("../models/image");
var fs = require("fs");
const path = require("path");
const async = require("async");
var https = require("https");
//Method to save image if external url is used
function saveImageToDisk(url, localPath) {
    var fullUrl = url;
    var file = fs.createWriteStream(localPath);
    var request = https.get(url, function (response) {
        response.pipe(file);
    });
}
router.post("/addImage", async (req, res, next) => {
    if (req.file) {
        Image.findOne({ name: req.file.filename }).then(async (response) => {
            if (response) {
                return res.json({
                    message:
                        "Filename already exists, change name for uniqueness",
                });
            }
            if (
                req.file.mimetype !== "image/png" &&
                req.file.mimetype !== "image/jpg" &&
                req.file.mimetype !== "image/jpeg"
            ) {
                return res.json({
                    message: "File type is not an image. Choose another file",
                });
            }
            var image = {};
            if (req.file.size) {
                image = new Image({
                    url: path.join(
                        path.dirname(process.mainModule.filename),
                        "images",
                        `${req.file.filename}`
                    ),
                    name: req.file.filename,
                    type: req.file.mimetype,
                    metadata: {
                        Size: req.file.size,
                        extType: req.file.mimetype.split("/")[1],
                    },
                });
            } else {
                image = new Image({
                    url: path.join(
                        path.dirname(process.mainModule.filename),
                        "images",
                        `${req.file.filename}`
                    ),
                    name: req.file.filename,
                    type: req.file.mimetype,
                    metadata: { extType: req.file.mimetype.split("/")[1] },
                });
            }

            image.save();
            return res.json(image);
        });
    } else {
        async.auto({
            storeLocally: function (callback) {
                console.log(req.body.imageUrl);
                const imageUrl = req.body.imageUrl;
                const localPath = path.join(
                    path.dirname(process.mainModule.filename),
                    "images",
                    `${req.body.name}.${imageUrl.substring(
                        imageUrl.lastIndexOf(".") + 1,
                        imageUrl.length
                    )}`
                );
                saveImageToDisk(imageUrl, localPath);
                return callback(null, localPath);
            },
            storeInDB: [
                "storeLocally",
                function (parameter, callback) {
                    const _path = parameter.storeLocally;
                    const filedata = fs.statSync(_path);
                    var image = new Image({
                        url: _path,
                        name: req.body.name,
                        type: `image/${req.body.imageUrl.substring(
                            req.body.imageUrl.lastIndexOf(".") + 1,
                            req.body.imageUrl.length
                        )}`,
                        metadata: {
                            Size: filedata.size,
                            extType: req.body.imageUrl.substring(
                                req.body.imageUrl.lastIndexOf(".") + 1,
                                req.body.imageUrl.length
                            ),
                        },
                    });
                    image.save();
                    res.json(image);
                    callback(null);
                },
            ],
        });
        //Node.js Function to save image from External URL.
    }
});
router.get("/getImage", (req, res, next) => {
    const nameString = req.query.nameString;
    console.log(nameString);
    const page = req.query.page;
    const limit = req.query.limit;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    Image.find(
        {
            $text: {
                $search: nameString,
                $caseSensitive: false,
                $diacriticSensitive: false,
            },
        },
        { score: { $meta: "textScore" } }
    )
        .select("-__v")
        .then((result) => {
            res.json(result.splice(startIndex, endIndex));
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = router;
