var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, default: "jpg" },
    metadata: { Size: String, extType: String },
});
imageSchema.path("name").index({ text: true, unique: false });
module.exports = mongoose.model("Image", imageSchema);
