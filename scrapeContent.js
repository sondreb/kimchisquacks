import axios from 'axios';
import { readFile, writeFile } from 'fs/promises';
import { convert } from 'html-to-text';

function countWordOccurrences(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  return (text.match(regex) || []).length;
}

async function fetchAndCleanContent(url) {
  try {
    const response = await axios.get(url);
    const cleanText = convert(response.data, {
      wordwrap: 130,
      selectors: [
        { selector: 'img', format: 'skip' },
        { selector: 'script', format: 'skip' },
        { selector: 'style', format: 'skip' }
      ]
    });
    return cleanText;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    const data = JSON.parse(await readFile('doctors.json', 'utf8'));
    
    for (let i = 0; i < data.length; i++) {
      console.log(`Processing ${i + 1}/${data.length}: ${data[i].name}`);
      const content = await fetchAndCleanContent(data[i].link);
      if (content) {
        data[i].content = content;
        // Add word counts
        data[i].cancerCount = countWordOccurrences(content, 'cancer');
        data[i].holisticCount = countWordOccurrences(content, 'holistic');
        data[i].alternativeCount = countWordOccurrences(content, 'alternative');
      }
      // Add small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await writeFile('doctors.json', JSON.stringify(data, null, 2));
    console.log('Updated data saved to doctors.json');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
