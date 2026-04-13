const fs = require("fs");
const path = require("path");

const DEFAULT_CSV_PATH = path.join(__dirname, "prediction.csv");

function normalize(value) {
  return String(value).trim().toLowerCase();
}

function getDefaultCsvSource() {
  if (fs.existsSync(DEFAULT_CSV_PATH)) {
    return DEFAULT_CSV_PATH;
  }

  throw new Error(`Missing CSV file: ${DEFAULT_CSV_PATH}`);
}

function resolveCsvSource(source) {
  if (typeof source !== "string") {
    throw new Error("CSV source must be a string.");
  }

  if (fs.existsSync(source)) {
    return fs.readFileSync(source, "utf8");
  }

  return source;
}

function findColumnIndex(headers, names) {
  for (let i = 0; i < headers.length; i++) {
    const header = normalize(headers[i]);
    for (let j = 0; j < names.length; j++) {
      if (header === normalize(names[j])) {
        return i;
      }
    }
  }

  return -1;
}

function parseBossResults(csvSource) {
  const csvText = resolveCsvSource(csvSource);
  const lines = csvText.split(/\r?\n/);
  const rows = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== "") {
      rows.push(lines[i]);
    }
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].split(",");
  const resultIndex = findColumnIndex(headers, ["result", "results", "outcome", "win", "won"]);
  const suitIndex = findColumnIndex(headers, ["suit", "card suit"]);
  const companionIndex = findColumnIndex(headers, ["companion", "animal", "animal name"]);
  const fruitIndex = findColumnIndex(headers, ["fruit"]);

  if (resultIndex === -1 || suitIndex === -1 || companionIndex === -1 || fruitIndex === -1) {
    throw new Error("CSV header must contain result, suit, companion/animal, and fruit columns.");
  }

  const records = [];

  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(",");
    if (columns.length <= Math.max(resultIndex, suitIndex, companionIndex, fruitIndex)) {
      continue;
    }

    const result = normalize(columns[resultIndex]);
    records.push({
      won: result === "true" || result === "1" || result === "yes" || result === "win" || result === "won",
      suit: normalize(columns[suitIndex]),
      companion: normalize(columns[companionIndex]),
      fruit: normalize(columns[fruitIndex])
    });
  }

  return records;
}

function winRateForValue(records, fieldName, targetValue) {
  let totalMatches = 0;
  let wins = 0;

  for (let i = 0; i < records.length; i++) {
    if (records[i][fieldName] === targetValue) {
      totalMatches++;

      if (records[i].won) {
        wins++;
      }
    }
  }

  if (totalMatches === 0) {
    return 0;
  }

  return wins / totalMatches;
}

function probabilityToBeatBoss(suit, companion, fruit, csvSource = getDefaultCsvSource()) {
  const records = parseBossResults(csvSource);
  if (records.length === 0) {
    return 0;
  }

  const targetSuit = normalize(suit);
  const targetCompanion = normalize(companion);
  const targetFruit = normalize(fruit);

  const suitRate = winRateForValue(records, "suit", targetSuit);
  const companionRate = winRateForValue(records, "companion", targetCompanion);
  const fruitRate = winRateForValue(records, "fruit", targetFruit);

  const percentage = ((suitRate + companionRate + fruitRate) / 3) * 100;
  return Number(percentage.toFixed(1));
}

if (require.main === module) {
  console.log(probabilityToBeatBoss("Hearts", "Lion", "Mango"));
  console.log(probabilityToBeatBoss("Spades", "Fox", "Papaya"));
}

module.exports = {
  parseBossResults,
  probabilityToBeatBoss
};
