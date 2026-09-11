const fs = require('fs');
let c = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

c = c.replace(/<div className="flex flex-col md:items-end min-w-0 flex-1 md:flex-initial text-left md:text-right md:hidden">/, '<div className="flex flex-col md:items-end min-w-0 flex-1 md:flex-initial text-left md:text-right">');

c = c.replace(/<p className="text-\[10px\] md:text-\[11px\] font-bold text-\[\#164e63\] truncate">/, '<p className="text-[10px] md:hidden font-bold text-[#164e63] truncate">');
c = c.replace(/<p className="text-\[9px\] md:text-\[10px\] font-semibold text-slate-500 truncate leading-tight">/, '<p className="text-[9px] md:hidden font-semibold text-slate-500 truncate leading-tight">');
c = c.replace(/{!isKurikulumPage && !isTuPage && !isStudentPage && \(\s*<div className="flex items-center md:justify-end gap-1.5 mt-0.5">/s, '{!isKurikulumPage && !isTuPage && !isStudentPage && (\n                <div className="flex items-center md:hidden gap-1.5 mt-0.5">');

fs.writeFileSync('src/components/Navbar.tsx', c);
