const fs = require('fs');
const file = 'src/components/portals/AcademicCalendarManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const startMarker = '<div className="mobile-grid" style={{ display: \'grid\', gridTemplateColumns: \'1.5fr 1fr\'';
const endMarker = '{/* Forms Section — STRICTLY VISIBLE TO Principal, Vice Principal, and Chairperson ONLY */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers!");
  process.exit(1);
}

const newLayout = `      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* ─── LEFT COLUMN: CALENDAR GRID ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* FULL BIKRAM SAMBAT MONTH CALENDAR GRID */}
          <div style={{
            backgroundColor: '#0F172A',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            {/* Month Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#F8FAFC', margin: 0 }}>
                  {bsYear} {selectedBsMonthName} BS
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8', backgroundColor: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '6px' }}>
                  {monthNamesEng[firstDayAd.getMonth()]} - {monthNamesEng[bsToAd(bsYear, bsMonth, totalDaysInBsMonth).getMonth()]} {bsToAd(bsYear, bsMonth, 1).getFullYear()} AD
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePrevBsMonth} style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
                  ← Prev BS Month
                </button>
                <button onClick={handleNextBsMonth} style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
                  Next BS Month →
                </button>
              </div>
            </div>

            {/* Scrollable Container for 7-Column BS Calendar Grid */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <div style={{ minWidth: '640px' }}>
                {/* 7-Column Day Header Row (Sunday to Saturday) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px', textAlign: 'center', fontSize: '0.78rem', fontWeight: '800', color: '#64748B' }}>
                  <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div style={{ color: '#F87171' }}>SAT (HOLIDAY)</div>
                </div>

                {/* 42-Cell Full BS Month Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {daysGrid.map((cell, idx) => {
                    const isSelected = cell.type === 'current' && cell.bsDay === selectedBsDay;
                    const matchingDbEvent = getMatchingEvent(cell);

                    const isDefaultHoliday = cell.type === 'current' && (cell.bsDay === 5 || cell.bsDay === 20 || cell.bsDay === 21 || cell.bsDay === 25 || cell.bsDay === 27 || cell.bsDay === 28);
                    const isDbHoliday = matchingDbEvent?.type === 'HOLIDAY' || matchingDbEvent?.type === 'EMERGENCY_HOLIDAY' || matchingDbEvent?.isEmergency;
                    const isHoliday = cell.isSaturday || isDefaultHoliday || isDbHoliday;
                    const isExam = cell.type === 'current' && (cell.bsDay >= 12 && cell.bsDay <= 14);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cell.type === 'current') {
                            setSelectedBsDay(cell.bsDay);
                          }
                        }}
                        style={{
                          minHeight: '78px',
                          backgroundColor: isHoliday ? (isSelected ? 'rgba(239, 68, 68, 0.28)' : 'rgba(239, 68, 68, 0.15)') : (isSelected ? 'rgba(37, 99, 235, 0.3)' : '#1E293B'),
                          border: isSelected ? (isHoliday ? '2px solid #EF4444' : '2px solid #3B82F6') : (isHoliday ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)'),
                          borderRadius: '10px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          opacity: cell.type !== 'current' ? 0.35 : 1,
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? (isHoliday ? '0 0 14px rgba(239, 68, 68, 0.4)' : '0 0 14px rgba(59, 130, 246, 0.4)') : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: isHoliday ? '#EF4444' : (isSelected ? '#38BDF8' : '#F8FAFC') }}>
                            {cell.bsDay}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: isHoliday ? '#FCA5A5' : '#64748B', fontWeight: '700' }}>
                            {cell.adDate.getDate()} {monthNamesEng[cell.adDate.getMonth()].slice(0, 3)}
                          </span>
                        </div>

                        <div style={{ marginTop: '4px' }}>
                          {matchingDbEvent ? (
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: matchingDbEvent.isEmergency ? '#DC2626' : '#EF4444', color: '#FFFFFF', padding: '3px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {matchingDbEvent.isEmergency ? 'Emergency' : 'Holiday'}
                            </div>
                          ) : cell.isSaturday ? (
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '2px 6px', borderRadius: '4px', textAlign: 'center' }}>
                              Sat Holiday
                            </div>
                          ) : isDefaultHoliday ? (
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: '#DC2626', color: '#FFFFFF', padding: '3px 6px', borderRadius: '4px', textAlign: 'center' }}>
                              Holiday
                            </div>
                          ) : isExam ? (
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px', textAlign: 'center' }}>
                              Exam Routine
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: SELECTED DATE INFO ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Hero Selected Date Bar */}
          <div style={{
            backgroundColor: '#0F172A',
            borderRadius: '12px',
            padding: '24px 20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#38BDF8', letterSpacing: '-0.02em' }}>
                २०८३ {selectedBsMonthName} {selectedBsDay}
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F8FAFC' }}>
                  {bsYear} {selectedBsMonthName} {selectedBsDay} BS
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  {monthNamesEng[selectedAdDate.getMonth()]} {selectedAdDate.getDate()}, {selectedAdDate.getFullYear()} AD ({['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedAdDate.getDay()]})
                </div>
              </div>
            </div>

            <div>
              {selectedDbEvent ? (
                <span style={{
                  backgroundColor: selectedDbEvent.isEmergency || selectedDbEvent.type === 'HOLIDAY' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: selectedDbEvent.isEmergency || selectedDbEvent.type === 'HOLIDAY' ? '#F87171' : '#38BDF8',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid currentColor',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  display: 'inline-block'
                }}>
                  {selectedDbEvent.isEmergency ? 'EMERGENCY HOLIDAY: ' : 'HOLIDAY: '} {selectedDbEvent.title}
                </span>
              ) : selectedAdDate.getDay() === 6 ? (
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '800', fontSize: '0.82rem', display: 'inline-block' }}>
                  Saturday Weekly Holiday — Campus Closed
                </span>
              ) : selectedBsDay === 5 || selectedBsDay === 20 || selectedBsDay === 21 || selectedBsDay === 25 || selectedBsDay === 27 || selectedBsDay === 28 ? (
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '800', fontSize: '0.82rem', display: 'inline-block' }}>
                  Public Holiday — Campus Closed
                </span>
              ) : selectedBsDay >= 12 && selectedBsDay <= 14 ? (
                <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', fontWeight: '800', fontSize: '0.82rem', display: 'inline-block' }}>
                  First Term Examination Routine Active
                </span>
              ) : (
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '800', fontSize: '0.82rem', display: 'inline-block' }}>
                  Campus Operations Active — Regular Class Routine
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      `;

const finalCode = code.substring(0, startIndex) + newLayout + code.substring(endIndex);
fs.writeFileSync(file, finalCode);
console.log("Successfully replaced layout section.");
