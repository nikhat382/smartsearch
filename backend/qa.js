// backend/qa.js
const db = require('./database');

function findAnswer(question, callback) {
  const query = question.toLowerCase();

  db.all(`SELECT content FROM documents`, [], (err, rows) => {
    if (err) return callback(' Error fetching data');

    let answer = '';

    const keywordGroups = {
      education: ["education", "degree", "qualification", "college", "university"],
      skills: ["skill", "technology", "tools", "languages"],
      experience: ["experience", "work", "project", "internship", "job"],
      contact: ["email", "phone", "contact", "linkedin"],
      summary: ["summary", "objective", "about"]
    };

    let matchedSection = '';

    for (const [section, keywords] of Object.entries(keywordGroups)) {
      if (keywords.some(k => query.includes(k))) {
        const regex = new RegExp(section + '[\\s\\S]*?(?=(education|skills|experience|contact|summary|$))', 'i');
        for (const row of rows) {
          const match = row.content.match(regex);
          if (match) matchedSection = match[0];
        }
        break;
      }
    }

    if (!matchedSection) {
      for (const row of rows) {
        if (row.content.toLowerCase().includes(query)) {
          matchedSection = row.content.substring(
            row.content.toLowerCase().indexOf(query),
            row.content.toLowerCase().indexOf(query) + 300
          );
          break;
        }
      }
    }

    answer = matchedSection || "Sorry, I could not find anything relevant.";
    callback(answer);
  });
}

module.exports = findAnswer;
