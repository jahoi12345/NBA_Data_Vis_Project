/**
 * Load and parse player_stats_usage_rs.csv
 * Returns data for highest usage players per team per season
 */

export async function loadUsageData() {
  try {
    console.log('Loading player_stats_usage_rs.csv...');
    const response = await fetch('/player_stats_usage_rs.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    console.log('Parsing CSV...');
    const text = await response.text();
    const lines = text.split('\n');
    
    // Skip header row
    const header = lines[0];
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    // Find column indices
    const headerCols = header.split(',');
    const seasonIdx = headerCols.indexOf('SEASON');
    const teamIdx = headerCols.indexOf('TEAM_ABBREVIATION');
    const playerIdIdx = headerCols.indexOf('PLAYER_ID');
    const playerNameIdx = headerCols.indexOf('PLAYER_NAME');
    const usgPctIdx = headerCols.indexOf('USG_PCT');
    const gpIdx = headerCols.indexOf('GP'); // Games Played
    
    if (seasonIdx === -1 || teamIdx === -1 || usgPctIdx === -1 || gpIdx === -1) {
      throw new Error('Required columns not found in CSV');
    }
    
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
    
    // Group by season and team
    const seasonTeamData = {};
    
    for (const line of dataLines) {
      const columns = parseCSVLine(line);
      
      if (columns.length <= Math.max(seasonIdx, teamIdx, usgPctIdx, gpIdx)) continue;
      
      const season = columns[seasonIdx]?.trim();
      const team = columns[teamIdx]?.trim();
      const playerId = columns[playerIdIdx]?.trim();
      const playerName = columns[playerNameIdx]?.trim();
      const usgPct = parseFloat(columns[usgPctIdx]?.trim() || '0');
      const gp = parseFloat(columns[gpIdx]?.trim() || '0'); // Games Played
      
      // Exclude players with 5 games or less
      if (gp <= 5) {
        continue;
      }
      
      if (!season || !team || isNaN(usgPct) || usgPct <= 0 || isNaN(gp)) {
        continue;
      }
      
      const key = `${season}_${team}`;
      if (!seasonTeamData[key]) {
        seasonTeamData[key] = [];
      }
      
      seasonTeamData[key].push({
        playerId,
        playerName,
        usgPct: usgPct * 100, // Convert to percentage
      });
    }
    
    // For each season-team, find highest usage players and calculate average
    const processedData = {};
    const teamData = {}; // For per-team analysis
    
    for (const [key, players] of Object.entries(seasonTeamData)) {
      if (players.length === 0) continue;
      
      const [season, team] = key.split('_');
      
      // Find max usage
      const maxUsage = Math.max(...players.map(p => p.usgPct));
      
      // Get all players with max usage (handle ties)
      const highestUsagePlayers = players.filter(p => p.usgPct === maxUsage);
      
      // Calculate average of highest usage players
      const avgUsage = highestUsagePlayers.reduce((sum, p) => sum + p.usgPct, 0) / highestUsagePlayers.length;
      
      // Get player name (use first player if multiple)
      const playerName = highestUsagePlayers[0]?.playerName || 'Unknown';
      
      // Extract year from season (e.g., "1996-97" -> 1996)
      const year = parseInt(season.split('-')[0]);
      
      if (!processedData[season]) {
        processedData[season] = {
          season,
          year,
          teamUsages: [],
          teamUsageData: [],
          avgUsage: 0,
        };
      }
      
      processedData[season].teamUsages.push(avgUsage);
      processedData[season].teamUsageData.push({
        team,
        playerName,
        usage: avgUsage,
      });
      
      // Store per-team data
      if (!teamData[team]) {
        teamData[team] = [];
      }
      teamData[team].push({
        season,
        year,
        usage: avgUsage,
      });
    }
    
    // Calculate league average for each season
    const leagueAverageData = Object.values(processedData)
      .map(seasonData => {
        const avg = seasonData.teamUsages.reduce((sum, t) => sum + t, 0) / seasonData.teamUsages.length;
        return {
          season: seasonData.season,
          year: seasonData.year,
          avgUsage: avg,
          teamUsages: seasonData.teamUsages, // Array of numbers for box/violin plot
          teamUsageData: seasonData.teamUsageData || [], // Array of {team, usage} for outlier labeling
        };
      })
      .sort((a, b) => a.year - b.year);
    
    // Process team data - get top 5 teams by average usage across all seasons
    const teamAverages = Object.entries(teamData).map(([team, data]) => {
      const avg = data.reduce((sum, d) => sum + d.usage, 0) / data.length;
      return { team, avg, data: data.sort((a, b) => a.year - b.year) };
    });
    
    const top5Teams = teamAverages
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5)
      .map(t => ({
        team: t.team,
        data: t.data,
      }));
    
    console.log('Processing complete!');
    
    return {
      leagueAverage: leagueAverageData,
      topTeams: top5Teams,
    };
  } catch (error) {
    console.error('Error loading usage data:', error);
    return {
      leagueAverage: [],
      topTeams: [],
    };
  }
}

