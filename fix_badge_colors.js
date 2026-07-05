const fs = require('fs');
const file = 'src/components/portals/AcademicCalendarManager.tsx';
let code = fs.readFileSync(file, 'utf8');

// Revert badge texts to white
code = code.replace(/backgroundColor: matchingDbEvent\.isEmergency \? '#DC2626' : '#EF4444', color: '#334155'/g, "backgroundColor: matchingDbEvent.isEmergency ? '#DC2626' : '#EF4444', color: '#FFFFFF'");
code = code.replace(/backgroundColor: '#DC2626', color: '#334155'/g, "backgroundColor: '#DC2626', color: '#FFFFFF'");

// Wait, the "Add Event" button also had white text probably:
code = code.replace(/backgroundColor: '#3B82F6', color: '#334155'/g, "backgroundColor: '#3B82F6', color: '#FFFFFF'");
code = code.replace(/backgroundColor: '#2563EB', color: '#334155'/g, "backgroundColor: '#2563EB', color: '#FFFFFF'");

fs.writeFileSync(file, code);
