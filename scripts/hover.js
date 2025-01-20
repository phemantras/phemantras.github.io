document.addEventListener('DOMContentLoaded', () => {
	const tooltip = document.getElementById('tooltip');
	const countries = document.querySelectorAll('.country');
	const detailElement = document.createElement('div');
	const titleContainer = document.querySelector('.title-container');
	const menuButton = document.querySelector('.menu-button');
	const menuDropdown = document.querySelector('.menu-dropdown');
	const visitedCountriesList = document.getElementById('visited-countries-list');
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

	// Gastgeberländer, die ihre Farbe nicht ändern
	const hostCountries = ["Canada", "Mexico", "United States"];

	// Statistik initialisieren
	const visitedCountries = Array.from(countries)
		.filter(country => country.classList.contains('visited'))
		.map(country => ({
			name: country.getAttribute('title'),
			element: country,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	document.querySelector('.stats-container').innerHTML =
		`Met people from <span id="countries-count">${visitedCountries.length}</span> different countries!`;

	// Detail-Element konfigurieren
	detailElement.classList.add('detail-element');
	document.body.appendChild(detailElement);

	countries.forEach(country => {
		const name = country.getAttribute('title');

		if (!hostCountries.includes(name) && country.classList.contains('visited')) {
		    // RGB-Farbe zufällig generieren
		    const randomColor = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200})`;

		    // Hellerer Farbton für den Farbverlauf berechnen
		    const rgbValues = randomColor.match(/\d+/g).map(Number);
		    const lighterColor = `rgb(${Math.min(rgbValues[0] + 50, 255)}, ${Math.min(rgbValues[1] + 50, 255)}, ${Math.min(rgbValues[2] + 50, 255)})`;

		    // Dynamischen Farbverlauf erstellen
		    const gradientId = `gradient-${country.id}`;
		    const defs = document.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
		    if (!defs.parentNode) {
		        document.querySelector('svg').appendChild(defs);
		    }

		    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
		    gradient.setAttribute('id', gradientId);
		    gradient.setAttribute('x1', '0');
		    gradient.setAttribute('y1', '0');
		    gradient.setAttribute('x2', '1');
		    gradient.setAttribute('y2', '1');

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
				} else {
					console.error(`Keine Daten gefunden für ${name}`);
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

	// Besuchte Länder in Menü einfügen
	visitedCountries.forEach(({ name, element }) => {
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
