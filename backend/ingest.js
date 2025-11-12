// backend/ingest.js
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const db = require('./database');

async function ingestPDF(filePath, fileName) {
  try {
    console.log(`📄 Processing file: ${fileName}`);

    // Read PDF content
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      console.warn('⚠️ No text found in PDF.');
      return;
    }

    // Store extracted text in SQLite
    db.run(
      `INSERT INTO documents (filename, content) VALUES (?, ?)`,
      [fileName, text],
      (err) => {
        if (err) console.error('❌ Error saving to database:', err.message);
        else console.log(`✅ ${fileName} stored successfully in database.`);
      }
    );

    // (Optional) Remove uploaded file after processing to save space
    fs.unlink(filePath, (err) => {
      if (err) console.error('⚠️ Could not delete file:', err.message);
    });

  } catch (err) {
    console.error('❌ Error processing PDF:', err.message);
  }
}

module.exports = ingestPDF;
