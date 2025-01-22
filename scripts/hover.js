document.addEventListener('DOMContentLoaded', async () => {
	const tooltip = document.getElementById('tooltip');
	const countries = document.querySelectorAll('.country');
	const detailElement = document.createElement('div');
	const titleContainer = document.querySelector('.title-container');
	const menuButton = document.querySelector('.menu-button');
	const menuDropdown = document.querySelector('.menu-dropdown');
	const visitedCountriesList = document.getElementById('visited-countries-list');
	const statsContainer = document.querySelector('.stats-container');
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

	// Funktion: Liste der verfügbaren Länder aus der lokalen JSON laden
	const getEncounteredCountries = async () => {
		try {
			const response = await fetch('encounters/encounters.json');
			if (response.ok) {
				return await response.json(); // JSON-Inhalt zurückgeben
			} else {
				console.error('Fehler beim Abrufen der encounters.json');
			}
		} catch (error) {
			console.error('Fehler beim Zugriff auf die encounters.json:', error);
		}
		return [];
	};

	// Länder aus der JSON-Datei abrufen
	const encounteredCountries = await getEncounteredCountries();

	// Länder markieren, die in der JSON aufgelistet sind
	encounteredCountries.forEach((countryName) => {
		const countryElement = Array.from(countries).find(
			(country) => country.getAttribute('title') === countryName
		);
		if (countryElement) {
			countryElement.classList.add('visited');
		}
	});

	const visitedCountries = document.querySelectorAll('.country.visited');
	
	// Statistik aktualisieren
	if (statsContainer) {
		statsContainer.innerHTML = `Met people from <span id="countries-count">${visitedCountries.length}</span> different countries!`;
	}

	// Gastgeberländer, die ihre Farbe nicht ändern
	const hostCountries = ["Canada", "Mexico", "United States"];


	// Detail-Element konfigurieren
	detailElement.classList.add('detail-element');
	document.body.appendChild(detailElement);

	countries.forEach(country => {
		const name = country.getAttribute('title');

		if (!hostCountries.includes(name) && country.classList.contains('visited')) {
			// Funktion: Zufällige gedeckte Farbe generieren
			const generateRandomColor = () => {
				const r = Math.random() * 150 + 50; // Gedecktes Rot (50-200)
				const g = Math.random() * 150 + 50; // Gedecktes Grün (50-200)
				const b = Math.random() * 150 + 50; // Gedecktes Blau (50-200)
				return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
			};

			// Funktion: Helligkeit proportional anpassen
			const lightenColor = (rgb, factor) => {
				const rgbValues = rgb.match(/\d+/g).map(Number); // Extrahiere RGB-Werte
				return `rgb(${Math.min(rgbValues[0] * factor, 255)}, ${Math.min(rgbValues[1] * factor, 255)}, ${Math.min(rgbValues[2] * factor, 255)})`;
			};

			// Zufällige Startfarbe generieren
			const randomColor = generateRandomColor();

			// Zielfarbe: Startfarbe leicht aufgehellt (z. B. um 1.2x)
			const lighterColor = lightenColor(randomColor, 1.4); // 20% heller

			// Dynamischen Farbverlauf erstellen
			const gradientId = `gradient-${country.id}`;
			const defs = document.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
			if (!defs.parentNode) {
				document.querySelector('svg').appendChild(defs);
			}

			// Zielpunkt (Nordosten der USA) und SVG-Viewport
			const targetPoint = { x: 265, y: 340 }; // Absoluter Zielpunkt
			const svg = document.querySelector('svg');
			const viewBox = svg.viewBox.baseVal; // ViewBox des SVGs (x, y, width, height)

			// Zielpunkt relativ zur ViewBox berechnen
			const relativeTarget = {
				x: (targetPoint.x - viewBox.x) / viewBox.width,
				y: (targetPoint.y - viewBox.y) / viewBox.height,
			};

			// Begrenzungsrahmen des Landes
			const bbox = country.getBBox();
			const startX = bbox.x + bbox.width * 0.2; // Farbverlauf startet bei 20% Breite
			const startY = bbox.y + bbox.height * 0.2; // Farbverlauf startet bei 20% Höhe

			// Dynamische Richtung des Farbverlaufs berechnen
			const directionVector = {
				x1: (startX - viewBox.x) / viewBox.width, // Startpunkt relativ zur ViewBox
				y1: (startY - viewBox.y) / viewBox.height,
				x2: relativeTarget.x, // Zielpunkt relativ zur ViewBox
				y2: relativeTarget.y,
			};

			const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
			gradient.setAttribute('id', gradientId);
			gradient.setAttribute('x1', directionVector.x1.toString());
			gradient.setAttribute('y1', directionVector.y1.toString());
			gradient.setAttribute('x2', directionVector.x2.toString());
			gradient.setAttribute('y2', directionVector.y2.toString());

			const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
			stop1.setAttribute('offset', '0%');
			stop1.setAttribute('stop-color', randomColor);

			const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
			stop2.setAttribute('offset', '100%');
			stop2.setAttribute('stop-color', lighterColor);

			gradient.appendChild(stop1);
			gradient.appendChild(stop2);
			defs.appendChild(gradient);

			// Farbverlauf anwenden
			country.style.fill = `url(#${gradientId})`;
		}


		// Tooltip-Logik
		const showTooltip = (e) => {
			tooltip.textContent = name;
			tooltip.style.opacity = '1';

			if (isTouchDevice) {
				tooltip.classList.add('touch');
				// Die Position bleibt durch die CSS-Klasse festgelegt.
			} else {
				tooltip.classList.remove('touch');
				tooltip.style.left = `${e.pageX + 10}px`;
				tooltip.style.top = `${e.pageY + 10}px`;
			}
		};

		const hideTooltip = () => {
			tooltip.style.opacity = '0';
		};

		// Tooltip für alle Geräte
		if (isTouchDevice) {
			country.addEventListener('touchstart', (e) => {
				e.preventDefault();
				showTooltip(e.touches[0]);
				detailElement.style.display = 'none';
			});

			country.addEventListener('touchend', (e) => {
				e.preventDefault();
				hideTooltip();
			});
		} else {
			country.addEventListener('mouseover', showTooltip);
			country.addEventListener('mousemove', showTooltip);
			country.addEventListener('mouseout', hideTooltip);
		}

		// Klick-Logik nur für visited-Länder
		if (country.classList.contains('visited')) {
			const clickHandler = async () => {
				const response = await fetch(`encounters/${name}/data.json`);
				if (response.ok) {
					const data = await response.json();
					detailElement.innerHTML = ''; // Zurücksetzen

					data.encounters.forEach(encounter => {
						const encounterDiv = document.createElement('div');
						encounterDiv.classList.add('encounter');
						encounterDiv.innerHTML = `
                            <img src="encounters/${name}/${encounter.image}" alt="${name}" />
                            <p>${encounter.text}</p>
                        `;
						detailElement.appendChild(encounterDiv);
					});

					detailElement.style.display = 'block';
				}
			};

			// Kombiniere Klick und Touch-Events
			country.addEventListener('click', clickHandler);
			if (isTouchDevice) {
				country.addEventListener('touchend', (e) => {
					e.preventDefault(); // Verhindert Konflikte mit Standard-Touch-Events
					clickHandler();
				});
			}
		}
	});
	
	const visitedCountriesArray = Array.from(visitedCountries).map(countryElement => {
	  const name = countryElement.getAttribute('title');
	  return { name, element: countryElement };
	});

	// Alphabetische Sortierung der Länder nach Namen
	visitedCountriesArray.sort((a, b) => a.name.localeCompare(b.name));

	// Besuchte Länder in Menü einfügen
	visitedCountriesArray.forEach(({ name, element }) => {
	  const li = document.createElement('li');
	  li.textContent = name;
	  li.addEventListener('click', () => {
	    const event = new MouseEvent('click', {
	      bubbles: true,
	      cancelable: true,
	      view: window,
	    });
	    element.dispatchEvent(event);
	  });
	  visitedCountriesList.appendChild(li);
	});

	// Dropdown-Menü anzeigen/verbergen
	menuButton.addEventListener('click', () => {
		const isVisible = menuDropdown.style.display === 'block';
		menuDropdown.style.display = isVisible ? 'none' : 'block';
	});

	// Menü schließen, wenn außerhalb geklickt wird
	document.addEventListener('click', (e) => {
		if (!e.target.closest('.menu-container')) {
			menuDropdown.style.display = 'none';
		}
	});

	// Panzoom initialisieren
	const mapContainer = document.querySelector('.map-container svg');
	if (mapContainer) {
		const panzoom = new Panzoom(mapContainer, {
			maxScale: 9,
			minScale: 1,
			contain: 'outside',
			step: 1.0,
		});

		mapContainer.addEventListener('panzoomchange', () => {
			const zoomLevel = panzoom.getScale();
			const defaultZoom = 1;

			if (zoomLevel !== defaultZoom) {
				titleContainer.style.display = 'none';
			} else {
				titleContainer.style.display = 'block';
			}
		});

		mapContainer.parentElement.addEventListener('wheel', (event) => {
			event.preventDefault();
			panzoom.zoomWithWheel(event);
		});

		mapContainer.addEventListener('dblclick', () => {
			panzoom.zoomIn({ animate: true });
		});
	} else {
		console.error('SVG-Element nicht gefunden. Bitte überprüfe deinen Selektor oder die HTML-Struktur.');
	}

	// Detail-Element schließen, wenn außerhalb geklickt wird
	document.addEventListener('click', (e) => {
		if (!e.target.closest('.detail-element') && !e.target.classList.contains('visited')) {
			detailElement.style.display = 'none';
		}
	});
});
