import fs from "fs";

export function getJsonData() {
  return new Promise((resolve, reject) => {
    fs.readFile('public/json/publicUniV1.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the JSON file:', err);
        reject(err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        
       // console.log('JSON data read successfully:', jsonData);
        resolve(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        reject(error);
      }
    });
  });
}