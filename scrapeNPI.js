import "dotenv/config";
import axios from "axios";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const BASE_URL = "https://npiregistry.cms.hhs.gov/api/";
const OUTPUT_DIR = "doctors-output";

async function fetchNPIData(firstName, lastName) {
  try {
    const url = `${BASE_URL}?version=2.1&first_name=${encodeURIComponent(
      firstName
    )}&last_name=${encodeURIComponent(lastName)}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching NPI data for ${firstName} ${lastName}:`,
      error.message
    );
    return null;
  }
}

async function saveDoctorData(doctor) {
  const fileName = `${doctor.firstName}_${doctor.lastName}.json`
    .replace(/[^a-z0-9.-]/gi, "_")
    .toLowerCase();
  const filePath = path.join(OUTPUT_DIR, fileName);
  await writeFile(filePath, JSON.stringify(doctor, null, 2));
  console.log(
    `Saved data for ${doctor.firstName} ${doctor.lastName} to ${filePath}`
  );
}

async function main() {
  try {
    // Create output directory if it doesn't exist
    if (!existsSync(OUTPUT_DIR)) {
      await mkdir(OUTPUT_DIR);
    }

    const data = JSON.parse(await readFile("doctors.json", "utf8"));

    for (let i = 0; i < data.length; i++) {
      const doctor = data[i];
      console.log(
        `Processing ${i + 1}/${data.length}: ${doctor.firstname} ${
          doctor.lastname
        }`
      );

      const npiData = await fetchNPIData(doctor.firstname, doctor.lastname);
      data[i].data = npiData;

      // Save individual doctor data
      // await saveDoctorData(data[i]);

      await writeFile("doctors-output.json", JSON.stringify(data, null, 2));

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Save complete dataset
    await writeFile("doctors-output.json", JSON.stringify(data, null, 2));
    console.log("Complete dataset saved to doctors-output.json");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
