const fs = require('fs');
let c = fs.readFileSync('src/components/SidebarNavigation.tsx', 'utf8');

const profileHtml = `          <div className="mb-4 pb-4 border-b border-slate-200">
            <div className="flex flex-col text-left">
              <p className="text-[12px] font-bold text-[#164e63] truncate">
                {currentUser?.name || teacher.name}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 truncate leading-tight mt-0.5">
                {currentUser?.role || teacher.subjectRole || 'Guru Pengampu'}
              </p>
              {!isKurikulumOnlyMode && !isTuOnlyMode && !isStudentRole && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={\`w-1.5 h-1.5 rounded-full \${activeClasses.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}\`}></div>
                  <p className={\`text-[9px] font-bold truncate \${activeClasses.length > 0 ? 'text-emerald-600' : 'text-slate-500'}\`}>
                    Status: Kelas Aktif ({activeClassText})
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-2 py-1`;

c = c.replace(/<div className="px-2 py-1/g, profileHtml);
fs.writeFileSync('src/components/SidebarNavigation.tsx', c);
