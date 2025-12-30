/**
 * Process PlayerStatistics.csv to create aggregated data by season and player
 * Filters by 'Regular Season' gameType
 * Groups by season and player, calculates averages for pts, reb, assists
 */

export async function processPlayerStatistics() {
  try {
    console.log('Loading PlayerStatistics.csv...');
    const response = await fetch('/PlayerStatistics.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    console.log('Parsing CSV...');
    const text = await response.text();
    const lines = text.split('\n');
    
    // Skip header row - use parseCSVLine to handle quoted fields
    const header = parseCSVLine(lines[0]);
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log(`Processing ${dataLines.length} rows...`);
    
    // Find column indices
    const firstNameIdx = header.indexOf('firstName');
    const lastNameIdx = header.indexOf('lastName');
    const personIdIdx = header.indexOf('personId');
    const gameTypeIdx = header.indexOf('gameType');
    const gameDateTimeIdx = header.indexOf('gameDateTimeEst');
    const pointsIdx = header.indexOf('points');
    const reboundsIdx = header.indexOf('reboundsTotal');
    const assistsIdx = header.indexOf('assists');
    
    // Map to store aggregated data: { season: { playerId: { firstName, lastName, points: [], rebounds: [], assists: [] } } }
    const aggregated = {};
    
    // Process each line
    for (const line of dataLines) {
      // Handle CSV parsing with potential commas in quoted fields
      const columns = parseCSVLine(line);
      
      if (columns.length < Math.max(gameTypeIdx, gameDateTimeIdx, pointsIdx, reboundsIdx, assistsIdx) + 1) {
        continue;
      }
      
      const gameType = columns[gameTypeIdx]?.trim();
      
      // Filter by Regular Season
      if (gameType !== 'Regular Season') {
        continue;
      }
      
      const gameDateTime = columns[gameDateTimeIdx]?.trim();
      const firstName = columns[firstNameIdx]?.trim();
      const lastName = columns[lastNameIdx]?.trim();
      const personId = columns[personIdIdx]?.trim();
      const points = parseFloat(columns[pointsIdx]?.trim() || '0');
      const rebounds = parseFloat(columns[reboundsIdx]?.trim() || '0');
      const assists = parseFloat(columns[assistsIdx]?.trim() || '0');
      
      if (!gameDateTime || !personId || isNaN(points) || isNaN(rebounds) || isNaN(assists)) {
        continue;
      }
      
      // Extract season from date (NBA season: Oct-Jun, e.g., Oct 2024 = 2024-25 season)
      const season = extractSeason(gameDateTime);
      
      if (!season) continue;
      
      if (!aggregated[season]) {
        aggregated[season] = {};
      }
      
      if (!aggregated[season][personId]) {
        aggregated[season][personId] = {
          firstName,
          lastName,
          personId,
          points: [],
          rebounds: [],
          assists: []
        };
      }
      
      aggregated[season][personId].points.push(points);
      aggregated[season][personId].rebounds.push(rebounds);
      aggregated[season][personId].assists.push(assists);
    }
    
    // Calculate averages and create CSV data
    const csvData = [];
    csvData.push('season,playerId,firstName,lastName,avgPoints,avgRebounds,avgAssists');
    
    const seasons = Object.keys(aggregated).sort();
    
    // Count players per season with >25 pts, >5 reb, >5 assists
    const seasonCounts = {};
    
    for (const season of seasons) {
      let count = 0;
      for (const personId in aggregated[season]) {
        const player = aggregated[season][personId];
        const avgPoints = player.points.reduce((a, b) => a + b, 0) / player.points.length;
        const avgRebounds = player.rebounds.reduce((a, b) => a + b, 0) / player.rebounds.length;
        const avgAssists = player.assists.reduce((a, b) => a + b, 0) / player.assists.length;
        
        // Add to CSV
        csvData.push(
          `${season},${personId},"${player.firstName}","${player.lastName}",${avgPoints.toFixed(2)},${avgRebounds.toFixed(2)},${avgAssists.toFixed(2)}`
        );
        
        // Count elite players
        if (avgPoints > 25 && avgRebounds > 5 && avgAssists > 5) {
          count++;
        }
      }
      seasonCounts[season] = count;
    }
    
    console.log('Processing complete!');
    
    return {
      csvContent: csvData.join('\n'),
      seasonCounts: Object.entries(seasonCounts)
        .map(([season, count]) => ({ season, count }))
        .sort((a, b) => a.season.localeCompare(b.season))
    };
  } catch (error) {
    console.error('Error processing player statistics:', error);
    return { csvContent: '', seasonCounts: [] };
  }
}

/**
 * Extract season from date string
 * NBA seasons run Oct-Jun, so:
 * - Oct-Dec: current year season (e.g., Oct 2024 = 2024-25)
 * - Jan-Jun: previous year season (e.g., Jan 2025 = 2024-25)
 */
function extractSeason(dateString) {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    
    if (month >= 10) {
      // Oct-Dec: current year season
      return `${year}-${String(year + 1).slice(-2)}`;
    } else {
      // Jan-Jun: previous year season
      return `${year - 1}-${String(year).slice(-2)}`;
    }
  } catch (e) {
    return null;
  }
}

/**
 * Parse CSV line handling quoted fields with commas
 */
function parseCSVLine(line) {
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
}

