import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';

const url = 'https://quackwatch.org/11ind/';
const baseUrl = new URL(url);

// Helper function to resolve relative URLs
const resolveUrl = (relative) => {
  try {
    return new URL(relative, baseUrl).href;
  } catch {
    return relative;
  }
};

try {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const livingDoctors = [];

  let isLivingSection = false;

  $('h2, h3, h5, p, a').each((i, element) => {
    const tag = $(element).get(0).tagName.toLowerCase();
    const text = $(element).text().trim();

    if (tag === 'h2' || tag === 'h3' || tag === 'h5') {

      console.log('tag:', tag, 'text:', text);

      if (text === 'Living') {
        isLivingSection = true;
      } else if (text === 'Deceased') {
        isLivingSection = false;
      }
    }

    if (isLivingSection && tag === 'a') {
      livingDoctors.push({
        name: text,
        link: resolveUrl($(element).attr('href'))
      });
    }
  });

  console.log('Living Doctors:', livingDoctors);
  
  // Save to JSON file
  await writeFile('doctors.json', JSON.stringify(livingDoctors, null, 2));
  console.log('Data saved to doctors.json');

} catch (error) {
  console.error('Error:', error);
}
