/**
 * Pre-process and aggregate NBA shot data into grid cells
 * Creates a much smaller aggregated file for faster loading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRID_SIZE = 1; // 1 foot per cell (smaller for more detail)
const COURT_WIDTH = 50; // -25 to +25 feet
const COURT_LENGTH = 47; // 0 to 47 feet for half court

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

async function processSeasonFile(season, inputPath, outputDir) {
  const filename = `NBA_${season}_Shots.csv`;
  const filePath = path.join(inputPath, filename);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filename}`);
    return null;
  }
  
  console.log(`Processing ${filename}...`);
  const startTime = Date.now();
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  
  // Skip header row
  const header = lines[0];
  const dataLines = lines.slice(1).filter(line => line.trim());
  
  // Find column indices
  const headerCols = parseCSVLine(header);
  const locXIdx = headerCols.indexOf('LOC_X');
  const locYIdx = headerCols.indexOf('LOC_Y');
  const shotMadeIdx = headerCols.indexOf('SHOT_MADE');
  const seasonIdx = headerCols.indexOf('SEASON_1');
  
  if (locXIdx === -1 || locYIdx === -1 || shotMadeIdx === -1) {
    console.warn(`Missing required columns in ${filename}`);
    return null;
  }
  
  // CRITICAL: Determine if this season needs coordinate conversion (2020-2022)
  // These seasons have LOC_X and LOC_Y stored in tenths of feet with Y from baseline
  const needsConversion = season >= 2020 && season <= 2022;
  if (needsConversion) {
    console.log(`  ⚠️ Season ${season} needs coordinate conversion (tenths of feet -> feet)`);
  }
  
  // Grid to aggregate shots
  const grid = new Map();
  let totalShots = 0;
  let validShots = 0;
  
  // Process each shot
  for (const line of dataLines) {
    totalShots++;
    const columns = parseCSVLine(line);
    
    if (columns.length <= Math.max(locXIdx, locYIdx, shotMadeIdx)) continue;
    
    const locXRaw = parseFloat(columns[locXIdx]?.trim());
    const locYRaw = parseFloat(columns[locYIdx]?.trim());
    const shotMade = columns[shotMadeIdx]?.trim() === 'TRUE';
    
    // Skip invalid coordinates
    if (isNaN(locXRaw) || isNaN(locYRaw)) continue;
    
    // CRITICAL: Convert coordinates to normalized feet system
    // Seasons 2020-2022: LOC_X and LOC_Y are in tenths of feet
    // All other seasons: LOC_X and LOC_Y are already in feet
    let locX, locY;
    
    if (needsConversion) {
      // Convert from tenths of feet to feet, and adjust Y to be basket-centered
      // LOC_X: multiply by 10 to convert tenths to feet
      // LOC_Y: multiply by 10 to convert tenths to feet, then subtract 52.5 to convert from baseline to basket-centered
      locX = locXRaw * 10;
      locY = (locYRaw * 10) - 52.5;
    } else {
      // Already in feet, use as-is
      locX = locXRaw;
      locY = locYRaw;
    }
    
    // Filter for valid coordinates and half court
    if (
      locX >= -30 && locX <= 30 &&
      locY >= 0 && locY <= 47  // Half court only
    ) {
      validShots++;
      
      // Round to grid cell
      const gridX = Math.floor(locX / GRID_SIZE) * GRID_SIZE;
      const gridY = Math.floor(locY / GRID_SIZE) * GRID_SIZE;
      const key = `${gridX},${gridY}`;
      
      if (!grid.has(key)) {
        grid.set(key, {
          x: gridX,
          y: gridY,
          count: 0,
          made: 0,
          missed: 0
        });
      }
      
      const cell = grid.get(key);
      cell.count++;
      if (shotMade) {
        cell.made++;
      } else {
        cell.missed++;
      }
    }
  }
  
  // Convert grid to array
  const gridData = Array.from(grid.values());
  
  const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`  Processed ${totalShots.toLocaleString()} shots, ${validShots.toLocaleString()} valid, ${gridData.length} grid cells in ${processingTime}s`);
  
  // Save aggregated data
  const outputPath = path.join(outputDir, `NBA_${season}_Shots_Grid.json`);
  fs.writeFileSync(outputPath, JSON.stringify(gridData), 'utf-8');
  
  const fileSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`  Saved to ${outputPath} (${fileSize} MB)`);
  
  return {
    season,
    gridCells: gridData.length,
    totalShots: validShots,
    fileSize: fs.statSync(outputPath).size
  };
}

async function generateShotGrid() {
  const inputDir = path.join(__dirname, '../public/per_season_shots');
  const outputDir = path.join(__dirname, '../public/per_season_shots_grid');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('Generating aggregated shot grid data...\n');
  
  const seasons = [];
  for (let year = 2004; year <= 2024; year++) {
    seasons.push(year);
  }
  
  const results = [];
  
  for (const season of seasons) {
    const result = await processSeasonFile(season, inputDir, outputDir);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n=== Summary ===');
  const totalCells = results.reduce((sum, r) => sum + r.gridCells, 0);
  const totalShots = results.reduce((sum, r) => sum + r.totalShots, 0);
  const totalSize = results.reduce((sum, r) => sum + r.fileSize, 0);
  
  console.log(`Total seasons processed: ${results.length}`);
  console.log(`Total grid cells: ${totalCells.toLocaleString()}`);
  console.log(`Total shots aggregated: ${totalShots.toLocaleString()}`);
  console.log(`Total output size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\nAggregated files saved to: ${outputDir}`);
}

generateShotGrid().catch(console.error);

