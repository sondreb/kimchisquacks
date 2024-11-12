document.addEventListener('DOMContentLoaded', () => {
    fetch('doctors-content.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('doctors-container');
            data.forEach((doctor, index) => {
                const doctorDiv = document.createElement('div');
                const nameHeader = document.createElement('h2');
                const cancerCountParagraph = document.createElement('p');
                const alternativeCountParagraph = document.createElement('p');
                const malignancyCountParagraph = document.createElement('p');
                const neoplasmCountParagraph = document.createElement('p');
                const psuedoScienceCountParagraph = document.createElement('p');
                const holisticCountParagraph = document.createElement('p');
                const deathCountParagraph = document.createElement('p');
                const deadCountParagraph = document.createElement('p');
                const deceasedCountParagraph = document.createElement('p');
                const linkAnchor = document.createElement('a');
                const expandButton = document.createElement('button');
                const additionalDataDiv = document.createElement('div');

                nameHeader.textContent = doctor.name;
                cancerCountParagraph.innerHTML = `Number: ${index + 1}<br>Cancer Count: ${doctor.cancerCount}`;
                alternativeCountParagraph.textContent = `Alternative Count: ${doctor.alternativeCount}`;
                malignancyCountParagraph.textContent = `Malignancy Count: ${doctor.malignancyCount}`;
                neoplasmCountParagraph.textContent = `Neoplasm Count: ${doctor.neoplasmCount}`;
                psuedoScienceCountParagraph.textContent = `Psuedo Science Count: ${doctor.psuedoScienceCount}`;
                holisticCountParagraph.textContent = `Holistic Count: ${doctor.holisticCount}`;
                deathCountParagraph.textContent = `Death Count: ${doctor.deathCount}`;
                deadCountParagraph.textContent = `Dead Count: ${doctor.deadCount}`;
                deceasedCountParagraph.textContent = `Deceased Count: ${doctor.deceasedCount}`;
                linkAnchor.href = doctor.link;
                linkAnchor.textContent = doctor.link;
                expandButton.textContent = 'Show Data';
                additionalDataDiv.style.display = 'none';

                expandButton.addEventListener('click', () => {
                    if (additionalDataDiv.style.display === 'none') {
                        additionalDataDiv.style.display = 'block';
                        expandButton.textContent = 'Hide Data';
                    } else {
                        additionalDataDiv.style.display = 'none';
                        expandButton.textContent = 'Show Data';
                    }
                });

                // Append the always visible elements
                doctorDiv.appendChild(nameHeader);
                doctorDiv.appendChild(cancerCountParagraph);
                doctorDiv.appendChild(alternativeCountParagraph);
                doctorDiv.appendChild(malignancyCountParagraph);
                doctorDiv.appendChild(neoplasmCountParagraph);
                doctorDiv.appendChild(psuedoScienceCountParagraph);
                doctorDiv.appendChild(holisticCountParagraph);
                doctorDiv.appendChild(deathCountParagraph);
                doctorDiv.appendChild(deadCountParagraph);
                doctorDiv.appendChild(deceasedCountParagraph);
                doctorDiv.appendChild(linkAnchor);

                // Append the expandable data
                if (doctor.data) {
                    const dataParagraph = document.createElement('p');
                    dataParagraph.textContent = doctor.data;
                    additionalDataDiv.appendChild(dataParagraph);
                }

                doctorDiv.appendChild(expandButton);
                doctorDiv.appendChild(additionalDataDiv);

                container.appendChild(doctorDiv);
            });
        })
        .catch(error => console.error('Error fetching the JSON file:', error));
});