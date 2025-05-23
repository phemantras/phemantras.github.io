document.addEventListener('DOMContentLoaded', async () => {
	const tooltip = document.getElementById('tooltip');
	const countries = document.querySelectorAll('.country');
	const detailElement = document.createElement('div');
	const titleContainer = document.querySelector('.title-container');
	const menuButton = document.querySelector('.menu-button');
	const menuDropdown = document.querySelector('.menu-dropdown');
	const visitedCountriesList = document.getElementById('visited-countries-list');
	const statsContainer = document.querySelector('.stats-container');
	const newsfeedList = document.getElementById('newsfeed-list');
	const newsfeed = document.querySelector('.newsfeed');
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	let allEncounters = [];

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

	const toggleButton = document.createElement('div');
	toggleButton.classList.add('newsfeed-toggle');
	toggleButton.textContent = "▼ Newsfeed";
	toggleButton.style.bottom = "41%";
	document.body.appendChild(toggleButton);

	// 🔹 Funktion: Newsfeed ein- und ausfahren
	toggleButton.addEventListener('click', () => {
		if (newsfeed.classList.contains('expanded')) {
			newsfeed.classList.remove('expanded');
			toggleButton.textContent = "▲ Newsfeed";
			toggleButton.style.bottom = "10px"; // Zurück nach unten
		} else {
			newsfeed.classList.add('expanded');
			toggleButton.textContent = "▼ Newsfeed";
			toggleButton.style.bottom = "41%"; // Hoch schieben
		}
	});

	const fetchEncounters = async () => {
		for (const country of visitedCountries) {
			const countryName = country.getAttribute('title');
			try {
				const response = await fetch(`encounters/${countryName}/data.json`);
				if (response.ok) {
					const data = await response.json();
					data.encounters.forEach(encounter => {
						allEncounters.push({
							...encounter, // Alle vorhandenen Felder übernehmen
							country: countryName // Land hinzufügen
						});
					});
				}
			} catch (error) {
				console.error(`Fehler beim Abrufen von ${countryName}:`, error);
			}
		}

		// 🔹 Nach Datum sortieren (neueste zuerst)
		allEncounters.sort((a, b) => new Date(b.date) - new Date(a.date));

		// 🔹 Newsfeed befüllen
		populateNewsfeed();
	};

	// 🔹 Funktion: Newsfeed mit Encounters anzeigen
	const populateNewsfeed = () => {
		newsfeedList.innerHTML = ''; // Liste leeren

		allEncounters.forEach(encounter => {
			const listItem = document.createElement('li');
			listItem.classList.add('newsfeed-item');

			// 🔹 Thumbnail + Kurzinfo
			listItem.innerHTML = `
		            <img src="encounters/${encounter.country}/${encounter.image}" alt="${encounter.name}" class="newsfeed-thumbnail" />
		            <div class="newsfeed-info">
		                <p><strong>${encounter.date} ${encounter.name} </strong></p>
						<p>${encounter.location}, ${encounter.country}</p>
		            </div>
		        `;

			// 🔹 Beim Klicken auf das Newsfeed-Item → Land auf der Karte öffnen
			listItem.addEventListener('click', () => {
				const countryElement = Array.from(visitedCountries).find(c => c.getAttribute('title') === encounter.country);
				if (countryElement) {
					countryElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
				}
			});

			newsfeedList.appendChild(listItem);
		});
	};

	// 🔹 Encounters abrufen und Newsfeed befüllen
	await fetchEncounters();

	// Statistik aktualisieren
	if (statsContainer) {
		statsContainer.innerHTML = `enCOUNTERed: <span id="countries-count">${visitedCountries.length}</span>`;
	}

	// Gastgeberländer, die ihre Farbe nicht ändern
	const hostCountries = ["Canada", "Mexico", "United States", "Germany"];


	// Detail-Element konfigurieren
	detailElement.classList.add('detail-element');
	document.body.appendChild(detailElement);

	countries.forEach(country => {
		const name = country.getAttribute('title');

		if (!hostCountries.includes(name) && country.classList.contains('visited')) {
			// Zufällige gedeckte Farbe generieren
			const generateRandomColor = () => {
				const r = Math.random() * 150 + 50; // Gedecktes Rot (50-200)
				const g = Math.random() * 150 + 50; // Gedecktes Grün (50-200)
				const b = Math.random() * 150 + 50; // Gedecktes Blau (50-200)
				return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
			};

			// Helligkeit anpassen
			const lightenColor = (rgb, factor) => {
				const rgbValues = rgb.match(/\d+/g).map(Number);
				return `rgb(${Math.min(rgbValues[0] * factor, 255)}, ${Math.min(rgbValues[1] * factor, 255)}, ${Math.min(rgbValues[2] * factor, 255)})`;
			};

			const randomColor = generateRandomColor();
			const lighterColor = lightenColor(randomColor, 1.2);

			// Dynamischer Farbverlauf
			const gradientId = `gradient-${country.id}`;
			const defs = document.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
			if (!defs.parentNode) {
				document.querySelector('svg').appendChild(defs);
			}

			const targetPoint = { x: 265, y: 340 };
			const svg = document.querySelector('svg');
			const viewBox = svg.viewBox.baseVal;

			const relativeTarget = {
				x: (targetPoint.x - viewBox.x) / viewBox.width,
				y: (targetPoint.y - viewBox.y) / viewBox.height,
			};

			const bbox = country.getBBox();
			const startX = bbox.x + bbox.width * 0.2;
			const startY = bbox.y + bbox.height * 0.2;

			const directionVector = {
				x1: (startX - viewBox.x) / viewBox.width,
				y1: (startY - viewBox.y) / viewBox.height,
				x2: relativeTarget.x,
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
					if (data.encounters.length > 1) {
						const encounterList = document.createElement('div');
						encounterList.classList.add('encounter-list');

						data.encounters.forEach((encounter, index) => {
							const encounterItem = document.createElement('div');
							encounterItem.classList.add('encounter-item');

							// "+" Button für Aufklappen
							const thumbnail = document.createElement('img');
							thumbnail.src = `encounters/${name}/${encounter.image}`;
							thumbnail.alt = encounter.name;
							thumbnail.classList.add('thumbnail');

							const info = document.createElement('div');
							info.classList.add('encounter-info');
							info.innerHTML = `<strong>${encounter.name}</strong> - ${encounter.location} (${encounter.date})`;

							// 🔹 "+" Button zum Aufklappen
							const toggleButton = document.createElement('button');
							toggleButton.textContent = "+";
							toggleButton.classList.add('expand-btn');
							toggleButton.addEventListener('click', () => {
								// Toggle-Klasse, um das Element zu öffnen
								encounterDetail.classList.toggle('expanded');
							});

							// 🔹 Detailansicht (versteckt), erscheint unterhalb
							const encounterDetail = document.createElement('div');
							encounterDetail.classList.add('encounter-detail', 'hidden');
							encounterDetail.innerHTML = `
							    <img src="encounters/${name}/${encounter.image}" alt="${encounter.name}" class="detail-image" />
							    <p>${encounter.text}</p>
							`;

							// 🔹 Elemente zusammenfügen (Detail unterhalb!)
							encounterItem.appendChild(toggleButton);
							encounterItem.appendChild(thumbnail);
							encounterItem.appendChild(info);
							encounterList.appendChild(encounterItem);
							encounterList.appendChild(encounterDetail);
						});

						detailElement.appendChild(encounterList);
					} else {
						const encounter = data.encounters[0];
						detailElement.innerHTML = `
						    <img src="encounters/${name}/${encounter.image}" alt="${encounter.name}" class="detail-image" />
						    <p><strong>Name:</strong> ${encounter.name}</p>
						    <p><strong>Location:</strong> ${encounter.location}</p>
						    <p><strong>Date:</strong> ${encounter.date}</p>
						    <p>${encounter.text}</p>
						`;

					}
					detailElement.insertAdjacentHTML('afterbegin', `<p class="encounter-title">${name}</p>`);
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
