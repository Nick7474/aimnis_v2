import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    # Hex codes
    content = re.sub(r'(?i)#00d4ff', '#735FE9', content)
    content = re.sub(r'(?i)#0891b2', '#5a3ee1', content)
    
    # "cyan" word
    content = re.sub(r'(?i)\bcyan\b', 'brand', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

# Also run on global app files just in case
if os.path.exists('src/app/globals.css'):
    replace_in_file('src/app/globals.css')
