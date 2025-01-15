document.addEventListener('DOMContentLoaded', () => {
	const tooltip = document.getElementById('tooltip');
	const countries = document.querySelectorAll('.country');
	const detailElement = document.createElement('div');
	const titleContainer = document.querySelector('.title-container');
	
	detailElement.classList.add('detail-element');
	document.body.appendChild(detailElement);

	// Prüfen, ob es sich um ein Touchgerät handelt
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

	if (isTouchDevice) {
		tooltip.classList.add('touch');
	}

	const getRandomColor = () => {
		let r, g, b;

		do {
			r = Math.floor(Math.random() * 256);
			g = Math.floor(Math.random() * 256);
			b = Math.floor(Math.random() * 256);
		} while (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30);

		return `rgb(${r}, ${g}, ${b})`;
	};

	countries.forEach(country => {
		if (country.classList.contains('visited')) {
			const randomColor = getRandomColor();
			country.style.fill = randomColor; // Farbe direkt setzen
		}

		if (!isTouchDevice) {
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
		}

		// Touchverhalten (Mobile)
		if (isTouchDevice) {
			country.addEventListener('touchstart', (e) => {
				const name = country.getAttribute('title');
				tooltip.textContent = name;
				tooltip.style.opacity = '1';
			});

			country.addEventListener('touchend', () => {
				tooltip.style.opacity = '0';
			});
		}

		if (country.classList.contains('visited')) {
			country.addEventListener('click', async () => {
				const countryName = country.getAttribute('title');
				const response = await fetch(`encounters/${countryName}/data.json`);
				if (response.ok) {
					const data = await response.json();
					detailElement.innerHTML = ''; // Zurücksetzen

					data.encounters.forEach(encounter => {
						const encounterDiv = document.createElement('div');
						encounterDiv.classList.add('encounter');
						encounterDiv.innerHTML = `
	                            <img src="encounters/${countryName}/${encounter.image}" alt="${countryName}" />
	                            <p>${encounter.text}</p>
	                        `;
						detailElement.appendChild(encounterDiv);
					});

					detailElement.style.display = 'block';
				} else {
					console.error(`Keine Daten gefunden für ${countryName}`);
				}
			});
		}
	});

	document.addEventListener('click', (e) => {
		if (!e.target.closest('.detail-element') && !e.target.classList.contains('visited')) {
			detailElement.style.display = 'none';
		}
	});

	// Panzoom-Initialisierung
	const mapContainer = document.querySelector('.map-container svg');
	if (mapContainer) {
		const panzoom = new Panzoom(mapContainer, {
			maxScale: 9,
			minScale: 1,
			contain: 'outside',
			/*touchAction: 'none', // Verhindert unerwünschte Browser-Gesten*/
			step: 1.0
		});
		
		// Titel ausblenden, wenn Zoom nicht im Standard ist
		mapContainer.addEventListener('panzoomchange', () => {
			const zoomLevel = panzoom.getScale(); // Aktuelle Zoomstufe
			const defaultZoom = 1; // Standard-Zoomstufe

			if (zoomLevel !== defaultZoom) {
				titleContainer.style.display = 'none';
			} else {
				titleContainer.style.display = 'block';
			}
		});

		// Mausrad- und Touch-Interaktion hinzufügen
		mapContainer.parentElement.addEventListener('wheel', (event) => {
			event.preventDefault();
			panzoom.zoomWithWheel(event);
		});

		// Optional: Double-tap für Zoom auf Touchscreen-Geräten
		mapContainer.addEventListener('dblclick', (event) => {
			panzoom.zoomIn({ animate: true });
		});
	} else {
		console.error('SVG-Element nicht gefunden. Bitte überprüfe deinen Selektor oder die HTML-Struktur.');
	}

});
