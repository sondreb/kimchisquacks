import 'dotenv/config';
import axios from 'axios';
import { readFile, writeFile } from 'fs/promises';

const BASE_URL = 'https://npiregistry.cms.hhs.gov/api/';

async function fetchNPIData(firstName, lastName) {
    try {
        const url = `${BASE_URL}?version=2.1&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching NPI data for ${firstName} ${lastName}:`, error.message);
        return null;
    }
}

async function main() {
    try {
        // Read the existing doctors.json file
        const data = JSON.parse(await readFile('doctors.json', 'utf8'));
        
        // Process each doctor
        for (let i = 0; i < data.length; i++) {
            const doctor = data[i];
            console.log(`Processing ${i + 1}/${data.length}: ${doctor.name}`);
            
            // Extract first and last name
            const nameParts = doctor.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts[nameParts.length - 1];
            
            // Fetch NPI data
            const npiData = await fetchNPIData(firstName, lastName);
            
            // Add NPI data to the doctor's record
            data[i].npiData = npiData;
            
            // Add small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Save updated data back to doctors.json
        await writeFile('doctors.json', JSON.stringify(data, null, 2));
        console.log('Updated data saved to doctors.json');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
