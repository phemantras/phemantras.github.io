document.addEventListener('DOMContentLoaded', async () => {
	const tooltip = document.getElementById('tooltip');
	const countries = document.querySelectorAll('.country');
	const detailElement = document.createElement('div');
	const titleContainer = document.querySelector('.title-container');
	const menuButton = document.querySelector('.menu-button');
	const burgerMenu = document.querySelector('.burger-menu');
	const overlay = document.querySelector('.burger-menu-overlay');
	const modals = document.querySelectorAll('.modal');
	const visitedCountriesList = document.getElementById('visited-countries-list');
	const statsContainer = document.querySelector('.stats-container');
	const newsfeedList = document.getElementById('newsfeed-list');
	const newsfeed = document.querySelector('.newsfeed');
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	let allEncounters = [];
	let encountersByCountry = {};

	// Detail-Element konfigurieren
	detailElement.classList.add('detail-element');
	document.body.appendChild(detailElement);

	// Schließen-Button für das Detail-Element (einmal anlegen)
	const detailCloseBtn = document.createElement('button');
	detailCloseBtn.className = 'close-btn';
	detailCloseBtn.innerHTML = '&times;';
	detailCloseBtn.addEventListener('click', () => {
		detailElement.style.display = 'none';
	});

	modals.forEach(modal => {
		const closeBtn = document.createElement('button');
		closeBtn.className = 'close-btn';
		closeBtn.innerHTML = '&times;';
		closeBtn.addEventListener('click', () => {
			tooltip.style.opacity = '0';
			modal.classList.remove('open');
			// Overlay nur entfernen, wenn kein Modal mehr offen ist
			if (![...modals].some(sm => sm.classList.contains('open'))) {
				overlay.classList.remove('open');
				menuButton.style.display = 'block';
			}
		});
		modal.insertBefore(closeBtn, modal.firstChild);
	});

	menuButton.addEventListener('click', () => {
		tooltip.style.opacity = '0';
		burgerMenu.classList.add('open');
		overlay.classList.add('open');
		menuButton.style.display = 'none';
	});

	overlay.addEventListener('click', () => {
		burgerMenu.classList.remove('open');
		// Alle Modals schließen
		modals.forEach(sm => sm.classList.remove('open'));
		// Overlay nur entfernen, wenn kein Modal mehr offen ist
		overlay.classList.remove('open');
		menuButton.style.display = 'block';
		tooltip.style.opacity = '0';
	});

	// Menüpunkt-Klick: Menü schließen, Modal öffnen, Overlay bleibt!
	document.querySelectorAll('.main-menu li').forEach(item => {
		item.addEventListener('click', () => {
			tooltip.style.opacity = '0';
			// Alle Submenüs schließen
			modals.forEach(sm => sm.classList.remove('open'));
			// Das passende öffnen
			const menu = item.getAttribute('data-menu');
			document.querySelector(`.${menu}-container`).classList.add('open');
			// Menü schließen, Overlay bleibt!
			burgerMenu.classList.remove('open');
			overlay.classList.add('open'); // Overlay bleibt aktiv!
			menuButton.style.display = 'block';
		});
	});

	document.querySelectorAll('.main-menu li').forEach(item => {
		item.addEventListener('click', () => {
			tooltip.style.opacity = '0';
			// Alle Submenüs schließen
			modals.forEach(sm => sm.classList.remove('open'));
			// Das passende öffnen
			const menu = item.getAttribute('data-menu');
			document.querySelector(`.${menu}-container`).classList.add('open');
			burgerMenu.classList.remove('open');
			overlay.classList.remove('open');
			menuButton.style.display = 'block';
		});
	});
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

	// Build a list of visited country "roots" only (groups with title or single country elements with title).
	// Avoid including subregion <path> elements that may lack a title attribute which caused NPEs when
	// later used to build fetch URLs.
	const visitedCountries = (() => {
		// Groups which represent countries and have a title
		const groups = Array.from(document.querySelectorAll('g.country[title].visited'));
		// Single elements (e.g. path) that have title and visited but are not inside a visited group
		const singles = Array.from(document.querySelectorAll('.country[title].visited')).filter(el => el.tagName.toLowerCase() !== 'g');
		const uniqueSingles = singles.filter(el => !el.closest('g.country[title].visited'));
		return [...groups, ...uniqueSingles];
	})();

	const toggleButton = document.createElement('div');
	toggleButton.classList.add('newsfeed-toggle');
	toggleButton.textContent = "👤 Latest Encounters";
	toggleButton.style.bottom = "19%";
	toggleButton.style.left = "50%";
	document.body.appendChild(toggleButton);

	// 🔹 Funktion: Newsfeed ein- und ausfahren
	toggleButton.addEventListener('click', () => {
		tooltip.style.opacity = '0';
		if (newsfeed.classList.contains('expanded')) {
			newsfeed.classList.remove('expanded');
			toggleButton.style.bottom = "10px"; // Zurück nach unten
		} else {
			newsfeed.classList.add('expanded');
			toggleButton.style.bottom = "19%"; // Hoch schieben
		}
	});

	const fetchEncounters = async () => {
		let id = 0;
		encountersByCountry = {}; // leeren
		for (const country of visitedCountries) {
			const countryName = country && country.getAttribute ? country.getAttribute('title') : null;
			if (!countryName) {
				// skip elements without a title (defensive)
				continue;
			}
			try {
				// URL-encode countryName to avoid issues with spaces / special chars
				const url = `encounters/${encodeURIComponent(countryName)}/data.json`;
				const response = await fetch(url);
				if (response.ok) {
					const data = await response.json();
					encountersByCountry[countryName] = data.encounters.map(encounter => ({
						...encounter,
						country: countryName,
						id: id++
					}));
				} else {
					// Non-OK responses are logged but don't stop processing other countries
					console.warn(`encounters data not found for ${countryName}:`, response.status);
				}
			} catch (error) {
				console.error(`Fehler beim Abrufen von ${countryName}:`, error);
			}
		}
		// Flache Liste für Newsfeed
		allEncounters = Object.values(encountersByCountry).flat();
		// Nach Datum sortieren
		allEncounters.sort((a, b) => new Date(b.date) - new Date(a.date));
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
				tooltip.style.opacity = '0';
				const countryElement = Array.from(visitedCountries).find(c => c.getAttribute('title') === encounter.country);
				if (countryElement && typeof countryElement.clickHandler === 'function') {
					setTimeout(() => {
						countryElement.clickHandler(encounter.id);
					}, 0);
				}
			});

			newsfeedList.appendChild(listItem);
		});
	};

	// 🔹 Encounters abrufen und Newsfeed befüllen
	await fetchEncounters();

	// Statistik aktualisieren
	if (statsContainer) {
		statsContainer.innerHTML = `<span id="countries-count">${visitedCountries.length}</span>/195 Countries`;
	}

	// Gastgeberländer, die ihre Farbe nicht ändern
	const hostCountries = ["Canada", "Mexico", "United States", "Germany"];


	// Track which country roots we've already processed so we only create one gradient per country
	const processedCountryRoots = new Set();

	countries.forEach(country => {
		const name = country.getAttribute('title');

		// Determine the root element representing the whole country: the <g.country> if present, otherwise the element itself
		const root = country.tagName.toLowerCase() === 'g' ? country : (country.closest && country.closest('g.country')) || country;

		// If we've already processed this root (another subpath mapped to it), skip to avoid duplicate gradients
		if (processedCountryRoots.has(root)) return;

		// Mark root as processed (even if we don't generate a gradient for it)
		processedCountryRoots.add(root);

		const rootName = root.getAttribute('title');

		if (!hostCountries.includes(rootName) && root.classList && root.classList.contains('visited')) {
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
			// Use a stable id based on the root element (prefer element id, fall back to title)
			const gradientIdBase = root.id || rootName || Math.random().toString(36).slice(2, 8);
			// Namespace generated ids to avoid colliding with hand-authored defs
			const gradientId = `ph-gradient-${gradientIdBase}`;
			const svg = document.getElementById('worldmap');
			if (!svg) {
				console.error('SVG element not found');
				return;
			}
			let defs = svg.querySelector('defs');
			if (!defs) {
				defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
				svg.insertBefore(defs, svg.firstChild);
			}
			// Make sure defs is properly attached to the SVG
			if (!defs.parentNode) {
				svg.insertBefore(defs, svg.firstChild);
			}
			const targetPoint = { x: 265, y: 340 };
			const viewBox = svg.viewBox.baseVal;

			const relativeTarget = {
				x: (targetPoint.x - viewBox.x) / viewBox.width,
				y: (targetPoint.y - viewBox.y) / viewBox.height,
			};

			const bbox = root.getBBox();
			const startX = bbox.x + bbox.width * 0.2;
			const startY = bbox.y + bbox.height * 0.2;

			const directionVector = {
				x1: (startX - viewBox.x) / viewBox.width,
				y1: (startY - viewBox.y) / viewBox.height,
				x2: relativeTarget.x,
				y2: relativeTarget.y,
			};

			const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
			// ensure unique, safe id in defs (sanitize whitespace/special chars)
			const sanitizeId = (s) => String(s).replace(/\s+/g, '-').replace(/[^A-Za-z0-9_\-]/g, '').toLowerCase();
			const safeBase = sanitizeId(gradientIdBase);
			// Use a prefixed id so we never accidentally clash with hand-authored ids like "germany-filter"
			const safeGradientId = `ph-gradient-${safeBase}`;
			gradient.setAttribute('id', safeGradientId);
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
			// Before appending/applying a generated gradient, detect if this root (or any of its
			// subpaths) already uses a hand-authored fill referencing a url(#...) — in that case
			// we must NOT generate or apply our gradient to avoid visual overlays (fixes Germany).
			const hasAuthorDefinedFill = (() => {
				try {
					// Check computed style on the root: if it resolves to a url(...) fill,
					// that means the author already painted the country via a pattern/gradient.
					const rootComputed = window.getComputedStyle(root);
					if (rootComputed && String(rootComputed.fill).includes('url(')) return true;

					// Also check the inline style attributes as a fallback
					const styleAttr = (root.getAttribute && root.getAttribute('style')) || '';
					if (styleAttr.includes('url(#')) return true;
					if (root.style && root.style.fill && String(root.style.fill).includes('url(#')) return true;

					// Check child paths' computed fills too (they may inherit from group)
					const childPaths = root.querySelectorAll && root.querySelectorAll('path');
					if (childPaths && childPaths.length) {
						for (const p of childPaths) {
							const pComputed = window.getComputedStyle(p);
							if (pComputed && String(pComputed.fill).includes('url(')) return true;
							const pStyle = (p.getAttribute && p.getAttribute('style')) || '';
							if (pStyle.includes('url(#')) return true;
							if (p.style && p.style.fill && String(p.style.fill).includes('url(#')) return true;
						}
					}
				} catch (err) {
					// Defensive: if computedStyle fails for any reason, fall back to attribute checks only
					const styleAttr = (root.getAttribute && root.getAttribute('style')) || '';
					if (styleAttr.includes('url(#')) return true;
				}
				return false;
			})();

			if (hasAuthorDefinedFill) {
				// Do not create/apply a generated gradient for this root — respect hand-authored styling.
				return;
			}

			// If a gradient with the same id already exists in defs, reuse it instead of appending
			if (!defs.querySelector(`#${CSS.escape(safeGradientId)}`)) {
				defs.appendChild(gradient);
			} else {
				// release the created element (garbage collected) and keep using existing id
			}

			// Wende den Gradient auf das Root-Element (Gruppe) und alle seine Subregionen an
			const finalGradientId = safeGradientId;
			if (root.tagName.toLowerCase() === 'g') {
				// Für Länder mit Subregionen — apply only to subpaths that don't already have an
				// author-defined url(...) fill to avoid overwriting/overlaying hand-authored styles.
				root.querySelectorAll('path').forEach(path => {
					// If the rendered/computed fill of the path already references a url(...), skip it.
					try {
						const comp = window.getComputedStyle(path);
						if (comp && String(comp.fill).includes('url(')) return; // skip
					} catch (e) {
						// ignore and fall back to attribute checks
					}
					const pStyleAttr = (path.getAttribute && path.getAttribute('style')) || '';
					if (pStyleAttr.includes('url(#')) return; // skip
					if (path.style && path.style.fill && String(path.style.fill).includes('url(#')) return;
					path.style.fill = `url(#${finalGradientId})`;
				});
			} else {
				// For single-element countries, if they already reference a url(...) skip applying.
				let shouldApplyRoot = true;
				try {
					const compRoot = window.getComputedStyle(root);
					if (compRoot && String(compRoot.fill).includes('url(')) shouldApplyRoot = false;
				} catch (e) {
					// ignore and rely on attribute checks
				}
				const rootStyle = (root.getAttribute && root.getAttribute('style')) || '';
				if (rootStyle.includes('url(#')) shouldApplyRoot = false;
				if (root.style && root.style.fill && String(root.style.fill).includes('url(#')) shouldApplyRoot = false;
				if (shouldApplyRoot) {
					root.style.fill = `url(#${finalGradientId})`;
				}
			}
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

		// Klick-Logik nur für visited-Länder und ihre Subregionen
		if (country.classList.contains('visited') || country.closest('.visited')) {
			const clickHandler = async (id = null) => {
				// Finde das Hauptland, entweder das Element selbst oder das übergeordnete g-Element
				const mainElement = country.tagName.toLowerCase() === 'g' ? country : country.closest('g.country');
				const mainCountry = mainElement ? mainElement.getAttribute('title') : name;
				const encounters = encountersByCountry[mainCountry] || [];
				detailElement.innerHTML = '';
				detailElement.appendChild(detailCloseBtn);
				const title = document.createElement('p');
				title.className = 'encounter-title';
				title.textContent = mainCountry;
				detailElement.appendChild(title);

				if (encounters.length > 1) {
					const encounterList = document.createElement('div');
					encounterList.classList.add('encounter-list');

					encounters.forEach((encounter, index) => {
						const encounterItem = document.createElement('div');
						encounterItem.classList.add('encounter-item');

						// "+" Button für Aufklappen
						const toggleButton = document.createElement('button');
						toggleButton.textContent = "+";
						toggleButton.classList.add('expand-btn');

						// Detailansicht (versteckt), erscheint unterhalb
						const encounterDetail = document.createElement('div');
						if (encounter.id === id) {
							encounterDetail.classList.add('expanded');
							toggleButton.textContent = "-";
						}
						encounterDetail.classList.add('encounter-detail');
						encounterDetail.innerHTML = `
                                <img src="encounters/${name}/${encounter.image}" alt="${encounter.name}" class="detail-image" />
                                <p><strong>Club:</strong> ${encounter.favClub}</p>
                                <p><strong>Player:</strong> ${encounter.favPlayer}</p>
                                <p><strong>Best game:</strong> ${encounter.favGame}</p>
                                <p><strong>WC26 Champions:</strong> ${encounter.wcc}</p>
                                <p class="story">${encounter.text}</p>
                            `;

						toggleButton.addEventListener('click', () => {
							tooltip.style.opacity = '0';
							encounterDetail.classList.toggle('expanded');
							if (encounterDetail.classList.contains('expanded')) {
								toggleButton.textContent = "-";
							} else {
								toggleButton.textContent = "+";
							}
						});

						const thumbnail = document.createElement('img');
						thumbnail.src = `encounters/${name}/${encounter.image}`;
						thumbnail.alt = encounter.name;
						thumbnail.classList.add('thumbnail');

						const info = document.createElement('div');
						info.classList.add('encounter-info');
						info.innerHTML = `<strong>${encounter.name}</strong> <p>${encounter.location}</p><p>${encounter.date}</p>`;

						encounterItem.appendChild(toggleButton);
						encounterItem.appendChild(thumbnail);
						encounterItem.appendChild(info);

						encounterList.appendChild(encounterItem);
						encounterList.appendChild(encounterDetail);
					});

					detailElement.appendChild(encounterList);
				} else if (encounters.length === 1) {
					const encounter = encounters[0];

					const img = document.createElement('img');
					const pName = document.createElement('p');
					const pLocation = document.createElement('p');
					const wcc = document.createElement('p');
					const favClub = document.createElement('p');
					const favPlayer = document.createElement('p');
					const favGame = document.createElement('p');
					const pText = document.createElement('p');
					
					
					img.src = `encounters/${name}/${encounter.image}`;
					img.alt = encounter.name;
					img.className = 'detail-image';
					pName.innerHTML = `<strong>Name:</strong> ${encounter.name}`;
					pLocation.innerHTML = `<strong>Location:</strong> ${encounter.location}`;
					favClub.innerHTML = `<strong>Club:</strong> ${encounter.favClub}`;
					favPlayer.innerHTML = `<strong>Player:</strong> ${encounter.favPlayer}`;
					favGame.innerHTML = `<strong>Best game:</strong> ${encounter.favGame}`;
					wcc.innerHTML = `<strong>WC26 Champions:</strong> ${encounter.wcc}`;
					pText.classList.add('story');
					pText.textContent = encounter.text;

					const pDate = document.createElement('p');
					pDate.classList.add('date')
					pDate.innerHTML = `${encounter.date}`;

					detailElement.appendChild(img);
					detailElement.appendChild(pName);
					detailElement.appendChild(pLocation);
					detailElement.appendChild(favClub);
					detailElement.appendChild(favPlayer);
					detailElement.appendChild(favGame);
					detailElement.appendChild(wcc);
					detailElement.appendChild(pText);
					detailElement.appendChild(pDate);
				}

				detailElement.style.display = 'block';
			};
			country.clickHandler = clickHandler;
			// Kombiniere Klick und Touch-Events
			country.addEventListener('click', (e) => {
				// Stop event from bubbling up to parent elements
				tooltip.style.opacity = '0';
				e.stopPropagation();
				clickHandler();
			});
			if (isTouchDevice) {
				country.addEventListener('touchend', (e) => {
					tooltip.style.opacity = '0';
					e.preventDefault();
					e.stopPropagation();
					clickHandler();
				});
			}
			
			// Wenn dies ein Länder-Element mit Subregionen ist, füge Event-Listener zu allen Pfaden hinzu
			if (country.tagName.toLowerCase() === 'g') {
				const subPaths = country.querySelectorAll('path');
				subPaths.forEach(path => {
					// Stelle sicher, dass der Pfad die country-Klasse hat
					
					
					// Füge die Event-Listener hinzu
					path.addEventListener('click', (e) => {
						tooltip.style.opacity = '0';
						const parentGroup = e.currentTarget.closest('g.country');
						if (parentGroup && typeof parentGroup.clickHandler === 'function') {
							parentGroup.clickHandler();
						}
					});

					if (isTouchDevice) {
						path.addEventListener('touchend', (e) => {
							tooltip.style.opacity = '0';
							e.preventDefault();
							e.stopPropagation();
							clickHandler();
						});
					}
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
			tooltip.style.opacity = '0';
			setTimeout(() => {
				modals.forEach(modal => modal.classList.remove('open'));
				element.clickHandler();
			}, 0);
		});
		visitedCountriesList.appendChild(li);
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
		tooltip.style.opacity = '0';
		// Detail-Element schließen
		if (!e.target.closest('.detail-element') && !e.target.classList.contains('visited')) {
			detailElement.style.display = 'none';
		}
		// Modal schließen
		const openModal = [...modals].find(m => m.classList.contains('open'));
		if (
			openModal &&
			!e.target.closest('.modal') &&
			!e.target.closest('.burger-menu')
		) {
			openModal.classList.remove('open');
			if (![...modals].some(m => m.classList.contains('open'))) {
				overlay.classList.remove('open');
				menuButton.style.display = 'block';
			}
		}
	});
});
