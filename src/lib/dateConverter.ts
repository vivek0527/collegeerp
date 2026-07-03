export interface BsYearData {
  adStart: string; // YYYY-MM-DD of 1st Baishakh of this BS year
  days: number[];  // 12 numbers representing the number of days in each month (index 0 = Baishakh)
}

// Custom lookup table for BS date conversion (BS 2070 to 2095)
// Month indices: 0 = Baishakh, 1 = Jetha, 2 = Asar, 3 = Shrawan, 4 = Bhadra, 5 = Ashwin,
//                6 = Kartik, 7 = Mangsir, 8 = Poush, 9 = Magh, 10 = Falgun, 11 = Chaitra
export const nepaliYears: Record<number, BsYearData> = {
  2070: { adStart: '2013-04-14', days: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30] },
  2071: { adStart: '2014-04-14', days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
  2072: { adStart: '2015-04-14', days: [31, 32, 31, 31, 32, 30, 30, 30, 29, 29, 30, 30] },
  2073: { adStart: '2016-04-13', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31] },
  2074: { adStart: '2017-04-14', days: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30] },
  2075: { adStart: '2018-04-14', days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
  2076: { adStart: '2019-04-14', days: [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30] },
  2077: { adStart: '2020-04-13', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30] },
  2078: { adStart: '2021-04-14', days: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30] },
  2079: { adStart: '2022-04-14', days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
  2080: { adStart: '2023-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30] },
  2081: { adStart: '2024-04-13', days: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2082: { adStart: '2025-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2083: { adStart: '2026-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2084: { adStart: '2027-04-14', days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30] },
  2085: { adStart: '2028-04-13', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2086: { adStart: '2029-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2087: { adStart: '2030-04-14', days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30] },
  2088: { adStart: '2031-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2089: { adStart: '2032-04-13', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2090: { adStart: '2033-04-14', days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30] },
  2091: { adStart: '2034-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2092: { adStart: '2035-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2093: { adStart: '2036-04-13', days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30] },
  2094: { adStart: '2037-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
  2095: { adStart: '2038-04-14', days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
};

export const nepaliMonths = [
  'Baishakh',
  'Jetha',
  'Asar',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

/**
 * Converts AD date to BS Nepali Date
 */
export function adToBs(date: Date | string | number): {
  year: number;
  month: number; // 1-indexed (1 = Baishakh)
  day: number;
  monthName: string;
  formatted: string; // YYYY-MM-DD
} {
  const adDate = new Date(date);
  adDate.setHours(12, 0, 0, 0); // Normalize time to avoid timezone offsets

  const timeVal = adDate.getTime();
  let selectedBsYear = 0;

  // Find the matching BS year
  const years = Object.keys(nepaliYears).map(Number).sort();
  for (let i = 0; i < years.length; i++) {
    const yr = years[i];
    const adStart = new Date(nepaliYears[yr].adStart);
    adStart.setHours(12, 0, 0, 0);

    const nextAdStart =
      i < years.length - 1
        ? new Date(nepaliYears[years[i + 1]].adStart)
        : new Date(adStart.getTime() + 365 * 24 * 60 * 60 * 1000);
    nextAdStart.setHours(12, 0, 0, 0);

    if (timeVal >= adStart.getTime() && timeVal < nextAdStart.getTime()) {
      selectedBsYear = yr;
      break;
    }
  }

  if (selectedBsYear === 0) {
    // Return a default date if out of bounds
    return {
      year: 2083,
      month: 3,
      day: 17,
      monthName: 'Asar',
      formatted: '2083-03-17',
    };
  }

  const yearData = nepaliYears[selectedBsYear];
  const startAd = new Date(yearData.adStart);
  startAd.setHours(12, 0, 0, 0);

  // Difference in days
  const diffTime = timeVal - startAd.getTime();
  let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let month = 0;
  while (month < 12 && diffDays >= yearData.days[month]) {
    diffDays -= yearData.days[month];
    month++;
  }

  const finalMonth = month + 1; // 1-indexed
  const finalDay = diffDays + 1; // 1-indexed

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatted = `${selectedBsYear}-${pad(finalMonth)}-${pad(finalDay)}`;

  return {
    year: selectedBsYear,
    month: finalMonth,
    day: finalDay,
    monthName: nepaliMonths[month],
    formatted,
  };
}

/**
 * Converts BS Nepali Date to AD Gregorian Date
 */
export function bsToAd(year: number, month: number, day: number): Date {
  const yearData = nepaliYears[year];
  if (!yearData) {
    return new Date(); // Return current date as fallback
  }

  const startAd = new Date(yearData.adStart);
  startAd.setHours(12, 0, 0, 0);

  // Sum up days of previous months
  let totalDaysOffset = 0;
  const targetMonthIndex = month - 1; // 0-indexed
  for (let m = 0; m < targetMonthIndex; m++) {
    totalDaysOffset += yearData.days[m];
  }

  // Add current month days offset
  totalDaysOffset += day - 1;

  // Add offset to startAd date
  const adTime = startAd.getTime() + totalDaysOffset * 24 * 60 * 60 * 1000;
  return new Date(adTime);
}

/**
 * Parse string YYYY-MM-DD into year, month, day numbers
 */
export function parseBsDate(bsDateStr: string): { year: number; month: number; day: number } {
  const parts = bsDateStr.split('-');
  return {
    year: parseInt(parts[0], 10) || 2083,
    month: parseInt(parts[1], 10) || 1,
    day: parseInt(parts[2], 10) || 1,
  };
}
