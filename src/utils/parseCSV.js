/**
 * Parse NBA season data from CSV
 * Extracts Season and FT% columns
 */
export async function parseNBAData() {
  try {
    // Load CSV from public folder
    const response = await fetch('/nba_avgs_per_season.csv');
    const text = await response.text();
    const lines = text.split('\n');
    
    // Skip header rows (first 2 lines are headers)
    const dataLines = lines.slice(2).filter(line => line.trim());
    
    const data = dataLines
      .map(line => {
        const columns = line.split(',');
        const season = columns[1]?.trim(); // Season column
        const fgPercent = columns[23]?.trim(); // FG% column (0-based index 23)
        const ftPercent = columns[25]?.trim(); // FT% column (0-based index 25)
        const tsPercent = columns[32]?.trim(); // TS% column (0-based index 32)
        const pace = columns[26]?.trim(); // Pace column (0-based index 26)
        const ortg = columns[31]?.trim(); // ORtg (Offensive Rating - points per 100 possessions) column (0-based index 31, column AF)
        const efgPercent = columns[27]?.trim(); // eFG% column (0-based index 27)
        const ftPerFga = columns[30]?.trim(); // FT/FGA column (0-based index 30)
        const orbPercent = columns[29]?.trim(); // ORB% column (0-based index 29)
        
        // Skip rows with missing data
        if (!season || !ftPercent || ftPercent === '' || !fgPercent || fgPercent === '' || !tsPercent || tsPercent === '') {
          return null;
        }
        
        // Convert percentages from decimal (0.786) to percentage (78.6)
        const fgPercentNum = parseFloat(fgPercent);
        const ftPercentNum = parseFloat(ftPercent);
        const tsPercentNum = parseFloat(tsPercent);
        const paceNum = pace ? parseFloat(pace) : null;
        const ortgNum = ortg ? parseFloat(ortg) : null;
        const efgPercentNum = efgPercent ? parseFloat(efgPercent) : null;
        const ftPerFgaNum = ftPerFga ? parseFloat(ftPerFga) : null;
        const orbPercentNum = orbPercent ? parseFloat(orbPercent) : null;
        
        if (isNaN(fgPercentNum) || isNaN(ftPercentNum) || isNaN(tsPercentNum)) {
          return null;
        }
        
        return {
          season: season,
          fgPercent: fgPercentNum * 100, // Convert to percentage
          ftPercent: ftPercentNum * 100, // Convert to percentage
          tsPercent: tsPercentNum * 100, // Convert to percentage
          pace: paceNum,
          ortg: ortgNum, // Use ORtg directly from CSV
          efgPercent: efgPercentNum ? efgPercentNum * 100 : null, // Convert to percentage
          ftPerFga: ftPerFgaNum, // Keep as ratio
          orbPercent: orbPercentNum ? orbPercentNum * 100 : null, // Convert to percentage
          year: extractYear(season)
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => {
        // Sort by year (oldest first)
        return a.year - b.year;
      });
    
    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

/**
 * Extract year from season string (e.g., "2024-25" -> 2024)
 */
function extractYear(season) {
  const match = season.match(/^(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

