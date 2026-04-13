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

function conditionalProbability(matchCount, classCount, possibleValuesCount) {
  return (matchCount + 1) / (classCount + possibleValuesCount);
}

function countPossibleValues(records) {
  const suits = new Set();
  const companions = new Set();
  const fruits = new Set();

  for (let i = 0; i < records.length; i++) {
    suits.add(records[i].suit);
    companions.add(records[i].companion);
    fruits.add(records[i].fruit);
  }

  return {
    suitCount: suits.size,
    companionCount: companions.size,
    fruitCount: fruits.size
  };
}

function probabilityToBeatBoss(suit, companion, fruit, csvSource = getDefaultCsvSource()) {
  const records = parseBossResults(csvSource);
  if (records.length === 0) {
    return "0.0%";
  }

  const targetSuit = normalize(suit);
  const targetCompanion = normalize(companion);
  const targetFruit = normalize(fruit);

  let wins = 0;
  let losses = 0;

  let suitWins = 0;
  let suitLosses = 0;
  let companionWins = 0;
  let companionLosses = 0;
  let fruitWins = 0;
  let fruitLosses = 0;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    if (record.won) {
      wins++;
      if (record.suit === targetSuit) {
        suitWins++;
      }
      if (record.companion === targetCompanion) {
        companionWins++;
      }
      if (record.fruit === targetFruit) {
        fruitWins++;
      }
    } else {
      losses++;
      if (record.suit === targetSuit) {
        suitLosses++;
      }
      if (record.companion === targetCompanion) {
        companionLosses++;
      }
      if (record.fruit === targetFruit) {
        fruitLosses++;
      }
    }
  }

  const total = records.length;
  const valueCounts = countPossibleValues(records);
  const winPrior = (wins + 1) / (total + 2);
  const lossPrior = (losses + 1) / (total + 2);

  const winScore =
    winPrior *
    conditionalProbability(suitWins, wins, valueCounts.suitCount) *
    conditionalProbability(companionWins, wins, valueCounts.companionCount) *
    conditionalProbability(fruitWins, wins, valueCounts.fruitCount);

  const lossScore =
    lossPrior *
    conditionalProbability(suitLosses, losses, valueCounts.suitCount) *
    conditionalProbability(companionLosses, losses, valueCounts.companionCount) *
    conditionalProbability(fruitLosses, losses, valueCounts.fruitCount);

  const percentage = (winScore / (winScore + lossScore)) * 100;
  return `${percentage.toFixed(1)}%`;
}

if (require.main === module) {
  console.log(probabilityToBeatBoss("Hearts", "Lion", "Mango"));
  console.log(probabilityToBeatBoss("Spades", "Fox", "Papaya"));
}

module.exports = {
  parseBossResults,
  probabilityToBeatBoss
};
