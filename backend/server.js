const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const Tesseract = require("tesseract.js");

const app = express();
app.use(cors());
app.use(express.json());

let documentText = ""; // store entire text of uploaded file

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const filePath = req.file.path;

    // OCR extraction
    const { data } = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log(m),
    });

    documentText = data.text; // store all text
    res.json({ message: "File uploaded and text extracted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OCR failed", error: error.message });
  }
});

// Search endpoint
app.post("/search", (req, res) => {
  const { query } = req.body;
  if (!documentText) return res.json({ message: "No document uploaded yet" });
  if (!query) return res.json({ message: "Query is empty" });

  const lowerQuery = query.toLowerCase();
  const sentences = documentText.split(/\n|\r|\./).filter((s) => s.trim() !== "");
  
  // Return all lines/sentences that include the keyword
  const results = sentences.filter((line) => line.toLowerCase().includes(lowerQuery));

  if (results.length === 0) {
    return res.json({ message: "No matching content found", results: [] });
  }
  res.json({ message: "Search completed", results });
});

app.listen(5000, () => console.log("Server started on port 5000"));
