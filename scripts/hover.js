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
	const languageToggle = document.getElementById('language-toggle');
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	let newsfeedToggle = null;
	let allEncounters = [];
	let encountersByCountry = {};
	const sponsorsData = {
		ultra: [
			{ name: 'WorldBall Foundation', logo: 'logos/gold/worldball-foundation.png' },
			{ name: 'Ultra Travel', logo: 'logos/gold/ultra-travel.png' },
			{ name: 'Champion Gear', logo: 'logos/gold/champion-gear.png' },
		],
		supporter: [
			{ name: 'Matchday Media', logo: 'logos/silver/matchday-media.png' },
			{ name: 'Goal Logistics', logo: 'logos/silver/goal-logistics.png' },
			{ name: 'FanPulse', logo: 'logos/silver/fanpulse.png' },
		],
		fan: [
			{ name: 'Corner Cafe', logo: 'logos/bronze/corner-cafe.png' },
			{ name: 'Grassroots Travel', logo: 'logos/bronze/grassroots-travel.png' },
			{ name: 'Third Half', logo: 'logos/bronze/third-half.png' },
			{ name: 'Local Eleven', logo: 'logos/bronze/local-eleven.png' },
		],
	};
	const sponsorsContainer = document.querySelector('.sponsors-container');
	const fanNamesContainer = document.getElementById('fan-names-grid');
	let displayNamesDe = null;
	try {
		displayNamesDe = new Intl.DisplayNames(['de'], { type: 'region' });
	} catch (e) {
		displayNamesDe = null;
	}
	const countryNameOverrides = {
		en: {
			England: 'England',
			Wales: 'Wales',
			'Northern Ireland': 'Northern Ireland',
			Scotland: 'Scotland',
			'China PR': 'China',
			'People\'s Republic of China': 'China',
			China: 'China',
		},
		de: {
			England: 'England',
			Wales: 'Wales',
			'Northern Ireland': 'Nordirland',
			Scotland: 'Schottland',
			'China PR': 'China',
			'People\'s Republic of China': 'China',
			China: 'China',
		},
	};
	const translations = {
		en: {
			'menu.about': 'About us',
			'menu.countries': 'Countries',
			'menu.sponsors': 'Sponsors',
			'subtitle.journey': 'Uncover the stories of football fans we meet on our journey to New Jersey',
			'about.title': 'About us',
			'about.p1': 'We are Andy & Andy, two football fans and friends from Nuremberg, Franconia, Germany, embarking on a unique journey to the 2026 World Cup. Since the announcement in 2018 that the tournament would be hosted across the USA, Mexico, and Canada, we\'ve dreamed of making this event a once-in-a-lifetime experience by immersing ourselves fully throughout the entire competition.',
			'about.p2': 'Our mission is to <strong>connect with football fans from all 211 FIFA countries around the world</strong> as we travel, <strong>visit every stadium</strong> hosting the 2026 World Cup, and passionately <strong>follow the German national team</strong> all the way to the final. This journey is about more than just football - it\'s about the global community, culture, and unforgettable stories we\'ll share along the way.',
			'about.p3': 'We are kicking off our adventure at the UEFA Nations League Final Four in Germany in June 2025, followed by the UEFA Under-21 Championship in Slovakia. Each step brings us closer to our ultimate goal of being part of the 2026 World Cup atmosphere from start to finish.',
			'sponsors.title': 'Sponsors',
			'sponsors.hint': 'Thanks for your support!',
			'sponsors.ultra': 'Ultra',
			'sponsors.supporter': 'Supporter',
			'sponsors.fan': 'Fan',
			'sponsors.fanNamesLabel': 'Special thanks to:',
			newsfeedToggle: 'Latest Encounters',
			detailLabelName: 'Name',
			detailLabelLocation: 'Location',
			detailLabelClub: 'Club',
			detailLabelPlayer: 'Player',
			detailLabelBestGame: 'Best game',
			detailLabelChampions: 'WC26 Champions',
			languageToggleLabel: 'Switch language',
			statsLabelCountries: 'Countries',
		},
		de: {
			'menu.about': 'Ueber uns',
			'menu.countries': 'Laender',
			'menu.sponsors': 'Sponsoren',
			'subtitle.journey': 'Entdecke unsere Stories ueber Fans, die wir auf dem Weg nach New Jersey treffen',
			'about.title': 'Ueber uns',
			'about.p1': 'Wir sind Andy & Andy, zwei Fussballfans und Freunde aus Nuernberg (Franken, Deutschland), die sich auf eine besondere Reise zur WM 2026 machen. Seit der Ankuendigung 2018, dass das Turnier in den USA, Mexiko und Kanada ausgetragen wird, traeumen wir davon, dieses Ereignis als einmalige Erfahrung zu erleben und ganz in den Wettbewerb einzutauchen.',
			'about.p2': 'Unsere Mission ist es, <strong>mit Fussballfans aus allen 211 FIFA-Laendern der Welt in Kontakt zu kommen</strong>, <strong>jedes Stadion</strong> der WM 2026 zu besuchen und die <strong>deutsche Nationalmannschaft</strong> leidenschaftlich bis ins Finale zu begleiten. Diese Reise ist mehr als nur Fussball - es geht um Gemeinschaft, Kultur und unvergessliche Geschichten, die wir teilen werden.',
			'about.p3': 'Wir starten unser Abenteuer beim UEFA Nations League Final Four in Deutschland im Juni 2025, gefolgt von der U21-Europameisterschaft in der Slowakei. Jeder Schritt bringt uns naeher an unser Ziel, die WM 2026 von Anfang bis Ende mitzuerleben.',
			'sponsors.title': 'Sponsoren',
			'sponsors.hint': 'Danke fuer eure Unterstuetzung!',
			'sponsors.ultra': 'Ultra',
			'sponsors.supporter': 'Supporter',
			'sponsors.fan': 'Fan',
			'sponsors.fanNamesLabel': 'Danke auch an:',
			newsfeedToggle: 'Neueste Begegnungen',
			detailLabelName: 'Name',
			detailLabelLocation: 'Ort',
			detailLabelClub: 'Verein',
			detailLabelPlayer: 'Spieler',
			detailLabelBestGame: 'Bestes Spiel',
			detailLabelChampions: 'WM26-Sieger',
			languageToggleLabel: 'Sprache wechseln',
			statsLabelCountries: 'Laender',
		},
	};
	const detectLanguage = () => {
		const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
		return lang.startsWith('de') ? 'de' : 'en';
	};
	let currentLanguage = detectLanguage();
	const getCountryCode = (element) => {
		const rawId = (element && (element.id || element.getAttribute && element.getAttribute('id'))) || '';
		if (!rawId) return null;
		const letters = rawId.replace(/[^a-zA-Z]/g, '');
		if (!letters) return null;
		if (letters.length > 3) return null;
		if (letters.length === 2 || letters.length === 3) return letters.toUpperCase();
		return null;
	};
	const getLocalizedCountryName = (title, element) => {
		const overrides = countryNameOverrides[currentLanguage] || {};
		const normalizedTitle = title ? title.trim() : '';
		if (normalizedTitle && overrides[normalizedTitle]) return overrides[normalizedTitle];
		if (currentLanguage === 'de' && displayNamesDe) {
			const code = getCountryCode(element);
			if (code) {
				const localized = displayNamesDe.of(code);
				if (localized && typeof localized === 'string') return localized;
			}
		}
		return normalizedTitle || title;
	};

	// Build a list of visited country "roots" only (groups with title or single country elements with title).
	// Avoid including subregion <path> elements that may lack a title attribute which caused NPEs when
	// later used to build fetch URLs.
	const getVisitedCountries = () => {
		// Groups which represent countries and have a title
		const groups = Array.from(document.querySelectorAll('g.country[title].visited'));
		// Single elements (e.g. path) that have title and visited but are not inside a visited group
		const singles = Array.from(document.querySelectorAll('.country[title].visited')).filter(el => el.tagName.toLowerCase() !== 'g');
		const uniqueSingles = singles.filter(el => !el.closest('g.country[title].visited'));
		return [...groups, ...uniqueSingles];
	};
	const t = (key) => translations[currentLanguage]?.[key] || translations.en[key] || key;
	const updateStats = () => {
		if (!statsContainer) return;
		const count = getVisitedCountries().length;
		statsContainer.innerHTML = `<span id="countries-count">${count}</span>/211 ${t('statsLabelCountries')}`;
	};
	const renderVisitedCountriesList = () => {
		if (!visitedCountriesList) return;
		visitedCountriesList.innerHTML = '';
		const visitedCountriesArray = Array.from(getVisitedCountries()).map(countryElement => {
			const name = countryElement.getAttribute('title');
			return { name, element: countryElement };
		});
		visitedCountriesArray.sort((a, b) => {
			const nameA = getLocalizedCountryName(a.name, a.element);
			const nameB = getLocalizedCountryName(b.name, b.element);
			return nameA.localeCompare(nameB, currentLanguage === 'de' ? 'de' : 'en');
		});
		visitedCountriesArray.forEach(({ name, element }) => {
			const li = document.createElement('li');
			li.textContent = getLocalizedCountryName(name, element);
			li.addEventListener('click', () => {
				tooltip.style.opacity = '0';
				setTimeout(() => {
					modals.forEach(modal => modal.classList.remove('open'));
					element.clickHandler();
				}, 0);
			});
			visitedCountriesList.appendChild(li);
		});
	};
	const applyTranslations = () => {
		const dict = translations[currentLanguage] || translations.en;
		document.documentElement.lang = currentLanguage;
		document.querySelectorAll('[data-i18n]').forEach((el) => {
			const key = el.dataset.i18n;
			const value = dict[key];
			if (!value) return;
			if (el.dataset.i18nType === 'html') {
				el.innerHTML = value;
			} else {
				el.textContent = value;
			}
		});
		if (newsfeedToggle) {
			newsfeedToggle.textContent = dict.newsfeedToggle;
		}
		if (languageToggle) {
    languageToggle.textContent = currentLanguage === 'de' ? 'DE' : 'EN';
    languageToggle.setAttribute('aria-label', dict.languageToggleLabel);
  }
		updateStats();
		renderVisitedCountriesList();
	};
	if (languageToggle) {
		languageToggle.addEventListener('click', () => {
			currentLanguage = currentLanguage === 'de' ? 'en' : 'de';
			applyTranslations();
		});
	}
	applyTranslations();

	// Detail-Element konfigurieren
	detailElement.classList.add('detail-element');
	document.body.appendChild(detailElement);

	// SchlieÃŸen-Button fÃ¼r das Detail-Element (einmal anlegen)
	const detailCloseBtn = document.createElement('button');
	detailCloseBtn.className = 'close-btn';
	detailCloseBtn.innerHTML = '&times;';
	detailCloseBtn.addEventListener('click', () => {
		detailElement.style.display = 'none';
	});

	const fetchFanNames = async () => {
		try {
			const response = await fetch('fans/fans.txt');
			if (!response.ok) return [];
			const text = await response.text();
			return text
				.split(/\r?\n/)
				.map((line) => line.trim())
				.filter(Boolean);
		} catch (error) {
			console.error('Fehler beim Laden der Fan-Namen:', error);
			return [];
		}
	};

	const renderFanNames = async () => {
		if (!fanNamesContainer) return;
		const names = await fetchFanNames();
		fanNamesContainer.innerHTML = '';
		if (!names.length) return;
		names.forEach((name) => {
			const nameItem = document.createElement('div');
			nameItem.className = 'fan-name';
			nameItem.textContent = name;
			fanNamesContainer.appendChild(nameItem);
		});
	};

	const renderSponsors = () => {
		if (!sponsorsContainer) return;
		Object.entries(sponsorsData).forEach(([tier, list]) => {
			const grid = sponsorsContainer.querySelector(`.sponsor-grid[data-tier="${tier}"]`);
			if (!grid) return;
			grid.innerHTML = '';
			list.forEach((sponsor) => {
				const card = document.createElement('div');
				card.className = `sponsor-card ${tier}`;
				card.innerHTML = `
					<div class="sponsor-logo-wrapper">
						<img src="${sponsor.logo}" alt="${sponsor.name} logo">
					</div>
					<p class="sponsor-name">${sponsor.name}</p>
				`;
				grid.appendChild(card);
			});
		});
	};

	renderSponsors();
	renderFanNames();

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
		// Alle Modals schlieÃŸen
		modals.forEach(sm => sm.classList.remove('open'));
		// Overlay nur entfernen, wenn kein Modal mehr offen ist
		overlay.classList.remove('open');
		menuButton.style.display = 'block';
		tooltip.style.opacity = '0';
	});

	const openMenuModal = (menu) => {
		tooltip.style.opacity = '0';
		modals.forEach(sm => sm.classList.remove('open'));
		const targetModal = document.querySelector(`.${menu}-container`);
		if (targetModal) {
			targetModal.classList.add('open');
			overlay.classList.add('open');
			if (menu === 'sponsors') {
				renderFanNames();
			}
		} else {
			overlay.classList.remove('open');
		}
		burgerMenu.classList.remove('open');
		menuButton.style.display = 'block';
	};

	document.querySelectorAll('.main-menu li').forEach(item => {
		item.addEventListener('click', () => {
			const menu = item.getAttribute('data-menu');
			openMenuModal(menu);
		});
	});
	// Funktion: Liste der verfÃ¼gbaren LÃ¤nder aus der lokalen JSON laden
	const getEncounteredCountries = async () => {
		try {
			const response = await fetch('encounters/encounters.json');
			if (response.ok) {
				return await response.json(); // JSON-Inhalt zurÃ¼ckgeben
			} else {
				console.error('Fehler beim Abrufen der encounters.json');
			}
		} catch (error) {
			console.error('Fehler beim Zugriff auf die encounters.json:', error);
		}
		return [];
	};

	// LÃ¤nder aus der JSON-Datei abrufen
	const encounteredCountries = await getEncounteredCountries();

	// LÃ¤nder markieren, die in der JSON aufgelistet sind
	encounteredCountries.forEach((countryName) => {
		const countryElement = Array.from(countries).find(
			(country) => country.getAttribute('title') === countryName
		);
		if (countryElement) {
			countryElement.classList.add('visited');

		}
	});

	updateStats();
	renderVisitedCountriesList();

	newsfeedToggle = document.createElement('div');
	newsfeedToggle.classList.add('newsfeed-toggle');
	newsfeedToggle.textContent = t('newsfeedToggle');
	newsfeedToggle.style.bottom = "10px";
	newsfeedToggle.style.left = "50%";
	document.body.appendChild(newsfeedToggle);
	applyTranslations();

	// Newsfeed ein- und ausfahren
	newsfeedToggle.addEventListener('click', () => {
		tooltip.style.opacity = '0';
		if (newsfeed.classList.contains('expanded')) {
			newsfeed.classList.remove('expanded');
			newsfeedToggle.style.bottom = "10px";
		} else {
			newsfeed.classList.add('expanded');
			newsfeedToggle.style.bottom = "19%";
		}
	});

	const fetchEncounters = async () => {
		let id = 0;
		encountersByCountry = {}; // leeren
		for (const country of getVisitedCountries()) {
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
		// Flache Liste fÃ¼r Newsfeed
		allEncounters = Object.values(encountersByCountry).flat();
		// Nach Datum sortieren
		allEncounters.sort((a, b) => new Date(b.date) - new Date(a.date));
		populateNewsfeed();
	};

	// ðŸ”¹ Funktion: Newsfeed mit Encounters anzeigen
	const populateNewsfeed = () => {
		newsfeedList.innerHTML = ''; // Liste leeren

		allEncounters.forEach(encounter => {
			const listItem = document.createElement('li');
			listItem.classList.add('newsfeed-item');

			// ðŸ”¹ Thumbnail + Kurzinfo
			listItem.innerHTML = `
		            <img src="encounters/${encounter.country}/${encounter.image}" alt="${encounter.name}" class="newsfeed-thumbnail" />
		            <div class="newsfeed-info">
		                <p><strong>${encounter.date} ${encounter.name} </strong></p>
						<p>${encounter.location}, ${encounter.country}</p>
		            </div>
		        `;

			// ðŸ”¹ Beim Klicken auf das Newsfeed-Item â†’ Land auf der Karte Ã¶ffnen
			listItem.addEventListener('click', () => {
				tooltip.style.opacity = '0';
				const countryElement = Array.from(getVisitedCountries()).find(c => c.getAttribute('title') === encounter.country);
				if (countryElement && typeof countryElement.clickHandler === 'function') {
					setTimeout(() => {
						countryElement.clickHandler(encounter.id);
					}, 0);
				}
			});

			newsfeedList.appendChild(listItem);
		});
	};

	// ðŸ”¹ Encounters abrufen und Newsfeed befÃ¼llen
	await fetchEncounters();

	// Statistik aktualisieren
	updateStats();

	// GastgeberlÃ¤nder, die ihre Farbe nicht Ã¤ndern
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
			// ZufÃ¤llige gedeckte Farbe generieren
			const generateRandomColor = () => {
				const r = Math.random() * 150 + 50; // Gedecktes Rot (50-200)
				const g = Math.random() * 150 + 50; // Gedecktes GrÃ¼n (50-200)
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
			// subpaths) already uses a hand-authored fill referencing a url(#...) â€” in that case
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
				// Do not create/apply a generated gradient for this root â€” respect hand-authored styling.
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
				// FÃ¼r LÃ¤nder mit Subregionen â€” apply only to subpaths that don't already have an
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
			const displayName = getLocalizedCountryName(name, root);
			tooltip.textContent = displayName;
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

		// Tooltip fÃ¼r alle GerÃ¤te
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

		// Klick-Logik nur fÃ¼r visited-LÃ¤nder und ihre Subregionen
		if (country.classList.contains('visited') || country.closest('.visited')) {
			const clickHandler = async (id = null) => {
				// Finde das Hauptland, entweder das Element selbst oder das Ã¼bergeordnete g-Element
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

						// "+" Button fÃ¼r Aufklappen
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
                                <p><strong>${t('detailLabelClub')}:</strong> ${encounter.favClub}</p>
                                <p><strong>${t('detailLabelPlayer')}:</strong> ${encounter.favPlayer}</p>
                                <p><strong>${t('detailLabelBestGame')}:</strong> ${encounter.favGame}</p>
                                <p><strong>${t('detailLabelChampions')}:</strong> ${encounter.wcc}</p>
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
					pName.innerHTML = `<strong>${t('detailLabelName')}:</strong> ${encounter.name}`;
					pLocation.innerHTML = `<strong>${t('detailLabelLocation')}:</strong> ${encounter.location}`;
					favClub.innerHTML = `<strong>${t('detailLabelClub')}:</strong> ${encounter.favClub}`;
					favPlayer.innerHTML = `<strong>${t('detailLabelPlayer')}:</strong> ${encounter.favPlayer}`;
					favGame.innerHTML = `<strong>${t('detailLabelBestGame')}:</strong> ${encounter.favGame}`;
					wcc.innerHTML = `<strong>${t('detailLabelChampions')}:</strong> ${encounter.wcc}`;
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

			// Wenn dies ein LÃ¤nder-Element mit Subregionen ist, fÃ¼ge Event-Listener zu allen Pfaden hinzu
			if (country.tagName.toLowerCase() === 'g') {
				const subPaths = country.querySelectorAll('path');
				subPaths.forEach(path => {
					// Stelle sicher, dass der Pfad die country-Klasse hat


					// FÃ¼ge die Event-Listener hinzu
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
		console.error('SVG-Element nicht gefunden. Bitte Ã¼berprÃ¼fe deinen Selektor oder die HTML-Struktur.');
	}

	// Detail-Element schlieÃŸen, wenn auÃŸerhalb geklickt wird
	document.addEventListener('click', (e) => {
		tooltip.style.opacity = '0';
		// Detail-Element schlieÃŸen
		if (!e.target.closest('.detail-element') && !e.target.classList.contains('visited')) {
			detailElement.style.display = 'none';
		}
		// Modal schlieÃŸen
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






