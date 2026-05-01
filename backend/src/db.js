const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data.json');

const readData = () => {
  try {
    if (!fs.existsSync(dataPath)) {
      return { anime: [], episodes: [] };
    }
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading data:', err);
    return { anime: [], episodes: [] };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing data:', err);
    return false;
  }
};

// Generate a fake ObjectId string
const generateId = () => {
  const timestamp = (Math.floor(new Date().getTime() / 1000)).toString(16);
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
    return (Math.random() * 16 | 0).toString(16);
  }).toLowerCase();
};

module.exports = {
  readData,
  writeData,
  generateId
};
