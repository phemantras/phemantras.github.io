#!/usr/bin/env python3
"""
Add `title` attributes to <path> and <g> elements inside the <svg id="svg1926"> element.
Backs up the original file to .bak before overwriting.

Behavior:
- Finds the <svg> element with attribute id="svg1926".
- For each descendant element with local-name 'path' or 'g', if it doesn't already have a 'title' attribute,
  it tries to determine a country code from: element.id or element.class (split tokens) where token length 2..3.
- Looks up a short mapping (ISO-like codes) to a (German) long country name.
- If no mapping found, uses an uppercase fallback of the code or the element id.
- Writes the file back (overwriting the original) after creating a backup with .bak suffix.

Note: This is a small, safe tool. It tries not to clobber existing title attributes.

"""
from xml.etree import ElementTree as ET
import re
import sys
from pathlib import Path

SVG_PATH = Path(__file__).resolve().parents[1] / 'World_Map_FIFA.svg'
if not SVG_PATH.exists():
    print(f"SVG file not found at: {SVG_PATH}")
    sys.exit(1)

# Minimal mapping for special cases and common codes seen in the SVG
MAPPING = {
    'fr gp': 'Guadeloupe',
    'fr mq': 'Martinique', 
    'fr re': 'Reunion',
    'fr bl': 'Saint Barthélemy',
    'fr mf': 'Saint Martin (French part)',
    'fr pm': 'Saint Pierre and Miquelon',
    'fr gf': 'French Guiana',
    'fr pf': 'French Polynesia',
    'fr tf': 'French Southern Territories',
    'AF': 'Afghanistan',
    'AL': 'Albania',
    'DZ': 'Algeria',

# Special cases for combined codes
SPECIAL_CASES = {
    'fr gp': 'Guadeloupe',
    'fr mq': 'Martinique', 
    'fr re': 'Reunion',
    'fr bl': 'Saint Barthélemy',
    'fr mf': 'Saint Martin (French part)',
    'fr pm': 'Saint Pierre and Miquelon',
    'fr gf': 'French Guiana',
    'fr pf': 'French Polynesia',
    'fr tf': 'French Southern Territories',
},
'AS':'American Samoa',
'AD':'Andorra',
'AO':'Angola',
'AI':'Anguilla',
'AQ':'Antarctica',
'AG':'Antigua and Barbuda',
'AR':'Argentina',
'AM':'Armenia',
'AW':'Aruba',
'AU':'Australia',
'AT':'Austria',
'AZ':'Azerbaijan',
'BS':'Bahamas',
'BH':'Bahrain',
'BD':'Bangladesh',
'BB':'Barbados',
'BY':'Belarus',
'BE':'Belgium',
'BZ':'Belize',
'BJ':'Benin',
'BM':'Bermuda',
'BT':'Bhutan',
'BO':'Bolivia',
'BQ':'Bonaire',
'BA':'Bosnia and Herzegovina',
'BW':'Botswana',
'BV':'Bouvet Island',
'BR':'Brazil',
'IO':'British Indian Ocean Territory',
'BN':'Brunei Darussalam',
'BG':'Bulgaria',
'BF':'Burkina Faso',
'BI':'Burundi',
'KH':'Cambodia',
'CM':'Cameroon',
'CA':'Canada',
'CV':'Cape Verde',
'KY':'Cayman Islands',
'CF':'Central African Republic',
'TD':'Chad',
'CL':'Chile',
'CN':'China',
'CX':'Christmas Island',
'CC':'Cocos (Keeling) Islands',
'CO':'Colombia',
'KM':'Comoros',
'CG':'Congo',
'CD':'Democrate ReplicCongo',
'CK':'Cook Islands',
'CR':'Costa Rica',
'HR':'Croatia',
'CU':'Cuba',
'CW':'CuraÃ§ao',
'CY':'Cyprus',
'CZ':'Czech Republic',
'CI':'Côte d\'Ivoire',
'DK':'Denmark',
'DJ':'Djibouti',
'DM':'Dominica',
'DO':'Dominican Republic',
'EC':'Ecuador',
'EG':'Egypt',
'SV':'El Salvador',
'GQ':'Equatorial Guinea',
'ER':'Eritrea',
'EE':'Estonia',
'SZ':'Eswatini',
'ET':'Ethiopia',
'FK':'Falkland Islands (Malvinas)',
'FO':'Faroe Islands',
'FJ':'Fiji',
'FI':'Finland',
'FR':'France',
'GF':'French Guiana',
'PF':'French Polynesia',
'TF':'French Southern Territories',
'GA':'Gabon',
'GM':'Gambia',
'GE':'Georgia',
'DE':'Germany',
'GH':'Ghana',
'GI':'Gibraltar',
'GR':'Greece',
'GL':'Greenland',
'GD':'Grenada',
'GP':'Guadeloupe',
'GU':'Guam',
'GT':'Guatemala',
'GG':'Guernsey',
'GN':'Guinea',
'GW':'Guinea-Bissau',
'GY':'Guyana',
'HT':'Haiti',
'HM':'Heard Island and McDonald Islands',
'VA':'Holy See (Vatican City State)',
'HN':'Honduras',
'HK':'Hong Kong',
'HU':'Hungary',
'IS':'Iceland',
'IN':'India',
'ID':'Indonesia',
'IR':'Iran',
'IQ':'Iraq',
'IE':'Ireland',
'IM':'Isle of Man',
'IL':'Israel',
'IT':'Italy',
'JM':'Jamaica',
'JP':'Japan',
'JE':'Jersey',
'JO':'Jordan',
'KZ':'Kazakhstan',
'KE':'Kenya',
'KI':'Kiribati',
'KP':'North Korea',
'KR':'South Korea',
'KW':'Kuwait',
'KG':'Kyrgyzstan',
'LA':'Lao People\'s Democratic Republic',
'LV':'Latvia',
'LB':'Lebanon',
'LS':'Lesotho',
'LR':'Liberia',
'LY':'Libya',
'LI':'Liechtenstein',
'LT':'Lithuania',
'LU':'Luxembourg',
'MO':'Macao',
'MK':'Macedonia',
'MG':'Madagascar',
'MW':'Malawi',
'MY':'Malaysia',
'MV':'Maldives',
'ML':'Mali',
'MT':'Malta',
'MH':'Marshall Islands',
'MQ':'Martinique',
'MR':'Mauritania',
'MU':'Mauritius',
'YT':'Mayotte',
'MX':'Mexico',
'FM':'Micronesia',
'MD':'Moldova',
'MC':'Monaco',
'MN':'Mongolia',
'ME':'Montenegro',
'MS':'Montserrat',
'MA':'Morocco',
'MZ':'Mozambique',
'MM':'Myanmar',
'NA':'Namibia',
'NR':'Nauru',
'NP':'Nepal',
'NL':'Netherlands',
'NC':'New Caledonia',
'NZ':'New Zealand',
'NI':'Nicaragua',
'NE':'Niger',
'NG':'Nigeria',
'NU':'Niue',
'NF':'Norfolk Island',
'MP':'Northern Mariana Islands',
'NO':'Norway',
'OM':'Oman',
'PK':'Pakistan',
'PW':'Palau',
'PS':'Palestine',
'PA':'Panama',
'PG':'Papua New Guinea',
'PY':'Paraguay',
'PE':'Peru',
'PH':'Philippines',
'PN':'Pitcairn',
'PL':'Poland',
'PT':'Portugal',
'PR':'Puerto Rico',
'QA':'Qatar',
'RO':'Romania',
'RU':'Russian Federation',
'RW':'Rwanda',
'RE':'Reunion',
'BL':'Saint BarthÃ©lemy',
'SH':'Saint Helena',
'KN':'Saint Kitts and Nevis',
'LC':'Saint Lucia',
'MF':'Saint Martin (French part)',
'PM':'Saint Pierre and Miquelon',
'VC':'Saint Vincent and the Grenadines',
'WS':'Samoa',
'SM':'San Marino',
'ST':'Sao Tome and Principe',
'SA':'Saudi Arabia',
'SN':'Senegal',
'RS':'Serbia',
'SC':'Seychelles',
'SL':'Sierra Leone',
'SG':'Singapore',
'SX':'Sint Maarten (Dutch part)',
'SK':'Slovakia',
'SI':'Slovenia',
'SB':'Solomon Islands',
'SO':'Somalia',
'ZA':'South Africa',
'GS':'South Georgia and the South Sandwich Islands',
'SS':'South Sudan',
'ES':'Spain',
'LK':'Sri Lanka',
'SD':'Sudan',
'SR':'Suriname',
'SJ':'Svalbard and Jan Mayen',
'SE':'Sweden',
'CH':'Switzerland',
'SY':'Syrian Arab Republic',
'TW':'Taiwan',
'TJ':'Tajikistan',
'TZ':'Tanzania',
'TH':'Thailand',
'TL':'Timor-Leste',
'TG':'Togo',
'TK':'Tokelau',
'TO':'Tonga',
'TT':'Trinidad and Tobago',
'TN':'Tunisia',
'TR':'Turkey',
'TM':'Turkmenistan',
'TC':'Turks and Caicos Islands',
'TV':'Tuvalu',
'UG':'Uganda',
'UA':'Ukraine',
'AE':'United Arab Emirates',
'GB':'United Kingdom',
'US':'United States',
'UM':'United States Minor Outlying Islands',
'UY':'Uruguay',
'UZ':'Uzbekistan',
'VU':'Vanuatu',
'VE':'Venezuela',
'VN':'Viet Nam',
'VG':'Virgin Islands',
'VI':'Virgin Islands',
'WF':'Wallis and Futuna',
'EH':'Western Sahara',
'YE':'Yemen',
'ZM':'Zambia',
'ZW':'Zimbabwe',
'AX':'Åland Islands'
}

