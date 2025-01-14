// Datenstruktur für Begegnungen
const encounters = {
    Switzerland: [
        { image: 'path/to/swiss_image1.jpg', text: 'Treffen mit Peter in Zürich.' },
        { image: 'path/to/swiss_image2.jpg', text: 'Skifahren mit Claudia in den Alpen.' },
    ],
    Germany: [
        { image: 'path/to/german_image1.jpg', text: 'Treffen mit Hans in Berlin.' },
    ],
    // Weitere Länder hinzufügen...
};

document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.getElementById('tooltip');
    const countries = document.querySelectorAll('.country');
    const detailElement = document.createElement('div');
    detailElement.classList.add('detail-element');
    document.body.appendChild(detailElement);

    countries.forEach(country => {
        country.addEventListener('mouseover', (e) => {
            const name = country.getAttribute('title');
            tooltip.textContent = name;
            tooltip.style.opacity = '1';
        });

        country.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY + 10 + 'px';
        });

        country.addEventListener('mouseout', () => {
            tooltip.style.opacity = '0';
        });

        // Klick-Event für Länder mit der Klasse "visited"
        if (country.classList.contains('visited')) {
            country.addEventListener('click', () => {
                const countryName = country.getAttribute('title');
                const countryEncounters = encounters[countryName];

                // Fülle das Detail-Element
                detailElement.innerHTML = ''; // Inhalt zurücksetzen
                if (countryEncounters) {
                    countryEncounters.forEach(encounter => {
                        const encounterDiv = document.createElement('div');
                        encounterDiv.classList.add('encounter');
                        encounterDiv.innerHTML = `
                            <img src="${encounter.image}" alt="${countryName}" />
                            <p>${encounter.text}</p>
                        `;
                        detailElement.appendChild(encounterDiv);
                    });
                } else {
                    detailElement.innerHTML = `<p>Keine Begegnungen für ${countryName} gefunden.</p>`;
                }

                // Detail-Element anzeigen
                detailElement.style.display = 'block';
            });
        }
    });

    // Panzoom-Initialisierung
    const mapContainer = document.querySelector('.map-container svg');
    if (mapContainer) {
        const panzoom = new Panzoom(mapContainer, {
            maxScale: 8, // Maximale Vergrößerung
            minScale: 1, // Minimale Verkleinerung
            contain: 'outside', // Grenzen flexibel
        });

        // Mausrad-Interaktion hinzufügen
        mapContainer.parentElement.addEventListener('wheel', (event) => {
            event.preventDefault(); // Standardverhalten (Scrollen) verhindern
            panzoom.zoomWithWheel(event);
        });
    } else {
        console.error('SVG-Element nicht gefunden. Bitte überprüfe deinen Selektor oder die HTML-Struktur.');
    }

    // Schließen des Detail-Elements bei Klick außerhalb
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.detail-element') && !e.target.classList.contains('visited')) {
            detailElement.style.display = 'none';
        }
    });
});
