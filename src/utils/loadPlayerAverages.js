/**
 * Load and parse the pre-generated player_season_averages.csv file
 * Returns season counts for players with >25 pts, >5 reb, >5 assists
 */

export async function loadPlayerAverages() {
  try {
    console.log('Loading player_season_averages.csv...');
    const response = await fetch('/player_season_averages.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    console.log('Parsing CSV...');
    const text = await response.text();
    const lines = text.split('\n');
    
    // Skip header row
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log(`Processing ${dataLines.length} rows...`);
    
    // Parse CSV line handling quoted fields
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current);
      return result;
    };
    
    // Count players per season with >25 pts, >5 reb, >5 assists
    const seasonCounts = {};
    
    for (const line of dataLines) {
      const columns = parseCSVLine(line);
      
      if (columns.length < 6) continue;
      
      const season = columns[0]?.trim();
      const avgPoints = parseFloat(columns[4]?.trim() || '0');
      const avgRebounds = parseFloat(columns[5]?.trim() || '0');
      const avgAssists = parseFloat(columns[6]?.trim() || '0');
      
      if (!season || isNaN(avgPoints) || isNaN(avgRebounds) || isNaN(avgAssists)) {
        continue;
      }
      
      // Count elite players
      if (avgPoints > 25 && avgRebounds > 5 && avgAssists > 5) {
        if (!seasonCounts[season]) {
          seasonCounts[season] = 0;
        }
        seasonCounts[season]++;
      }
    }
    
    console.log('Processing complete!');
    
    return Object.entries(seasonCounts)
      .map(([season, count]) => ({ season, count }))
      .sort((a, b) => a.season.localeCompare(b.season));
  } catch (error) {
    console.error('Error loading player averages:', error);
    return [];
  }
}