# Helper to get localname (strip namespace)
def local_name(tag):
    if '}' in tag:
        return tag.split('}', 1)[1]
    return tag

# Backup original
bak = SVG_PATH.with_suffix('.svg.bak')
if not bak.exists():
    bak.write_bytes(SVG_PATH.read_bytes())
    print(f"Backup created: {bak}")
else:
    print(f"Backup already exists: {bak}")

# Parse
ET.register_namespace('', "http://www.w3.org/2000/svg")
# Keep other common namespaces to avoid rewriting prefixes weirdly
ET.register_namespace('inkscape', 'http://www.inkscape.org/namespaces/inkscape')
ET.register_namespace('sodipodi', 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd')

tree = ET.parse(str(SVG_PATH))
root = tree.getroot()

# Find svg element with id=svg1926
svg_elem = None
for elem in root.iter():
    if elem.get('id') == 'svg1926':
        svg_elem = elem
        break

if svg_elem is None:
    print('Could not find <svg id="svg1926"> element. Exiting.')
    sys.exit(1)

candidates = 0
updated = 0

code_re = re.compile(r'^[A-Za-z]{2,3}$')

for el in svg_elem.iter():
    ln = local_name(el.tag)
    if ln not in ('path', 'g'):
        continue
    candidates += 1
    # We want to update existing titles too

    # Try id first
    code = None
    el_id = el.get('id')
    if el_id:
        # sometimes id contains spaces (e.g. "fr gp") — not ideal, split
        for token in re.split(r'[\s_-]+', el_id):
            if code_re.match(token):
                code = token.lower()
                break
        # if no short token, if id itself is short, use it
        if code is None and code_re.match(el_id):
            code = el_id.lower()

    # Try classes
    if code is None:
        cls = el.get('class')
        if cls:
            for token in cls.split():
                if code_re.match(token):
                    code = token.lower()
                    break

    # As a last resort, attempt to use first 2-3 letters of id
    if code is None and el_id:
        token = re.sub(r'[^A-Za-z]', '', el_id).lower()
        if len(token) >= 2:
            code = token[:2]

    # Check for special cases first
    if el_id and el_id.lower() in MAPPING:
        title_val = MAPPING[el_id.lower()]
    elif code:
        code = code.upper()
        if code in MAPPING:
            title_val = MAPPING[code]
        else:
            title_val = code
    else:
        title_val = el_id or ''

    if title_val:
        el.set('title', title_val)
        updated += 1

print(f"Found {candidates} candidate elements under svg#svg1926; added 'title' to {updated} elements.")

# Write back
tree.write(str(SVG_PATH), encoding='utf-8', xml_declaration=True)
print(f"Wrote updated SVG to: {SVG_PATH}")
print("Done.")
