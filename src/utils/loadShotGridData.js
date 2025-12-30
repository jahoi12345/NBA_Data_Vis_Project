/**
 * Load pre-aggregated shot grid data
 * Much faster than loading raw CSV files
 */

export async function loadShotGridData(seasons = null) {
  try {
    console.log('Loading aggregated shot grid data...');
    
    // If no seasons specified, load all seasons (2004-2024)
    const seasonsToLoad = seasons 
      ? (Array.isArray(seasons) ? seasons : [seasons])
      : Array.from({ length: 21 }, (_, i) => 2004 + i); // 2004-2024
    
    const allGridData = [];
    
    for (const year of seasonsToLoad) {
      try {
        const filename = `NBA_${year}_Shots_Grid.json`;
        const response = await fetch(`/per_season_shots_grid/${filename}`);
        
        if (!response.ok) {
          console.warn(`Failed to load ${filename}: ${response.status}`);
          continue;
        }
        
        const gridData = await response.json();
        
        // Add season info to each cell
        const cellsWithSeason = gridData.map(cell => ({
          ...cell,
          season: year.toString()
        }));
        
        allGridData.push(...cellsWithSeason);
        
        console.log(`Loaded ${gridData.length} grid cells from ${filename}`);
      } catch (error) {
        console.warn(`Error loading ${year} grid data:`, error);
        continue;
      }
    }
    
    console.log(`Total grid cells loaded: ${allGridData.length}`);
    return allGridData;
  } catch (error) {
    console.error('Error loading shot grid data:', error);
    return [];
  }
}

