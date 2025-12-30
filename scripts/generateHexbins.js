/**
 * Pre-process and aggregate NBA shot data into rectangular grid cells
 * Creates GeoJSON format compatible with ArcGIS FeatureLayer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRID_SIZE = 0.5; // 0.5 foot grid cell size (rectangular cells)
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

// Create rectangle polygon vertices
function createRectangleVertices(centerX, centerY, width, height) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return [
    [centerX - halfWidth, centerY - halfHeight], // Top-left
    [centerX + halfWidth, centerY - halfHeight], // Top-right
    [centerX + halfWidth, centerY + halfHeight], // Bottom-right
    [centerX - halfWidth, centerY + halfHeight], // Bottom-left
    [centerX - halfWidth, centerY - halfHeight]  // Close polygon
  ];
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
  const zoneNameIdx = headerCols.indexOf('ZONE_NAME');
  
  if (locXIdx === -1 || locYIdx === -1 || shotMadeIdx === -1) {
    console.warn(`Missing required columns in ${filename}`);
    return null;
  }
  
  // Grid map: key is "gridX,gridY"
  const gridCells = new Map();
  let totalShots = 0;
  let validShots = 0;
  
  // Process each shot
  for (const line of dataLines) {
    totalShots++;
    const columns = parseCSVLine(line);
    
    if (columns.length <= Math.max(locXIdx, locYIdx, shotMadeIdx)) continue;
    
    const locX = parseFloat(columns[locXIdx]?.trim());
    const locY = parseFloat(columns[locYIdx]?.trim());
    const shotMade = columns[shotMadeIdx]?.trim() === 'TRUE';
    const zoneName = zoneNameIdx !== -1 ? columns[zoneNameIdx]?.trim() : '';
    
    // Filter for valid coordinates and half court
    if (
      !isNaN(locX) && !isNaN(locY) &&
      locX >= -30 && locX <= 30 &&
      locY >= 0 && locY <= 47  // Half court only
    ) {
      // Validate shot placement using ZONE_NAME if available
      // Skip shots that are clearly outside the court bounds based on zone
      if (zoneName) {
        // Filter out invalid zones (e.g., shots marked as out of bounds)
        const invalidZones = ['Out of Bounds', 'Invalid Zone'];
        if (invalidZones.includes(zoneName)) {
          continue;
        }
      }
      
      validShots++;
      
      // Round to grid cell (rectangular grid)
      const gridX = Math.floor(locX / GRID_SIZE) * GRID_SIZE;
      const gridY = Math.floor(locY / GRID_SIZE) * GRID_SIZE;
      const key = `${gridX},${gridY}`;
      
      if (!gridCells.has(key)) {
        gridCells.set(key, {
          centerX: gridX + (GRID_SIZE / 2), // Center of cell
          centerY: gridY + (GRID_SIZE / 2), // Center of cell
          gridX,
          gridY,
          count: 0,
          made: 0,
          missed: 0
        });
      }
      
      const cell = gridCells.get(key);
      cell.count++;
      if (shotMade) {
        cell.made++;
      } else {
        cell.missed++;
      }
    }
  }
  
  // Convert grid cells to GeoJSON features
  const features = [];
  gridCells.forEach((cell) => {
    // Only include cells with at least 1 shot
    if (cell.count >= 1) {
      // Create rectangle polygon
      const vertices = createRectangleVertices(cell.centerX, cell.centerY, GRID_SIZE, GRID_SIZE);
      
      // Convert to GeoJSON format
      const coordinates = vertices.map(v => [v[0], v[1]]);
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {
          Point_Count: cell.count,
          Made: cell.made,
          Missed: cell.missed,
          Season: season.toString(),
          CenterX: cell.centerX,
          CenterY: cell.centerY
        }
      });
    }
  });
  
  // Create GeoJSON FeatureCollection
  const geoJson = {
    type: 'FeatureCollection',
    features: features
  };
  
  const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`  Processed ${totalShots.toLocaleString()} shots, ${validShots.toLocaleString()} valid, ${features.length} grid cells in ${processingTime}s`);
  
  // Save GeoJSON
  const outputPath = path.join(outputDir, `NBA_${season}_Hexbins.geojson`);
  fs.writeFileSync(outputPath, JSON.stringify(geoJson), 'utf-8');
  
  const fileSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`  Saved to ${outputPath} (${fileSize} MB)`);
  
  return {
    season,
    gridCells: features.length,
    totalShots: validShots,
    fileSize: fs.statSync(outputPath).size
  };
}

async function generateHexbins() {
  const inputDir = path.join(__dirname, '../public/per_season_shots');
  const outputDir = path.join(__dirname, '../public/per_season_shots_hexbins');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('Generating rectangular grid cell data...\n');
  
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
  const totalGridCells = results.reduce((sum, r) => sum + r.gridCells, 0);
  const totalShots = results.reduce((sum, r) => sum + r.totalShots, 0);
  const totalSize = results.reduce((sum, r) => sum + r.fileSize, 0);
  
  console.log(`Total seasons processed: ${results.length}`);
  console.log(`Total grid cells: ${totalGridCells.toLocaleString()}`);
  console.log(`Total shots aggregated: ${totalShots.toLocaleString()}`);
  console.log(`Total output size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\nGrid cell files saved to: ${outputDir}`);
}

generateHexbins().catch(console.error);

