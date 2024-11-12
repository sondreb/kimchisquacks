import 'dotenv/config';
import axios from 'axios';
import { readFile, writeFile } from 'fs/promises';
import { convert } from 'html-to-text';
import OpenAI from 'openai';

// Verify API key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in .env file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Available models to use:
const MODELS = {
  GPT35: "gpt-3.5-turbo",
  // GPT35_16K: "gpt-3.5-turbo-16k",
  // GPT4: "gpt-4",
  // GPT4_32K: "gpt-4-32k"
};

// Available models: [
//   'gpt-3.5-turbo-instruct',
//   'gpt-4o-mini-2024-07-18',
//   'gpt-4o-mini',
//   'gpt-3.5-turbo',
//   'gpt-3.5-turbo-0125',
//   'gpt-3.5-turbo-16k',
//   'gpt-3.5-turbo-1106',
//   'gpt-3.5-turbo-instruct-0914'
// ]

// Available models: [
//   'gpt-4o-2024-08-06',
//   'gpt-4o',
//   'gpt-3.5-turbo-instruct',
//   'gpt-4o-mini-2024-07-18',
//   'gpt-4o-mini',
//   'gpt-3.5-turbo',
//   'gpt-3.5-turbo-0125',
//   'gpt-3.5-turbo-16k',
//   'chatgpt-4o-latest',
//   'gpt-4-turbo-2024-04-09',
//   'gpt-4',
//   'gpt-4o-realtime-preview-2024-10-01',
//   'gpt-4o-realtime-preview',
//   'gpt-4-turbo-preview',
//   'gpt-4-1106-preview',
//   'gpt-4-turbo',
//   'gpt-3.5-turbo-1106',
//   'gpt-4o-audio-preview',
//   'gpt-4o-audio-preview-2024-10-01',
//   'gpt-4-0613',
//   'gpt-4-0125-preview',
//   'gpt-3.5-turbo-instruct-0914',
//   'gpt-4o-2024-05-13'
// ]

// Select model to use
const SELECTED_MODEL = MODELS.GPT35;

async function listAvailableModels() {
  try {
    const models = await openai.models.list();
    console.log('Available models:', models.data
      .filter(m => m.id.includes('gpt'))
      .map(m => m.id));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

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

async function generateSummary(content) {
  try {
    const response = await openai.chat.completions.create({
      model: SELECTED_MODEL,
      messages: [{
        role: "system",
        content: "You are a helpful assistant that summarizes medical practitioner information. Provide a 3-paragraph summary."
      }, {
        role: "user",
        content: `Please summarize this content in 3 paragraphs:\n${content}`
      }],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
}

async function main() {
  try {
    await listAvailableModels();
    const data = JSON.parse(await readFile('doctors.json', 'utf8'));
    
    for (let i = 0; i < data.length; i++) {
      console.log(`Processing ${i + 1}/${data.length}: ${data[i].name}`);
      const content = await fetchAndCleanContent(data[i].link);
      if (content) {
        data[i].content = content;
        data[i].summary = await generateSummary(content);
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
