const fs = require('fs');
const file = 'src/components/portals/AcademicCalendarManager.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace dark card backgrounds with white
code = code.replace(/backgroundColor: '#0F172A'/g, "backgroundColor: '#FFFFFF'");

// Replace border colors to light mode borders
code = code.replace(/border: '1px solid rgba\(255, ?255, ?255, ?0\.08\)'/g, "border: '1px solid #E2E8F0'");
code = code.replace(/border: '1px solid rgba\(255,255,255,0\.1\)'/g, "border: '1px solid #E2E8F0'");
code = code.replace(/border: '1px solid rgba\(255, ?255, ?255, ?0\.06\)'/g, "border: '1px solid #E2E8F0'");

// Replace light text with dark text
code = code.replace(/color: '#F8FAFC'/g, "color: '#0F172A'");

// Replace dark cell/button backgrounds with light slate backgrounds
code = code.replace(/backgroundColor: '#1E293B'/g, "backgroundColor: '#F8FAFC'");

// Replace button/text colors on those light slate backgrounds
code = code.replace(/color: '#FFFFFF'/g, "color: '#334155'");

// Specifically fix the span with rgba(255,255,255,0.06) background
code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.06\)'/g, "backgroundColor: '#F1F5F9'");

// Fix the Saturday (Holiday) header color which is currently '#F87171' (light red) -> '#EF4444' (standard red)
code = code.replace(/color: '#F87171'/g, "color: '#EF4444'");

// Fix the table header backgrounds (line 318)
code = code.replace(/th \{ background-color: #0F172A; color: #FFFFFF;/g, "th { background-color: #F8FAFC; color: #0F172A; border-bottom: 2px solid #E2E8F0;");

// In the day cells:
// opacity: cell.type !== 'current' ? 0.35 : 1
// In light mode, this opacity is fine.

// Let's write it back!
fs.writeFileSync(file, code);
console.log("Successfully converted calendar to white cards!");
