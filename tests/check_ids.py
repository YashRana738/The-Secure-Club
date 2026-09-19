import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('src/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

html_ids = set(re.findall(r'id=["\']([^"\']+)["\']', html))
js_ids = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", js))

print('Total unique IDs in HTML:', len(html_ids))
print('Total unique IDs queried in app.js:', len(js_ids))
missing = [i for i in js_ids if i not in html_ids]
print('Missing in index.html (may be dynamically generated in modal/drawer or obsolete):', missing)
