/**
 * Load pre-generated hexbin GeoJSON data
 * Compatible with ArcGIS FeatureLayer
 */

export async function loadHexbinData(seasons = null) {
  try {
    // If no seasons specified, load all seasons (2004-2024)
    const seasonsToLoad = seasons 
      ? (Array.isArray(seasons) ? seasons : [seasons])
      : Array.from({ length: 21 }, (_, i) => 2004 + i); // 2004-2024
    
    const allFeatures = [];
    
    for (const year of seasonsToLoad) {
      try {
        const filename = `NBA_${year}_Hexbins.geojson`;
        const response = await fetch(`${import.meta.env.BASE_URL}per_season_shots_hexbins/${filename}`);
        
        if (!response.ok) {
          continue;
        }
        
        const geoJson = await response.json();
        
        // Add all features to the collection
        allFeatures.push(...geoJson.features);
      } catch (error) {
        continue;
      }
    }
    
    // Create a combined GeoJSON FeatureCollection
    const combinedGeoJson = {
      type: 'FeatureCollection',
      features: allFeatures
    };
    
    return combinedGeoJson;
  } catch (error) {
    return { type: 'FeatureCollection', features: [] };
  }
}

