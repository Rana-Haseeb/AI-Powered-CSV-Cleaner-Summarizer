const fs = require('fs');
const axios = require('axios');
const Report = require('../models/Report');

const analyzeData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const { path: filePath, originalname } = req.file;

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');

    const prompt =
      'Analyze the following CSV dataset. Provide a clear markdown summary of key trends, anomalies, and insights:\n\n' +
      rawData;

    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    const aiSummary =
      geminiResponse.data.candidates[0].content.parts[0].text;

    const report = await Report.create({
      filename: originalname,
      rawData,
      aiSummary,
    });

    fs.unlinkSync(filePath);

    return res.status(200).json({ success: true, report });
  } catch (error) {
    // Clean up temp file even when something goes wrong
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error('analyzeData error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeData };
