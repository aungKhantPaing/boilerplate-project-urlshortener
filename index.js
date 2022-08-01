require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const urlModel = require("./urlModel");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongoose").Types;
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const getUrlHost = (input) => {
  try {
    const url = new URL(input);
    return url.host;
  } catch (e) {
    console.error(e);
    return null;
  }
};

app.post("/api/shorturl", async (req, res) => {
  const inputUrl = getUrlHost(req.body.url);
  dns.lookup(inputUrl, async (err, address, family) => {
    console.log({ inputUrl, err });
    if (!inputUrl || err) {
      res.json({ error: "Invalid URL" });
    } else {
      const url = await urlModel.create({
        original_url: req.body.url,
      });
      res.json({
        original_url: url.original_url,
        short_url: url._id.toString(),
      });
    }
  });
});

app.get("/api/shorturl/:shortUrl", async (req, res) => {
  const url =
    ObjectId.isValid(req.params.shortUrl) &&
    (await urlModel.findById(ObjectId(req.params.shortUrl)));
  if (!url) {
    res.json({ error: "No short URL found for the given input" });
  } else {
    const redirect = url && url.original_url;
    res.writeHead(302, { Location: redirect });
    res.end();
  }
});

(async () => {
  await db.connect(process.env.DB_URL);
  app.listen(port, function () {
    console.log(`Listening on port ${port}`);
  });
})();
