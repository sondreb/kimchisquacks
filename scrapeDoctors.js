import axios from 'axios';
import * as cheerio from 'cheerio';

const url = 'https://quackwatch.org/11ind/';

try {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const livingDoctors = [];

  let isLivingSection = false;

  $('h2, h3, p').each((i, element) => {
    const tag = $(element).get(0).tagName.toLowerCase();
    const text = $(element).text().trim();

    if (tag === 'h2' || tag === 'h3') {
      if (text === 'Living') {
        isLivingSection = true;
      } else if (text === 'Deceased') {
        isLivingSection = false;
      }
    }

    if (isLivingSection && tag === 'p') {
      livingDoctors.push(text);
    }
  });

  console.log('Living Doctors:', livingDoctors);
} catch (error) {
  console.error('Error fetching the URL:', error);
}
