const fs = require('fs');
let c = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

c = c.replace(/<div className="flex flex-col md:items-end min-w-0 flex-1 md:flex-initial text-left md:text-right">/, '<div className="flex flex-col md:items-end min-w-0 flex-1 md:flex-initial text-left md:text-right md:hidden">');

fs.writeFileSync('src/components/Navbar.tsx', c);
