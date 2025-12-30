/**
 * Load and parse NBA shot data from CSV files
 * Returns aggregated shot data with coordinates
 */
export async function loadShotData() {
  try {
    console.log('Loading shot data from CSV files...');
    
    // Get all season files (2004-2024)
    const seasons = Array.from({ length: 21 }, (_, i) => 2004 + i);
    const allShots = [];
    
    // Load each season's shot data
    for (const seasonYear of seasons) {
      try {
        const filename = `NBA_${seasonYear}_Shots.csv`;
        console.log(`🔥 Attempting to load ${filename}...`);
        const response = await fetch(`/per_season_shots/${filename}`);
        
        if (!response.ok) {
          console.warn(`🔥 Failed to load ${filename}: ${response.status} ${response.statusText}`);
          continue;
        }
        
        console.log(`🔥 Successfully fetched ${filename}`);
        const text = await response.text();
        const lines = text.split('\n');
        
        console.log(`🔥 ${filename}: Loaded ${lines.length} total lines`);
        
        // Skip header row
        const header = lines[0];
        const dataLines = lines.slice(1).filter(line => line.trim());
        
        console.log(`🔥 ${filename}: ${dataLines.length} data lines after filtering empty lines`);
        
        if (dataLines.length === 0) {
          console.warn(`🔥 ${filename}: No data lines found!`);
          continue;
        }
        
        // Find column indices
        const headerCols = parseCSVLine(header);
        const locXIdx = headerCols.indexOf('LOC_X');
        const locYIdx = headerCols.indexOf('LOC_Y');
        const shotMadeIdx = headerCols.indexOf('SHOT_MADE');
        const seasonIdx = headerCols.indexOf('SEASON_1');
        const eventTypeIdx = headerCols.indexOf('EVENT_TYPE');
        const shotDistanceIdx = headerCols.indexOf('SHOT_DISTANCE');
        const shotTypeIdx = headerCols.indexOf('SHOT_TYPE');
        
        console.log(`🔥 ${filename} - Column indices:`, {
          locXIdx,
          locYIdx,
          shotMadeIdx,
          seasonIdx,
          eventTypeIdx,
          shotDistanceIdx,
          shotTypeIdx,
          headerCols: headerCols.slice(0, 10) // First 10 columns for debugging
        });
        
        if (locXIdx === -1 || locYIdx === -1 || shotMadeIdx === -1) {
          console.warn(`🔥 Missing required columns in ${filename}`);
          continue;
        }
        
        // CRITICAL: Determine if this season needs coordinate conversion (2020-2022)
        const needsConversion = seasonYear >= 2020 && seasonYear <= 2022;
        console.log(`🔥 ${filename}: needsConversion=${needsConversion} (year=${seasonYear})`);
        
        // Parse each shot
        let shotsAdded = 0;
        let shotsFilteredCoords = 0;
        let shotsInvalid = 0;
        let sampleCoords = [];
        
        // Track coordinate ranges for validation
        let minXRaw = Infinity;
        let maxXRaw = -Infinity;
        let minYRaw = Infinity;
        let maxYRaw = -Infinity;
        let minXFeet = Infinity;
        let maxXFeet = -Infinity;
        let minYFeet = Infinity;
        let maxYFeet = -Infinity;
        
        for (const line of dataLines) {
          const columns = parseCSVLine(line);
          
          if (columns.length <= Math.max(locXIdx, locYIdx, shotMadeIdx)) {
            shotsInvalid++;
            continue;
          }
          
          // Do NOT filter by EVENT_TYPE - include all rows
          const eventType = eventTypeIdx !== -1 ? columns[eventTypeIdx]?.trim() : null;
          
          // Read raw coordinates from CSV
          const locXRaw = parseFloat(columns[locXIdx]?.trim());
          const locYRaw = parseFloat(columns[locYIdx]?.trim());
          const shotMade = columns[shotMadeIdx]?.trim() === 'TRUE';
          const seasonLabel = seasonIdx !== -1 ? columns[seasonIdx]?.trim() : seasonYear.toString();
          const shotDistance = shotDistanceIdx !== -1 ? parseFloat(columns[shotDistanceIdx]?.trim()) : null;
          const shotType = shotTypeIdx !== -1 ? columns[shotTypeIdx]?.trim() : null;
          
          // Skip if coordinates are invalid
          if (isNaN(locXRaw) || isNaN(locYRaw)) {
            shotsInvalid++;
            continue;
          }
          
          // Track RAW coordinate ranges (before conversion)
          if (!isNaN(locXRaw)) {
            minXRaw = Math.min(minXRaw, locXRaw);
            maxXRaw = Math.max(maxXRaw, locXRaw);
          }
          if (!isNaN(locYRaw)) {
            minYRaw = Math.min(minYRaw, locYRaw);
            maxYRaw = Math.max(maxYRaw, locYRaw);
          }
          
          // CRITICAL: Convert coordinates to normalized feet system
          // Seasons 2020-2022: LOC_X and LOC_Y are in tenths of feet
          // All other seasons: LOC_X and LOC_Y are already in feet
          let locXFeet, locYFeet;
          
          if (needsConversion) {
            // Convert from tenths of feet to feet, and adjust Y to be basket-centered
            // LOC_X: multiply by 10 to convert tenths to feet
            // LOC_Y: multiply by 10 to convert tenths to feet, then subtract 52.5 to convert from baseline to basket-centered
            locXFeet = locXRaw * 10;
            locYFeet = (locYRaw * 10) - 52.5; // Convert tenths to feet, then subtract baseline offset
            
            // DEBUG: Log first few conversions for 2020-2022
            if (shotsAdded < 3 && shotsFilteredCoords < 3) {
              console.log(`🔥 Conversion ${filename} (raw -> normalized):`, {
                raw: { x: locXRaw, y: locYRaw },
                normalized: { x: locXFeet, y: locYFeet },
                inRange: locXFeet >= -25 && locXFeet <= 25 && locYFeet >= 0 && locYFeet <= 47
              });
            }
          } else {
            // Already in feet, use as-is
            locXFeet = locXRaw;
            locYFeet = locYRaw;
          }
          
          // Track NORMALIZED coordinate ranges for validation
          if (!isNaN(locXFeet)) {
            minXFeet = Math.min(minXFeet, locXFeet);
            maxXFeet = Math.max(maxXFeet, locXFeet);
          }
          if (!isNaN(locYFeet)) {
            minYFeet = Math.min(minYFeet, locYFeet);
            maxYFeet = Math.max(maxYFeet, locYFeet);
          }
          
          // Collect sample coordinates for debugging (first 5 invalid ones)
          if (shotsFilteredCoords < 5) {
            if (locXFeet < -25 || locXFeet > 25 || locYFeet < 0 || locYFeet > 47) {
              sampleCoords.push({ 
                raw: { x: locXRaw, y: locYRaw },
                normalized: { x: locXFeet, y: locYFeet },
                reason: `X: ${locXFeet < -25 || locXFeet > 25 ? 'out of range' : 'ok'}, Y: ${locYFeet < 0 || locYFeet > 47 ? 'out of range' : 'ok'}` 
              });
            }
          }
          
          // Filter out invalid coordinates using NORMALIZED coordinates
          // LOC_X_FEET: -25 to +25 feet (court width, centered at basket)
          // LOC_Y_FEET: 0 to 47 feet (half court only, distance from basket)
          // Filter full-court shots and heaves (LOC_Y_FEET > 47)
          if (
            locXFeet >= -25 && locXFeet <= 25 &&
            locYFeet >= 0 && locYFeet <= 47  // Half court only
          ) {
            // Determine if this is a 3-point shot
            const isThreePoint = shotType === '3PT Field Goal' || 
                                (shotDistance !== null && shotDistance >= 22);
            
            allShots.push({
              x: locXFeet,  // Use normalized X coordinate
              y: locYFeet,  // Use normalized Y coordinate
              made: shotMade,
              season: seasonLabel,
              eventType: eventType || 'shot',
              shotDistance: shotDistance,
              shotType: shotType,
              isThreePoint: isThreePoint
            });
            shotsAdded++;
          } else {
            shotsFilteredCoords++;
          }
        }
        
        // VALIDATION: Log coordinate ranges and check for collapse
        if (shotsAdded > 0) {
          const xSpan = maxXFeet - minXFeet;
          const ySpan = maxYFeet - minYFeet;
          console.log(`🔥 ${filename} - Coordinate validation:`, {
            rawRange: { x: [minXRaw !== Infinity ? minXRaw.toFixed(2) : 'N/A', maxXRaw !== -Infinity ? maxXRaw.toFixed(2) : 'N/A'], y: [minYRaw !== Infinity ? minYRaw.toFixed(2) : 'N/A', maxYRaw !== -Infinity ? maxYRaw.toFixed(2) : 'N/A'] },
            normalizedRange: { x: [minXFeet !== Infinity ? minXFeet.toFixed(2) : 'N/A', maxXFeet !== -Infinity ? maxXFeet.toFixed(2) : 'N/A'], y: [minYFeet !== Infinity ? minYFeet.toFixed(2) : 'N/A', maxYFeet !== -Infinity ? maxYFeet.toFixed(2) : 'N/A'] },
            span: { x: xSpan !== Infinity && xSpan !== -Infinity ? xSpan.toFixed(2) : 'N/A', y: ySpan !== Infinity && ySpan !== -Infinity ? ySpan.toFixed(2) : 'N/A' },
            expectedSpan: { x: 50, y: 47 },
            needsConversion,
            shotsAdded,
            shotsFiltered: shotsFilteredCoords
          });
          
          // Warn if span is significantly smaller than expected (but don't halt)
          if (xSpan < 40 || ySpan < 40) {
            console.warn(`🔥 WARNING: ${filename} - Coordinate span smaller than expected! X span: ${xSpan.toFixed(2)}, Y span: ${ySpan.toFixed(2)}. Expected ~50 and ~47.`);
          }
        } else if (dataLines.length > 0) {
          // CRITICAL: If no shots were added, log why
          console.error(`🔥 CRITICAL: ${filename} - No shots added after conversion!`, {
            needsConversion,
            totalRows: dataLines.length,
            shotsFiltered: shotsFilteredCoords,
            shotsInvalid,
            sampleCoords: sampleCoords.slice(0, 5),
            rawRange: {
              x: [minXRaw !== Infinity ? minXRaw.toFixed(2) : 'N/A', maxXRaw !== -Infinity ? maxXRaw.toFixed(2) : 'N/A'],
              y: [minYRaw !== Infinity ? minYRaw.toFixed(2) : 'N/A', maxYRaw !== -Infinity ? maxYRaw.toFixed(2) : 'N/A']
            },
            normalizedRange: {
              x: [minXFeet !== Infinity ? minXFeet.toFixed(2) : 'N/A', maxXFeet !== -Infinity ? maxXFeet.toFixed(2) : 'N/A'],
              y: [minYFeet !== Infinity ? minYFeet.toFixed(2) : 'N/A', maxYFeet !== -Infinity ? maxYFeet.toFixed(2) : 'N/A']
            }
          });
        }
        
        if (sampleCoords.length > 0 && shotsAdded === 0) {
          console.log(`🔥 Sample filtered coordinates from ${filename}:`, sampleCoords);
        }
        
        console.log(`🔥 ${filename}: ${dataLines.length} total rows, ${shotsAdded} added, ${shotsFilteredCoords} filtered by coords, ${shotsInvalid} invalid`);
        if (shotsAdded === 0 && dataLines.length > 0) {
          console.warn(`🔥 ${filename}: WARNING - No shots added! Check coordinate filtering.`);
        }
      } catch (error) {
        console.warn(`🔥 Error loading ${seasonYear} shots:`, error);
        console.error('Error stack:', error.stack);
      }
    }
    
    console.log(`Total shots loaded: ${allShots.length}`);
    
    if (allShots.length === 0) {
      console.error('🔥 CRITICAL: No shots loaded at all! Check CSV files and coordinate conversion.');
    }
    
    return allShots;
  } catch (error) {
    console.error('🔥 CRITICAL: Error loading shot data:', error);
    console.error('Error stack:', error.stack);
    return [];
  }
}

/**
 * Parse CSV line handling quoted fields
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