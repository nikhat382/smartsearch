// server.js
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Directories
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Extract text from PDF
async function extractText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text || "No text found in PDF.";
}

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log(" File received:", req.file.originalname);

    const textContent = await extractText(req.file.path);
    console.log(" Text extracted:", textContent.substring(0, 200)); // first 200 chars

    // Send extracted text to frontend
    res.json({
      message: "File uploaded successfully!",
      extractedText: textContent
    });

  } catch (err) {
    console.error(" Upload failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Ask route (simple keyword search in uploaded files)
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  // In this simple demo, we just echo back a message
  res.json({ answer: `You asked: "${question}". Uploaded text is available above.` });
});

app.listen(5000, () => console.log(" Server running at http://localhost:5000"));
