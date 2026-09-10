import os
import re

exports = set()

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
                
                imports = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"](?:\.\.?/)+lib/firebaseService[\'"]', content, re.DOTALL)
                for imp in imports:
                    funcs = imp.split(',')
                    for func in funcs:
                        func = func.strip()
                        if func:
                            exports.add(func)

with open('src/lib/firebaseService.ts', 'w') as f:
    for exp in sorted(list(exports)):
        f.write(f"export const {exp} = (...args: any[]): any => {{}};\n")
