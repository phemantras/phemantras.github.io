document.addEventListener('DOMContentLoaded', async () => {
	const tooltip = document.getElementById('tooltip');
	const worldmap = document.getElementById('worldmap');
	if (worldmap) {
		// Normalize country roots: if a titled group contains country paths, treat the group as country root.
		worldmap.querySelectorAll('g[title]').forEach((group) => {
			if (!group.classList.contains('country') && group.querySelector('.country')) {
				group.classList.add('country');
			}
		});
	}
	let countries = Array.from(document.querySelectorAll('.country'));
	const detailElement = document.createElement('div');
	const startScreen = document.querySelector('.start-screen');
	const titleContainer = document.querySelector('.title-container');
	const overlay = document.querySelector('.modal-overlay');
	const modals = document.querySelectorAll('.modal');
	const mapModal = document.getElementById('map-modal');
	const modalCards = document.querySelectorAll('.modal-card');
	const donateButton = document.querySelector('.donate-button');
	const modalTriggers = document.querySelectorAll('.modal-card');
	const visitedCountriesList = document.getElementById('visited-countries-list');
	const statsContainer = document.querySelector('.stats-container');
	const newsfeedList = document.getElementById('newsfeed-list');
	const newsfeed = document.querySelector('.newsfeed');
	const languageToggle = document.getElementById('language-toggle');
	const donateBusinessLink = document.querySelector('.donate-link[data-i18n="donate.business"]');
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	let newsfeedToggle = null;
	let mapPanzoom = null;
	let allEncounters = [];
	let encountersByCountry = {};
	let activeEncounterDetail = null;
	const sponsorsData = { main: [], ultra: [], supporter: [], fan: [] };
	const sponsorsContainer = document.querySelector('.sponsors-container');
	const bottomLogosContainer = document.getElementById('bottom-logos');
	const fanNamesContainer = document.getElementById('fan-names-grid');
	const projectsTabsContainer = document.getElementById('projects-club-tabs');
	const projectsContentContainer = document.getElementById('projects-club-content');
	const projectsGalleryContainer = document.getElementById('projects-gallery');
	let projectGalleryRequestId = 0;
	const projectGalleryCache = {};
	let projectLightbox = null;
	let projectLightboxImages = [];
	let projectLightboxIndex = 0;
	const clubProjects = [
		{
			id: 'ww',
			name: 'ASV Weinzierlein',
			logo: 'images/logos/clubs/ww.png',
			projects: [
				{ de: 'Anschaffung Ballpumpe und Materialw\u00e4gen', en: 'Purchase of a ball pump and material carts' },
				{ de: 'Erneuerung Kabinenlueftung', en: 'Renewal of locker room ventilation' },
				{ de: 'Kauf von Trikotsatz f\u00fcr Jugend', en: 'Purchase of a youth jersey set' },
				{ de: 'Anschaffung neuer Trainingsanz\u00fcge f\u00fcr Jugend', en: 'Purchase of new tracksuits for youth teams' },
				{ de: 'Renovierung Duschen', en: 'Renovation of showers' },
				{ de: 'Sanierung Rasenfl\u00e4chen', en: 'Renovation of pitch turf areas' },
			],
		},
		{
			id: 'asv',
			name: 'ASV Zirndorf',
			logo: 'images/logos/clubs/asv.png',
			projects: [
				{ de: 'Anschaffung Tore f\u00fcr Jugend', en: 'Purchase of goals for youth teams' },
				{ de: 'Anschaffung neuer Fu\u00dfb\u00e4lle', en: 'Purchase of new footballs' },
				{ de: 'Kauf von Kleinfeld Markierungen', en: 'Purchase of small-sided field markings' },
				{ de: 'Modernisierung Flutlicht', en: 'Modernization of floodlights' },
				{ de: 'Anschaffung M\u00e4hroboter', en: 'Purchase of a robotic mower' },
				{ de: 'Kauf von Verkaufsh\u00fctte f\u00fcr Jugend', en: 'Purchase of a sales hut for youth teams' },
			],
		},
		{
			id: 'svw',
			name: 'SV Weiherhof',
			logo: 'images/logos/clubs/svw.png',
			projects: [
				{ de: 'Anschaffung Funino Tore f\u00fcr Jugend', en: 'Purchase of Funino goals for youth teams' },
				{ de: 'Kauf von Fu\u00dfb\u00e4llen f\u00fcr Herren- und Jugendmannschaften', en: 'Purchase of footballs for senior and youth teams' },
				{ de: 'Anschaffung Bodenfr\u00e4se mit Anbauger\u00e4ten', en: 'Purchase of a tiller with attachments' },
				{ de: 'Kauf von Trikots\u00e4tzen f\u00fcr Herrenmannschaft', en: 'Purchase of jersey sets for the senior team' },
			],
		},
		{
			id: 'tsv',
			name: 'TSV Zirndorf',
			logo: 'images/logos/clubs/tsv.png',
			projects: [
				{ de: 'Anschaffung Minitore f\u00fcr Jugend', en: 'Purchase of mini goals for youth teams' },
				{ de: 'Modernisierung Flutlicht', en: 'Modernization of floodlights' },
				{ de: 'Renovierung Verkaufsraum und Kueche', en: 'Renovation of sales room and kitchen' },
				{ de: 'Durchfuehrung Jugend Feriencamp', en: 'Organization of a youth holiday camp' },
			],
		},
	];
	const mainSponsorLinks = {
		'hausverwaltung-brueckner': 'https://www.hausverwaltung-brueckner.de',
		cmap_logo: 'https://cmap.shop',
		cmap: 'https://cmap.shop',
		'hilpert-media': 'https://hilpert-media.de',
		printmedia: 'http://my-print-store.de/',
	};
	const supporterLinks = {
		enzo_pulera: 'https://share.google/9vnt4oWQMqib09kkB',
		juwelier_koluman: 'https://juwelier-koluman.de/',
		riess_fliesenverlegung: 'https://www.fliesenleger-nuernberg.de/',
		kfz_gruebl: 'https://kfz-gruebl.de/',
		schemm_consulting: 'https://www.schemm-finance.de/',
		arnulf_rocks: 'https://www.arnulf.rocks/',
		der_kleine_grieche: 'https://www.kleiner-grieche.de/',
		mosena: 'https://eiscafe-mosena.eatbu.com/?lang=de',
		goldener_loewe: 'https://share.google/tD0fOsHPZAhXYykUQ',
		antonio: 'https://share.google/QfIXGlVNq6zIvNQph',
		baeckerei_beck: 'https://share.google/VFKI9jyzyDghQxHtV',
		'90fuenfdreizehn': 'https://90fuenfdreizehn.myspreadshop.de',
		pizza_deluxe: 'https://www.pizza-deluxe-zirndorf.de/',
		'das gute zirndorfer': 'https://www.zirndorfer.de/',
	};
	const fallbackSponsorLink = null;
	const mainSponsorOrder = ['hausverwaltung-brueckner', 'printmedia', 'hilpert-media', 'cmap'];
	const supporterOrder = ['enzo_pulera', 'juwelier_koluman', 'baeckerei_beck', 'riess_fliesenverlegung', 'kfz_gruebl', 'schemm_consulting', 'arnulf_rocks', 'der_kleine_grieche', 'mosena', 'goldener_loewe', 'antonio', '90fuenfdreizehn', 'pizza_deluxe', 'das gute zirndorfer'];
	const mainSponsorDisplayNames = {
		'hausverwaltung-brueckner': 'Hausver\u00adwaltung Br\u00fcckner',
		printmedia: 'Printmedia',
		'hilpert-media': 'Hilpert Media',
		cmap: 'CMAP',
		cmap_logo: 'CMAP',
	};
	const supporterDisplayNames = {
		antonio: 'Antonio Stile Italiano',
		der_kleine_grieche: 'Der kleine Grieche',
		goldener_loewe: 'Goldener L\u00f6we',
		juwelier_koluman: 'Juwelier Koluman',
		kfz_gruebl: 'KFZ Gr\u00fcbl',
		mosena: 'Eiscafe Mosena',
		pizza_deluxe: 'Pizza de Luxe',
		riess_fliesenverlegung: 'Riess Fliesen- verlegung',
		'das gute zirndorfer': 'Das Gute Zirndorfer',
	};
	const logoDirectories = {
		main: 'images/logos/sponsors',
		ultra: 'images/logos/ultra',
		supporter: 'images/logos/supporter',
		fan: 'images/logos/fan',
	};

	const imagePattern = /\.(png|jpe?g|svg|webp|gif|avif)$/i;
	let assetManifestPromise = null;
	const hausverwaltungPattern = /hausverwaltung.*br.*ckner/u;
	const normalizeSupporterKey = (value) =>
		String(value || '')
			.toLowerCase()
			.replace(/\u00e4|ä/g, 'ae')
			.replace(/\u00f6|ö/g, 'oe')
			.replace(/\u00fc|ü/g, 'ue')
			.replace(/ß/g, 'ss')
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
	const normalizedSupporterLinks = Object.fromEntries(
		Object.entries(supporterLinks).map(([key, value]) => [normalizeSupporterKey(key), value])
	);
	const normalizedSupporterOrder = supporterOrder.map((key) => normalizeSupporterKey(key));
	const normalizedSupporterDisplayNames = Object.fromEntries(
		Object.entries(supporterDisplayNames).map(([key, value]) => [normalizeSupporterKey(key), value])
	);

	const getNameFromFilename = (fileName) =>
		fileName
			.replace(/\.[^/.]+$/, '')
			.replace(/[_-]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

	const getSlugFromFilename = (fileName) => fileName.replace(/\.[^/.]+$/, '').toLowerCase();
	const getCanonicalSponsorSlug = (slug, tier) => {
		const lower = String(slug || '').toLowerCase();
		if (tier === 'main' && hausverwaltungPattern.test(lower)) return 'hausverwaltung-brueckner';
		if (tier === 'supporter') {
			const normalized = normalizeSupporterKey(lower);
			if (/^b.*ckerei_beck$/u.test(lower)) return 'baeckerei_beck';
			if (/^90f.*nfdreizehn$/u.test(lower)) return '90fuenfdreizehn';
			return normalized;
		}
		return lower
			.replace(/\u00e4|ä/g, 'ae')
			.replace(/\u00f6|ö/g, 'oe')
			.replace(/\u00fc|ü/g, 'ue')
			.replace(/ß/g, 'ss');
	};

	const getGitHubRepoFromHostname = () => {
		const host = window.location.hostname.toLowerCase();
		if (host.endsWith('.github.io')) {
			const owner = host.split('.')[0];
			return { owner, repo: `${owner}.github.io` };
		}
		return { owner: 'phemantras', repo: 'phemantras.github.io' };
	};

	const fetchFilesViaGitHubApi = async (dir) => {
		const repo = getGitHubRepoFromHostname();
		if (!repo) return [];
		const apiUrl = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${dir}`;
		const response = await fetch(apiUrl);
		if (!response.ok) return [];
		const data = await response.json();
		if (!Array.isArray(data)) return [];
		return data
			.filter((item) => item && item.type === 'file' && imagePattern.test(item.name))
			.map((item) => item.name)
			.sort((a, b) => a.localeCompare(b, 'de'));
	};

	const fetchFilesViaDirectoryListing = async (dir) => {
		const response = await fetch(`${dir}/`);
		if (!response.ok) return [];
		const html = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const names = Array.from(doc.querySelectorAll('a'))
			.map((a) => (a.getAttribute('href') || '').trim())
			.filter(Boolean)
			.map((href) => {
				const cleaned = href.split('?')[0].split('#')[0];
				return cleaned.endsWith('/') ? '' : decodeURIComponent(cleaned.split('/').pop());
			})
			.filter((name) => imagePattern.test(name))
			.sort((a, b) => a.localeCompare(b, 'de'));
		return [...new Set(names)];
	};

	const loadAssetManifest = async () => {
		if (!assetManifestPromise) {
			assetManifestPromise = fetch('assets/manifest.json')
				.then((response) => (response.ok ? response.json() : null))
				.catch(() => null);
		}
		return assetManifestPromise;
	};

	const getManifestFilesForDir = async (dir) => {
		const manifest = await loadAssetManifest();
		if (!manifest || typeof manifest !== 'object') return null;
		if (!Object.prototype.hasOwnProperty.call(manifest, dir)) return null;
		const files = manifest[dir];
		if (!Array.isArray(files)) return [];
	return files
		.filter((name) => typeof name === 'string' && imagePattern.test(name));
	};

	const loadLogoFiles = async (dir) => {
		const manifestFiles = await getManifestFilesForDir(dir);
		if (manifestFiles !== null) return manifestFiles;

		try {
			const githubFiles = await fetchFilesViaGitHubApi(dir);
			if (githubFiles.length) return githubFiles;
		} catch (error) {
			console.warn(`GitHub API listing failed for ${dir}:`, error);
		}
		try {
			return await fetchFilesViaDirectoryListing(dir);
		} catch (error) {
			console.warn(`Directory listing failed for ${dir}:`, error);
			return [];
		}
	};

	const buildSponsorEntries = (tier, files) => {
		const entries = files.map((fileName) => {
			const rawSlug = getSlugFromFilename(fileName);
			const lookupSlug = getCanonicalSponsorSlug(rawSlug, tier);
			let link = null;
			if (tier === 'main') {
				link = mainSponsorLinks[lookupSlug] || fallbackSponsorLink;
			} else if (tier === 'supporter') {
				link = normalizedSupporterLinks[lookupSlug] || fallbackSponsorLink;
			}
			return {
				name: tier === 'main'
					? (mainSponsorDisplayNames[lookupSlug] || getNameFromFilename(fileName))
					: tier === 'supporter'
						? (normalizedSupporterDisplayNames[lookupSlug] || getNameFromFilename(fileName))
						: getNameFromFilename(fileName),
				logo: logoDirectories[tier] + '/' + fileName,
				link,
				slug: lookupSlug,
			};
		});
		if (tier === 'main') {
			return entries.sort((a, b) => {
				const aIndex = mainSponsorOrder.indexOf(a.slug);
				const bIndex = mainSponsorOrder.indexOf(b.slug);
				const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
				const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
				if (aRank !== bRank) return aRank - bRank;
				return a.name.localeCompare(b.name, 'de');
			});
		}
		if (tier === 'supporter') {
			return entries.sort((a, b) => {
				const aIndex = normalizedSupporterOrder.indexOf(a.slug);
				const bIndex = normalizedSupporterOrder.indexOf(b.slug);
				const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
				const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
				if (aRank !== bRank) return aRank - bRank;
				return a.name.localeCompare(b.name, 'de');
			});
		}
		return entries;
	};
	const loadSponsorsData = async () => {
		const [mainFiles, ultraFiles, supporterFiles, fanFiles] = await Promise.all([
			loadLogoFiles(logoDirectories.main),
			loadLogoFiles(logoDirectories.ultra),
			loadLogoFiles(logoDirectories.supporter),
			loadLogoFiles(logoDirectories.fan),
		]);
		sponsorsData.main = buildSponsorEntries('main', mainFiles);
		sponsorsData.ultra = buildSponsorEntries('ultra', ultraFiles);
		sponsorsData.supporter = buildSponsorEntries('supporter', supporterFiles);
		sponsorsData.fan = [];
	};

	const loadProjectImages = async () => {
		const cacheKey = 'all';
		if (projectGalleryCache[cacheKey]) return projectGalleryCache[cacheKey];
		const dir = 'images/projects';
		const files = await loadLogoFiles(dir);
		const images = files.map((fileName) => ({
			src: `${dir}/${fileName}`,
			name: getNameFromFilename(fileName),
		}));
		projectGalleryCache[cacheKey] = images;
		return images;
	};

	const ensureProjectLightbox = () => {
		if (projectLightbox || !projectsContentContainer) return;
		projectLightbox = document.createElement('div');
		projectLightbox.className = 'project-lightbox';
		projectLightbox.innerHTML = `
			<button type="button" class="project-lightbox-close" aria-label="Close image">&times;</button>
			<div class="project-lightbox-content">
				<button type="button" class="project-lightbox-nav prev" aria-label="Previous image">&#8592;</button>
				<img class="project-lightbox-image" alt="">
				<button type="button" class="project-lightbox-nav next" aria-label="Next image">&#8594;</button>
			</div>
		`;
		projectLightbox.addEventListener('click', (event) => {
			if (event.target === projectLightbox) {
				projectLightbox.classList.remove('open');
			}
		});
		const closeButton = projectLightbox.querySelector('.project-lightbox-close');
		if (closeButton) {
			closeButton.addEventListener('click', (event) => {
				event.stopPropagation();
				projectLightbox.classList.remove('open');
			});
		}
		const prevButton = projectLightbox.querySelector('.project-lightbox-nav.prev');
		const nextButton = projectLightbox.querySelector('.project-lightbox-nav.next');
		if (prevButton) {
			prevButton.addEventListener('click', (event) => {
				event.stopPropagation();
				if (!projectLightboxImages.length) return;
				projectLightboxIndex = (projectLightboxIndex - 1 + projectLightboxImages.length) % projectLightboxImages.length;
				updateProjectLightboxImage();
			});
		}
		if (nextButton) {
			nextButton.addEventListener('click', (event) => {
				event.stopPropagation();
				if (!projectLightboxImages.length) return;
				projectLightboxIndex = (projectLightboxIndex + 1) % projectLightboxImages.length;
				updateProjectLightboxImage();
			});
		}
		projectsContentContainer.appendChild(projectLightbox);
	};

	const updateProjectLightboxImage = () => {
		if (!projectLightbox || !projectLightboxImages.length) return;
		const imageEl = projectLightbox.querySelector('.project-lightbox-image');
		if (!imageEl) return;
		const activeImage = projectLightboxImages[projectLightboxIndex];
		imageEl.src = activeImage.src;
		imageEl.alt = activeImage.name || '';
	};

	const openProjectLightbox = (images, startIndex = 0) => {
		ensureProjectLightbox();
		if (!projectLightbox || !images.length) return;
		projectLightboxImages = images;
		projectLightboxIndex = Math.max(0, Math.min(startIndex, images.length - 1));
		updateProjectLightboxImage();
		projectLightbox.classList.add('open');
	};
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
			'menu.aboutsub': 'What are we planning?',
			'menu.countries': 'Countries',
			'menu.sponsors': 'Supporter Wall',
			'menu.sponsorssub': 'Who is taking part in the fundraising campaign?',
			'menu.friendbook': 'Friendbook',
			'menu.friendbooksub': 'Encounters with football fans from all over the world',
			'menu.projects': 'Projects',
			'menu.projectssub': 'Where do the donations go?',
			'projects.intro': 'The football clubs in Zirndorf are facing major financial challenges: outdated sports facilities and infrastructure, sharply rising energy and operating costs, and declining public subsidies.<br><br>With our fundraising campaign, we want to support the clubs in implementing urgently needed projects. This page transparently shows which measures are planned at each club.<br><br><span class="projects-inline-videos" aria-label="Projects videos"><span class="projects-video-card"><video class="projects-video" controls preload="none" playsinline poster="images/Interviews_v3_poster.jpg"><source src="images/Interviews_v3_web.mp4" type="video/mp4">Your browser does not support the video tag.</video></span><span class="projects-video-card"><video class="projects-video" controls preload="none" playsinline poster="images/Interviews_Teil_2_v2_poster.jpg"><source src="images/Interviews_Teil_2_v2_web.mp4" type="video/mp4">Your browser does not support the video tag.</video></span></span><br><strong>100% of all donations</strong> go directly to the football clubs in Zirndorf and are distributed equally among all clubs and their projects.',
			'donate.p1':'For donations of \u20ac15 or more, you will receive our francoNJa T-shirt.* 100% of donations go directly to the clubs in equal shares.',
			'donate.p2': '',
			'donate.note': '*Pickup in 90513 Zirndorf or shipping is possible if shipping costs are covered. Please contact us via email, Instagram, or Facebook. While supplies last.',
			'donate.cta': 'Donate now and secure your T-Shirt',
			'donate.title': 'Donate to clubs',
			'donate.private': 'Private individuals',
			'donate.business': 'Companies',
			'subtitle.journey': 'Everything about our journey to the 2026 FIFA World Cup and the <strong>fundraising campaign for the football clubs of Zirndorf</strong>',
			'about.title': 'About us',
			'about.p1': 'We are Andy & Andy, two football fans from Zirndorf (near Nuremberg), preparing for a special journey to the 2026 World Cup. Since the announcement in 2018 that the tournament would take place in the USA, Mexico, and Canada, we have dreamed of following the World Cup live from start to finish.',
			'about.p2': 'Our mission: <strong>meet football fans from all 211 FIFA countries</strong>, <strong>visit as many World Cup stadiums as possible</strong>, and passionately <strong>support the German national team</strong> all the way to the final. This journey is about more than football - it is about community, cultural exchange, and unforgettable stories we will share.',
			'about.p3': 'We started with the UEFA Nations League Final Four in Germany in June 2025, followed by the UEFA Under-21 Championship in Slovakia. Every step brings us closer to our big goal: experiencing the 2026 World Cup completely live.',
			'projects.title': 'Football Club Projects',
			'sponsors.title': 'Supporter Wall',
			'sponsors.hint': 'Thank you for your support and donations to the football clubs of Zirndorf.',
			'sponsors.main': 'Sponsors',
			'sponsors.ultra': 'Ultras',
			'sponsors.supporter': 'Supporter',
			'sponsors.fan': 'Fans',
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
			'menu.about': '\u00dcber uns',
			'menu.aboutsub': 'Was haben wir vor?',
			'menu.countries': 'L\u00e4nder',
			'menu.sponsors': 'Supporter Wall',
			'menu.sponsorssub': 'Wer beteiligt sich an der Spendenaktion?',
			'menu.friendbook': 'Friendbook',
			'menu.friendbooksub': 'Begegnungen mit Fu\u00dfball Fans aus aller Welt',
			'menu.projects': 'Projekte',
			'menu.projectssub': 'Wohin gehen die Spenden?',
			'projects.intro': 'Die Zirndorfer Fu\u00dfballvereine stehen vor gro\u00dfen finanziellen Herausforderungen: veraltete Sportanlagen und Infrastruktur, stark gestiegene Energie- und Nebenkosten sowie sinkende \u00f6ffentliche Zusch\u00fcsse.<br><br>Mit unserer Spendenaktion m\u00f6chten wir die Vereine dabei unterst\u00fctzen, dringend notwendige Projekte umzusetzen. Hier wird transparent dargestellt, welche Ma\u00dfnahmen bei den Vereinen geplant sind.<br><br><span class="projects-inline-videos" aria-label="Projects videos"><span class="projects-video-card"><video class="projects-video" controls preload="none" playsinline poster="images/Interviews_v3_poster.jpg"><source src="images/Interviews_v3_web.mp4" type="video/mp4">Your browser does not support the video tag.</video></span><span class="projects-video-card"><video class="projects-video" controls preload="none" playsinline poster="images/Interviews_Teil_2_v2_poster.jpg"><source src="images/Interviews_Teil_2_v2_web.mp4" type="video/mp4">Your browser does not support the video tag.</video></span></span><br><strong>100 % der Spenden</strong> gehen direkt an die Zirndorfer Fu\u00dfballvereine und werden gleichm\u00e4\u00dfig auf alle Vereine und ihre Projekte verteilt.',
			'donate.p1':'Ab einer Spende von 15\u20ac erhaltet ihr unser francoNJa T-Shirt dazu.* 100 % der Spenden gehen zu gleichen Teilen direkt an die Vereine.',
			'donate.p2': '',
			'donate.note': '*Abholung in 90513 Zirndorf oder Versand bei \u00dcbernahme der Versandkosten. Bitte kontaktiert uns per Mail, Instagram oder Facebook. Nur solange der Vorrat reicht.',
			'donate.cta': 'Jetzt spenden und T-Shirt sichern',
			'donate.title': 'Spende an Vereine',
			'donate.private': 'Privatpersonen',
			'donate.business': 'Unternehmen',
			'subtitle.journey': 'Alles zu unserer Reise zur WM 2026 und der <strong>Spendenaktion f\u00fcr die Zirndorfer Fu\u00dfballvereine</strong>',
			'about.title': '\u00dcber uns',
			'about.p1': 'Wir sind Andy & Andy, zwei Fu\u00dfballfans aus Zirndorf (bei N\u00fcrnberg), die sich auf eine besondere Reise zur WM 2026 vorbereiten. Seit der Ank\u00fcndigung im Jahr 2018, dass das Turnier in den USA, Mexiko und Kanada stattfindet, tr\u00e4umen wir davon, die Weltmeisterschaft von Anfang bis Ende vor Ort zu begleiten.',
			'about.p2': 'Unsere Mission: <strong>Fu\u00dfballfans aus allen 211 FIFA-L\u00e4ndern treffen</strong>, <strong>m\u00f6glichst viele WM-Stadien besuchen</strong> und die <strong>deutsche Nationalmannschaft</strong> leidenschaftlich bis ins Finale unterst\u00fctzen. Diese Reise ist mehr als nur Fu\u00dfball - es geht um Gemeinschaft, kulturellen Austausch und unvergessliche Geschichten, die wir teilen werden.',
			'about.p3': 'Gestartet sind wir mit dem UEFA Nations League Final Four im Juni 2025 in Deutschland, gefolgt von der U21-Europameisterschaft in der Slowakei. Jeder Schritt bringt uns unserem gro\u00dfen Ziel n\u00e4her: die WM 2026 komplett live zu erleben.',
			'projects.title': 'Projekte der Fu\u00dfballvereine',
			'sponsors.title': 'Supporter Wall',
			'sponsors.hint': 'Vielen Dank f\u00fcr eure Unterst\u00fctzung und Spenden an die Zirndorfer Fu\u00dfballvereine.',
			'sponsors.main': 'Sponsoren',
			'sponsors.ultra': 'Ultras',
			'sponsors.supporter': 'Supporter',
			'sponsors.fan': 'Fans',
			'sponsors.fanNamesLabel': 'Danke auch an:',
			newsfeedToggle: 'Neueste Begegnungen',
			detailLabelName: 'Name',
			detailLabelLocation: 'Ort',
			detailLabelClub: 'Verein',
			detailLabelPlayer: 'Spieler',
			detailLabelBestGame: 'Bestes Spiel',
			detailLabelChampions: 'WM26-Sieger',
			languageToggleLabel: 'Sprache wechseln',
			statsLabelCountries: 'L\u00e4nder',
		},
	};
	const detectLanguage = () => {
		const preset = (document.documentElement.getAttribute('data-user-lang') || document.documentElement.lang || '').toLowerCase();
		if (preset.startsWith('de')) return 'de';
		if (preset.startsWith('en')) return 'en';
		const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
		return lang.startsWith('de') ? 'de' : 'en';
	};
	let currentLanguage = detectLanguage();
	let currentProjectClubId = clubProjects[0]?.id || null;
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
		const combined = [...groups, ...uniqueSingles];
		const uniqueByTitle = new Map();
		combined.forEach((el) => {
			const title = (el.getAttribute('title') || '').trim();
			if (!title) return;
			// Keep first occurrence (groups are added first), avoid double counting (e.g. France + gf path).
			if (!uniqueByTitle.has(title)) uniqueByTitle.set(title, el);
		});
		return Array.from(uniqueByTitle.values());
	};
	const t = (key) => translations[currentLanguage]?.[key] || translations.en[key] || key;
	const encounterValueTranslations = {
		de: {
			wcc: {
				Argentina: 'Argentinien',
				Australia: 'Australien',
				Brazil: 'Brasilien',
				Colombia: 'Kolumbien',
				England: 'England',
				France: 'Frankreich',
				Germany: 'Deutschland',
				Hungary: 'Ungarn',
				Portugal: 'Portugal',
				Romania: 'Rumänien',
				Spain: 'Spanien',
			},
			location: {
				Munich: 'München',
				Zilina: 'Žilina',
			},
		},
	};
	const translateEncounterFallbackValue = (field, value) => {
		if (typeof value !== 'string' || !value) return '';
		if (currentLanguage !== 'de') return value;
		const fieldTranslations = encounterValueTranslations.de[field];
		if (!fieldTranslations) return value;
		return value.replace(/Argentina|Australia|Brazil|Colombia|England|France|Germany|Hungary|Portugal|Romania|Spain|Munich|Zilina/g, (match) => fieldTranslations[match] || match);
	};
	const getLocalizedEncounterField = (encounter, field) => {
		if (!encounter) return '';
		const localizedKey = `${field}-${currentLanguage}`;
		if (currentLanguage !== 'en' && Object.prototype.hasOwnProperty.call(encounter, localizedKey)) {
			const localizedValue = encounter[localizedKey];
			if (typeof localizedValue === 'string' && localizedValue) return localizedValue;
		}
		const defaultValue = encounter[field];
		return typeof defaultValue === 'string' ? translateEncounterFallbackValue(field, defaultValue) : '';
	};
	const getEncounterDisplayData = (encounter, countryElement = null) => ({
		name: getLocalizedEncounterField(encounter, 'name'),
		location: getLocalizedEncounterField(encounter, 'location'),
		date: encounter?.date || '',
		favClub: getLocalizedEncounterField(encounter, 'favClub'),
		favPlayer: getLocalizedEncounterField(encounter, 'favPlayer'),
		favGame: getLocalizedEncounterField(encounter, 'favGame'),
		wcc: getLocalizedEncounterField(encounter, 'wcc'),
		text: getLocalizedEncounterField(encounter, 'text'),
		country: getLocalizedCountryName(encounter?.country || '', countryElement),
	});
	const buildBusinessMailtoHref = () => {
		const mailContentByLanguage = {
			de: {
				subject: 'Bitte nehmt Kontakt mit mir auf',
				body: [
					'Liebes franconja-Team,',
					'ich m\u00f6chte mit meinem Unternehmen gerne an eurer Aktion teilnehmen.',
					'Bitte nehmt Kontakt mit mir auf! (Unzutreffendes bitte streichen):',
					'Mail:',
					'Telefon:',
					'instagram:',
					'',
					'Mit dem Senden dieser E-Mail stimme ich der Verarbeitung der oben angegebenen Daten zum Zweck der Kontaktaufnahme zu.',
					'',
					'Freundliche Gr\u00fc\u00dfe',
				].join('\n'),
			},
			en: {
				subject: 'Please contact me',
				body: [
					'Dear franconja,',
					'my company wants to support your project.',
					'Please contact me (cross unnecessary)',
					'Mail:',
					'Telefon:',
					'instagram:',
					'',
					'By sending this email, I consent to the processing of the data provided above for the purpose of being contacted.',
					'',
					'Kind regards',
				].join('\n'),
			},
		};
		const mail = mailContentByLanguage[currentLanguage] || mailContentByLanguage.en;
		return `mailto:franconja26@gmail.com?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;
	};
	const updateBusinessMailtoLink = () => {
		if (!donateBusinessLink) return;
		donateBusinessLink.setAttribute('href', buildBusinessMailtoHref());
	};
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
				openModal('map-modal');
				setTimeout(() => {
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
		updateBusinessMailtoLink();
		updateStats();
		renderVisitedCountriesList();
		renderProjects();
		populateNewsfeed();
		if (activeEncounterDetail?.countryElement && typeof activeEncounterDetail.countryElement.clickHandler === 'function') {
			activeEncounterDetail.countryElement.clickHandler(activeEncounterDetail.encounterId);
		}
		document.documentElement.classList.remove('i18n-pending');
		document.documentElement.classList.add('i18n-ready');
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

	// Schließen-Button für das Detail-Element (einmal anlegen)
	const detailCloseBtn = document.createElement('button');
	detailCloseBtn.className = 'close-btn';
	detailCloseBtn.innerHTML = '&times;';
	detailCloseBtn.addEventListener('click', (event) => {
		// Nur das Encounter-Detail schließen, Friendbook offen lassen.
		event.stopPropagation();
		activeEncounterDetail = null;
		detailElement.style.display = 'none';
	});

	const fetchFanNames = async () => {
		try {
			const response = await fetch('fans.txt');
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
		fanNamesContainer.innerHTML = '';
		const fanNames = await fetchFanNames();
		if (!fanNames.length) return;
		const fragment = document.createDocumentFragment();
		fanNames.forEach((name) => {
			const nameEl = document.createElement('div');
			nameEl.className = 'fan-name';
			nameEl.textContent = name;
			fragment.appendChild(nameEl);
		});
		fanNamesContainer.appendChild(fragment);
	};

	const renderSponsors = () => {
		if (!sponsorsContainer) return;
		Object.entries(sponsorsData).forEach(([tier, list]) => {
			const grid = sponsorsContainer.querySelector(`.sponsor-grid[data-tier="${tier}"]`);
			if (!grid) return;
			grid.innerHTML = '';
			list.forEach((sponsor) => {
				const card = document.createElement(sponsor.link ? 'a' : 'div');
				card.className = `sponsor-card ${tier}${sponsor.link ? ' is-link' : ''}`;
				if (sponsor.link) {
					card.href = sponsor.link;
					card.target = '_blank';
					card.rel = 'noopener noreferrer';
					card.setAttribute('aria-label', `${sponsor.name} Website`);
				}
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

	function renderProjects() {
		if (!projectsTabsContainer || !projectsContentContainer || !projectsGalleryContainer) return;
		const listEl = projectsContentContainer.querySelector('.projects-club-list');
		if (!listEl || !clubProjects.length) return;

		const renderProjectGallery = async () => {
			const currentRequestId = ++projectGalleryRequestId;
			projectsGalleryContainer.innerHTML = '';
			const images = await loadProjectImages();
			if (currentRequestId !== projectGalleryRequestId) return;
			if (!images.length) return;
			images.forEach((image, index) => {
				const thumbButton = document.createElement('button');
				thumbButton.type = 'button';
				thumbButton.className = 'project-thumb';
				thumbButton.setAttribute('aria-label', image.name);
				thumbButton.innerHTML = `<img src="${image.src}" alt="${image.name}">`;
				thumbButton.addEventListener('click', () => openProjectLightbox(images, index));
				projectsGalleryContainer.appendChild(thumbButton);
			});
		};

		const setActiveClub = async (clubId) => {
			const activeClub = clubProjects.find((club) => club.id === clubId) || clubProjects[0];
			currentProjectClubId = activeClub.id;
			Array.from(projectsTabsContainer.querySelectorAll('.project-club-tab')).forEach((btn) => {
				btn.classList.toggle('active', btn.dataset.clubId === activeClub.id);
			});
			listEl.innerHTML = '';
			activeClub.projects.forEach((project) => {
				const li = document.createElement('li');
				li.textContent = currentLanguage === 'de' ? project.de : project.en;
				listEl.appendChild(li);
			});
		};

		projectsTabsContainer.innerHTML = '';
		clubProjects.forEach((club) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'project-club-tab';
			button.dataset.clubId = club.id;
			button.setAttribute('aria-label', club.name);
			button.innerHTML = `
				<img src="${club.logo}" alt="${club.name} Logo">
				<span class="club-label">${club.name}</span>
			`;
			button.addEventListener('click', async () => {
				await setActiveClub(club.id);
			});
			projectsTabsContainer.appendChild(button);
		});

		void renderProjectGallery();
		void setActiveClub(currentProjectClubId || clubProjects[0].id);
	}

	const renderBottomLogos = () => {
		if (!bottomLogosContainer) return;
		bottomLogosContainer.innerHTML = '';
		sponsorsData.main.forEach((sponsor) => {
			const wrapper = document.createElement(sponsor.link ? 'a' : 'div');
			if (sponsor.link) {
				wrapper.href = sponsor.link;
				wrapper.target = '_blank';
				wrapper.rel = 'noopener noreferrer';
			}
			const img = document.createElement('img');
			img.src = sponsor.logo;
			img.alt = sponsor.name;
			wrapper.appendChild(img);
			bottomLogosContainer.appendChild(wrapper);
		});
	};

	renderSponsors();
	renderBottomLogos();
	renderProjects();
	renderFanNames();
	loadSponsorsData()
		.then(() => {
			renderSponsors();
			renderBottomLogos();
		})
		.catch((error) => {
			console.warn('Sponsor logos could not be loaded dynamically:', error);
		});

	const closeAllModals = () => {
		modals.forEach(m => m.classList.remove('open'));
		if (overlay) overlay.classList.remove('open');
		document.body.classList.remove('modal-open');
		if (startScreen) startScreen.classList.remove('hidden');
		if (newsfeed) newsfeed.classList.remove('expanded');
		activeEncounterDetail = null;
		detailElement.style.display = 'none';
	};

	const openModal = (targetId) => {
		const targetModal = document.getElementById(targetId);
		if (!targetModal) return;
		tooltip.style.opacity = '0';
		modals.forEach(sm => sm.classList.remove('open'));
		targetModal.classList.add('open');
		if (overlay) overlay.classList.add('open');
		document.body.classList.add('modal-open');
		if (startScreen) startScreen.classList.add('hidden');
		if (targetId === 'sponsors-container') {
			renderFanNames();
		}
		if (targetId === 'map-modal' && newsfeed) {
			newsfeed.classList.add('expanded');
			if (newsfeedToggle) {
				newsfeedToggle.style.bottom = "33%";
			}
			// Apply mobile start view after modal layout is visible.
			if (window.matchMedia('(max-width: 768px)').matches && mapPanzoom) {
				setTimeout(() => {
					mapPanzoom.zoom(1.3, { animate: false, force: true });
					mapPanzoom.pan(-1.16068, -66.5507, { animate: false, force: true });
				}, 60);
			}
		}
	};

	modals.forEach(modal => {
		const closeBtn = document.createElement('button');
		closeBtn.className = 'close-btn';
		closeBtn.innerHTML = '&times;';
		closeBtn.addEventListener('click', () => {
			tooltip.style.opacity = '0';
			closeAllModals();
		});
		modal.insertBefore(closeBtn, modal.firstChild);
	});

	modalTriggers.forEach(trigger => {
		trigger.addEventListener('click', () => {
			const target = trigger.getAttribute('data-target');
			if (target) {
				openModal(target);
			}
		});
	});

	if (donateButton) {
		donateButton.addEventListener('click', () => openModal('donate-modal'));
	}

	if (overlay) {
		overlay.addEventListener('click', () => {
			tooltip.style.opacity = '0';
			closeAllModals();
		});
	}

// Funktion: Liste der verfügbaren Länder aus der lokalen JSON laden
	const getEncounteredCountries = async () => {
		try {
			const response = await fetch('encounters/encounters.json', { cache: 'no-store' });
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
		const matchingElements = countries.filter((country) => country.getAttribute('title') === countryName);
		matchingElements.forEach((countryElement) => countryElement.classList.add('visited'));
	});

	updateStats();
	renderVisitedCountriesList();

	if (newsfeed) {
		newsfeedToggle = document.createElement('div');
		newsfeedToggle.classList.add('newsfeed-toggle');
		newsfeedToggle.textContent = t('newsfeedToggle');
		if (mapModal) {
			mapModal.appendChild(newsfeedToggle);
		}
		newsfeed.classList.add('expanded');
		newsfeedToggle.style.bottom = "33%";
		applyTranslations();

		// Newsfeed ein- und ausfahren
		newsfeedToggle.addEventListener('click', () => {
			tooltip.style.opacity = '0';
			if (newsfeed.classList.contains('expanded')) {
			newsfeed.classList.remove('expanded');
			newsfeedToggle.style.bottom = "10px";
		} else {
			newsfeed.classList.add('expanded');
			newsfeedToggle.style.bottom = "33%";
		}
			
		});
	}

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
				const response = await fetch(url, { cache: 'no-store' });
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

	//Funktion: Newsfeed mit Encounters anzeigen
	function populateNewsfeed() {
		newsfeedList.innerHTML = ''; // Liste leeren

		allEncounters.forEach(encounter => {
			const countryElement = Array.from(getVisitedCountries()).find(c => c.getAttribute('title') === encounter.country) || null;
			const encounterData = getEncounterDisplayData(encounter, countryElement);
			const listItem = document.createElement('li');
			listItem.classList.add('newsfeed-item');

			// Thumbnail + Kurzinfo
			listItem.innerHTML = `
		            <img src="encounters/${encounter.country}/${encounter.image}" alt="${encounterData.name}" class="newsfeed-thumbnail" />
		            <div class="newsfeed-info">
		                <p><strong>${encounterData.date} ${encounterData.name} </strong></p>
						<p>${encounterData.location}, ${encounterData.country}</p>
		            </div>
		        `;

			// Beim Klicken auf das Newsfeed-Item -> Land auf der Karte öffnen
			listItem.addEventListener('click', () => {
				tooltip.style.opacity = '0';
				openModal('map-modal');
				const countryElement = Array.from(getVisitedCountries()).find(c => c.getAttribute('title') === encounter.country);
				if (countryElement && typeof countryElement.clickHandler === 'function') {
					setTimeout(() => {
						countryElement.clickHandler(encounter.id);
					}, 0);
				}
			});

			newsfeedList.appendChild(listItem);
		});
	}

	// Encounters abrufen und Newsfeed befüllen
	await fetchEncounters();

	// Statistik aktualisieren
	updateStats();

	// Gastgeberländer, die ihre Farbe nicht ändern
	const hostCountries = ["Canada", "Mexico", "United States", "Germany"];


	// Track which country roots we've already processed so we only create one gradient per country
	const processedCountryRoots = new Set();

	countries.forEach(country => {
		// Determine country root. If a subpath has its own country title different from the parent
		// group title (e.g. Kosovo inside Serbia group), treat the subpath as its own root.
		const parentGroup = country.tagName.toLowerCase() === 'g' ? null : (country.closest && country.closest('g.country'));
		const countryTitle = (country.getAttribute && country.getAttribute('title') || '').trim();
		const parentTitle = (parentGroup && parentGroup.getAttribute && parentGroup.getAttribute('title') || '').trim();
		const hasOwnCountryIdentity = Boolean(countryTitle) && countryTitle !== parentTitle;
		const root = country.tagName.toLowerCase() === 'g'
			? country
			: ((parentGroup && !hasOwnCountryIdentity) ? parentGroup : country);
		const rootName = root.getAttribute('title') || '';
		const name = country.getAttribute('title') || rootName;
		const isFirstCountryForRoot = !processedCountryRoots.has(root);
		if (isFirstCountryForRoot) {
			processedCountryRoots.add(root);
		}

		if (isFirstCountryForRoot && !hostCountries.includes(rootName) && root.classList && root.classList.contains('visited')) {
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
			// subpaths) already uses a hand-authored fill referencing a url(#...) - in that case
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
				// Do not create/apply a generated gradient for this root - respect hand-authored styling.
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
				// Für Länder mit Subregionen - apply only to subpaths that don't already have an
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
		const setRootHovered = (active) => {
			if (root && root.classList) {
				root.classList.toggle('is-hovered', Boolean(active));
			}
		};

		const showTooltip = (e, touchInteraction = false) => {
			const displayName = getLocalizedCountryName(name, country);
			tooltip.textContent = displayName;
			tooltip.style.opacity = '1';
			setRootHovered(true);

			if (touchInteraction) {
				tooltip.classList.add('touch');
				// Die Position bleibt durch die CSS-Klasse festgelegt.
			} else {
				tooltip.classList.remove('touch');
				const rect = mapModal ? mapModal.getBoundingClientRect() : null;
				const offset = 12;
				// Position relativ zum Friendbook-Modal, damit der Tooltip nicht versetzt ist.
				const left = rect ? (e.clientX - rect.left + offset) : (e.pageX + offset);
				const top = rect ? (e.clientY - rect.top + offset) : (e.pageY + offset);
				tooltip.style.left = `${left}px`;
				tooltip.style.top = `${top}px`;
			}
		};

		const hideTooltip = (e) => {
			// If pointer moves within the same country root, keep tooltip/hover state.
			if (e && e.relatedTarget && root && root.contains && root.contains(e.relatedTarget)) {
				return;
			}
			tooltip.style.opacity = '0';
			setRootHovered(false);
		};

		// Tooltip fuer alle Geraete: auf Hybrid-Devices darf Hover nicht deaktiviert werden.
		if (isTouchDevice) {
			country.addEventListener('touchstart', (e) => {
				e.preventDefault();
				showTooltip(e.touches[0], true);
				detailElement.style.display = 'none';
			});

			country.addEventListener('touchend', (e) => {
				e.preventDefault();
				hideTooltip();
			});
		}

		country.addEventListener('mouseenter', (e) => showTooltip(e, false));
		country.addEventListener('mousemove', (e) => showTooltip(e, false));
		country.addEventListener('mouseleave', hideTooltip);

		// Klick-Logik nur für visited-Länder und ihre Subregionen
		if (country.classList.contains('visited') || country.closest('.visited')) {
			const clickHandler = async (id = null) => {
				// Resolve main country consistently with root logic (supports independent subpaths like Kosovo)
				const clickParentGroup = country.tagName.toLowerCase() === 'g' ? null : country.closest('g.country');
				const clickCountryTitle = (country.getAttribute('title') || '').trim();
				const clickParentTitle = (clickParentGroup && clickParentGroup.getAttribute('title') || '').trim();
				const clickHasOwnCountryIdentity = Boolean(clickCountryTitle) && clickCountryTitle !== clickParentTitle;
				const mainElement = country.tagName.toLowerCase() === 'g'
					? country
					: ((clickParentGroup && !clickHasOwnCountryIdentity) ? clickParentGroup : country);
				const mainCountry = mainElement ? mainElement.getAttribute('title') : name;
				const encounters = encountersByCountry[mainCountry] || [];
				activeEncounterDetail = { countryElement: country, encounterId: id };
				detailElement.innerHTML = '';
				detailElement.appendChild(detailCloseBtn);
				const title = document.createElement('p');
				title.className = 'encounter-title';
				title.textContent = getLocalizedCountryName(mainCountry, mainElement || country);
				detailElement.appendChild(title);

				if (encounters.length > 1) {
					const encounterList = document.createElement('div');
					encounterList.classList.add('encounter-list');

					encounters.forEach((encounter) => {
						const encounterData = getEncounterDisplayData(encounter, mainElement || country);
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
                                <img src="encounters/${mainCountry}/${encounter.image}" alt="${encounterData.name}" class="detail-image" />
                                <p><strong>${t('detailLabelClub')}:</strong> ${encounterData.favClub}</p>
                                <p><strong>${t('detailLabelPlayer')}:</strong> ${encounterData.favPlayer}</p>
                                <p><strong>${t('detailLabelBestGame')}:</strong> ${encounterData.favGame}</p>
                                <p><strong>${t('detailLabelChampions')}:</strong> ${encounterData.wcc}</p>
                                <p class="story">${encounterData.text}</p>
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
						thumbnail.src = `encounters/${mainCountry}/${encounter.image}`;
						thumbnail.alt = encounterData.name;
						thumbnail.classList.add('thumbnail');

						const info = document.createElement('div');
						info.classList.add('encounter-info');
						info.innerHTML = `<strong>${encounterData.name}</strong> <p>${encounterData.location}</p><p>${encounterData.date}</p>`;

						encounterItem.appendChild(toggleButton);
						encounterItem.appendChild(thumbnail);
						encounterItem.appendChild(info);

						encounterList.appendChild(encounterItem);
						encounterList.appendChild(encounterDetail);
					});

					detailElement.appendChild(encounterList);
				} else if (encounters.length === 1) {
					const encounter = encounters[0];
					const encounterData = getEncounterDisplayData(encounter, mainElement || country);

					const img = document.createElement('img');
					const pName = document.createElement('p');
					const pLocation = document.createElement('p');
					const wcc = document.createElement('p');
					const favClub = document.createElement('p');
					const favPlayer = document.createElement('p');
					const favGame = document.createElement('p');
					const pText = document.createElement('p');


					img.src = `encounters/${mainCountry}/${encounter.image}`;
					img.alt = encounterData.name;
					img.className = 'detail-image';
					pName.innerHTML = `<strong>${t('detailLabelName')}:</strong> ${encounterData.name}`;
					pLocation.innerHTML = `<strong>${t('detailLabelLocation')}:</strong> ${encounterData.location}`;
					favClub.innerHTML = `<strong>${t('detailLabelClub')}:</strong> ${encounterData.favClub}`;
					favPlayer.innerHTML = `<strong>${t('detailLabelPlayer')}:</strong> ${encounterData.favPlayer}`;
					favGame.innerHTML = `<strong>${t('detailLabelBestGame')}:</strong> ${encounterData.favGame}`;
					wcc.innerHTML = `<strong>${t('detailLabelChampions')}:</strong> ${encounterData.wcc}`;
					pText.classList.add('story');
					pText.textContent = encounterData.text;

					const pDate = document.createElement('p');
					pDate.classList.add('date')
					pDate.innerHTML = `${encounterData.date}`;

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
					// Skip forwarding for subpaths that are independent countries with own title.
					const pathTitle = (path.getAttribute('title') || '').trim();
					const groupTitle = (country.getAttribute('title') || '').trim();
					if (path.classList.contains('country') && pathTitle && pathTitle !== groupTitle) {
						return;
					}
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

	// Panzoom initialisieren
	const mapContainer = document.querySelector('.map-container svg');
	if (mapContainer) {
		mapPanzoom = new Panzoom(mapContainer, {
			maxScale: 9,
			minScale: 1,
			contain: 'outside',
			step: 1.0,
		});

		// Mobile initial view preset for world map.
		if (window.matchMedia('(max-width: 768px)').matches && mapPanzoom) {
			mapPanzoom.zoom(1.3, { animate: false, force: true });
			mapPanzoom.pan(-1.16068, -66.5507, { animate: false, force: true });
		}

		mapContainer.parentElement.addEventListener('wheel', (event) => {
			event.preventDefault();
			mapPanzoom.zoomWithWheel(event);
		});

		mapContainer.addEventListener('dblclick', () => {
			mapPanzoom.zoomIn({ animate: true });
		});
	} else {
		console.error('SVG-Element nicht gefunden. Bitte \u00fcberpr\u00fcfe deinen Selektor oder die HTML-Struktur.');
	}

	// Detail-Element schliessen, wenn ausserhalb geklickt wird
	document.addEventListener('click', (e) => {
		tooltip.style.opacity = '0';
		// Detail-Element schliessen
		if (!e.target.closest('.detail-element') && !e.target.classList.contains('visited')) {
			detailElement.style.display = 'none';
		}
		// Modal schliessen
		const openModalEl = [...modals].find(m => m.classList.contains('open'));
		if (
			openModalEl &&
			!e.target.closest('.modal') &&
			!e.target.closest('.modal-card') &&
			!e.target.closest('.detail-element') &&
			!e.target.closest('.donate-button')
		) {
			closeAllModals();
		}
	});
});


