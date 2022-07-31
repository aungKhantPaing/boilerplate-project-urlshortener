let mongoose = require("mongoose");

let UrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
  },
});

UrlSchema.index({ short_url: 1 });

module.exports = mongoose.model("Url", UrlSchema);
