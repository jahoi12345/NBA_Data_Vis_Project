/**
 * Node.js script to process PlayerStatistics.csv and generate aggregated CSV
 * Saves the result to src/data/player_season_averages.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function generatePlayerAverages() {
  try {
    console.log('Reading PlayerStatistics.csv...');
    
    // Read the CSV file
    const csvPath = path.join(__dirname, '../public/PlayerStatistics.csv');
    const text = fs.readFileSync(csvPath, 'utf-8');
    const lines = text.split('\n');
    
    // Skip header row
    const header = parseCSVLine(lines[0]);
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    // Find column indices
    const firstNameIdx = header.indexOf('firstName');
    const lastNameIdx = header.indexOf('lastName');
    const personIdIdx = header.indexOf('personId');
    const gameTypeIdx = header.indexOf('gameType');
    const gameDateTimeIdx = header.indexOf('gameDateTimeEst');
    const pointsIdx = header.indexOf('points');
    const reboundsIdx = header.indexOf('reboundsTotal');
    const assistsIdx = header.indexOf('assists');
    
    console.log(`Processing ${dataLines.length} rows...`);
    
    // Map to store aggregated data: { season: { playerId: { firstName, lastName, points: [], rebounds: [], assists: [] } } }
    const aggregated = {};
    let processed = 0;
    
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
      
      // Extract season from date
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
      
      processed++;
      if (processed % 100000 === 0) {
        console.log(`Processed ${processed} rows...`);
      }
    }
    
    console.log('Calculating averages...');
    
    // Calculate averages and create CSV data
    const csvData = [];
    csvData.push('season,playerId,firstName,lastName,avgPoints,avgRebounds,avgAssists');
    
    const seasons = Object.keys(aggregated).sort();
    
    for (const season of seasons) {
      for (const personId in aggregated[season]) {
        const player = aggregated[season][personId];
        const avgPoints = player.points.reduce((a, b) => a + b, 0) / player.points.length;
        const avgRebounds = player.rebounds.reduce((a, b) => a + b, 0) / player.rebounds.length;
        const avgAssists = player.assists.reduce((a, b) => a + b, 0) / player.assists.length;
        
        csvData.push(
          `${season},${personId},"${player.firstName}","${player.lastName}",${avgPoints.toFixed(2)},${avgRebounds.toFixed(2)},${avgAssists.toFixed(2)}`
        );
      }
    }
    
    // Write to data folder
    const outputPath = path.join(__dirname, '../src/data/player_season_averages.csv');
    fs.writeFileSync(outputPath, csvData.join('\n'), 'utf-8');
    
    console.log(`✅ Successfully generated ${csvData.length - 1} player-season records`);
    console.log(`✅ Saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error processing player statistics:', error);
    process.exit(1);
  }
}

generatePlayerAverages();

