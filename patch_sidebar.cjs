const fs = require('fs');
let c = fs.readFileSync('src/components/SidebarNavigation.tsx', 'utf8');

const hookLogic = `
  const [schedules, setSchedules] = React.useState<TeachingScheduleItem[]>([]);
  const settingsScope = teacher?.id && !isMasterUser ? \`_\${teacher.id}\` : '';

  React.useEffect(() => {
    const savedKey = localStorage.getItem(teacher?.id ? \`simak_schedules_\${teacher.id}\` : 'simak_schedules');
    if (savedKey) {
      try {
        const parsed = JSON.parse(savedKey);
        if (Array.isArray(parsed)) setSchedules(parsed);
      } catch (e) {}
    } else if (isMasterUser) {
      const savedGen = localStorage.getItem('simak_schedules');
      if (savedGen) {
        try {
          const parsed = JSON.parse(savedGen);
          if (Array.isArray(parsed) && parsed.length > 0) setSchedules(parsed);
        } catch (e) {}
      }
    }
  }, [teacher?.id, isMasterUser]);

  React.useEffect(() => {
    const unsub = subscribeToSchedules((remoteSchedules) => {
      if (remoteSchedules && Array.isArray(remoteSchedules)) {
        setSchedules(remoteSchedules);
      }
    }, settingsScope);
    return () => unsub();
  }, [teacher?.id, isMasterUser, settingsScope]);

  const dayIndex = new Date().getDay();
  const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dayIndex];
  
  const activeClasses = Array.from(new Set(
    schedules.filter(sch => sch.day === dayName).map(sch => sch.className)
  ));
  
  const activeClassText = activeClasses.length > 0 ? activeClasses.join(', ') : 'Tidak ada jadwal hari ini';
`;

c = c.replace(/const isAdministrator = isAdmin \|\|/, hookLogic + '\n  const isAdministrator = isAdmin ||');

fs.writeFileSync('src/components/SidebarNavigation.tsx', c);
