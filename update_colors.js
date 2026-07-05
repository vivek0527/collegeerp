const fs = require('fs');
const file = './src/components/portals/AcademicYearAdmissionControl.tsx';
let content = fs.readFileSync(file, 'utf8');

// Backgrounds
content = content.replace(/backgroundColor: '#0F172A'/g, "backgroundColor: '#FFFFFF'");
content = content.replace(/backgroundColor: '#1E293B'/g, "backgroundColor: '#F8FAFC'");

// Borders
content = content.replace(/border: '1px solid rgba\(255, 255, 255, 0\.08\)'/g, "border: '1px solid #E2E8F0'");
content = content.replace(/border: '1px solid rgba\(255,255,255,0\.08\)'/g, "border: '1px solid #E2E8F0'");
content = content.replace(/border: '1px solid rgba\(255,255,255,0\.06\)'/g, "border: '1px solid #E2E8F0'");
content = content.replace(/border: '1px solid rgba\(255,255,255,0\.05\)'/g, "border: '1px solid #E2E8F0'");
content = content.replace(/border: '1px solid rgba\(255,255,255,0\.1\)'/g, "border: '1px solid #CBD5E1'");
content = content.replace(/borderTop: '1px solid rgba\(255,255,255,0\.06\)'/g, "borderTop: '1px solid #E2E8F0'");
content = content.replace(/borderBottom: '1px solid rgba\(255,255,255,0\.06\)'/g, "borderBottom: '1px solid #E2E8F0'");

// Text Colors
content = content.replace(/color: '#F8FAFC'/g, "color: '#0F172A'");
content = content.replace(/color: '#94A3B8'/g, "color: '#475569'");
content = content.replace(/color: '#CBD5E1'/g, "color: '#334155'");

// Inputs & Selects text color needs to be dark
content = content.replace(/color: '#FFFFFF'/g, "color: '#0F172A'");

// But the Buttons need white text!
// Reverting button text colors that were just ruined
content = content.replace(/color: '#0F172A',\n\s*fontWeight: '900',/g, "color: '#FFFFFF',\n              fontWeight: '900',");
content = content.replace(/color: '#0F172A',\n\s*display: 'flex',\n\s*alignItems: 'center',\n\s*gap: '6px',/g, "color: '#FFFFFF',\n                      display: 'flex',\n                      alignItems: 'center',\n                      gap: '6px',");

fs.writeFileSync(file, content, 'utf8');
console.log('Colors updated!');
