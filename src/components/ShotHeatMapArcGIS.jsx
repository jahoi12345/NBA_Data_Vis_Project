import { useEffect, useRef, useState } from 'react';
import { Slider } from './Slider';
import './Slider.css';
import './ShotHeatMapArcGIS.css';

export default function ShotHeatMapArcGIS({ 
  width = 800, 
  height = 600, 
  isVisible = false,
  season = null, // Initial season (e.g., "2004")
  shotData = null // Array of shot objects: { x, y, season }
}) {
  console.log('🔥 ShotHeatMapArcGIS: Component rendered', { 
    isVisible, 
    season, 
    shotDataLength: shotData?.length || 0,
    shotDataType: Array.isArray(shotData) ? 'array' : typeof shotData,
    width,
    height
  });

  const sceneViewRef = useRef(null);
  const containerRef = useRef(null);
  const [packageInstalled, setPackageInstalled] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(season || "2004");
  const featureLayerRef = useRef(null);
  const arcGISModulesRef = useRef(null); // Store ArcGIS modules for reuse
  const seasonStatisticsRef = useRef(null); // Store pre-calculated statistics per season
  // Use matchMedia for reliable mobile detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  // Track window size for responsive behavior using matchMedia
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    // Set initial value
    setIsMobile(mediaQuery.matches);
    
    // Listen for changes
    const handleChange = (e) => {
      setIsMobile(e.matches);
    };
    
    // Use addEventListener for modern browsers, addListener for older ones
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    console.log('🔥 ShotHeatMapArcGIS: useEffect[isVisible, shotData] triggered', {
      isVisible,
      hasContainer: !!containerRef.current,
      shotDataLength: shotData?.length || 0
    });
    
    if (!isVisible || !containerRef.current) {
      console.log('🔥 ShotHeatMapArcGIS: Skipping ArcGIS load', {
        isVisible,
        hasContainer: !!containerRef.current
      });
      return;
    }
    
    // Prevent duplicate initialization - if view already exists, don't create another
    if (sceneViewRef.current) {
      console.log('🔥 ShotHeatMapArcGIS: View already exists, skipping initialization');
      return;
    }

    // Try to load ArcGIS directly - if it fails, show error message
    const loadArcGIS = async () => {
      console.log('🔥 ShotHeatMapArcGIS: Starting ArcGIS load...');
      try {
        // Use standard dynamic imports - Vite will resolve these now that package is installed
        const [
          TileLayerModule,
          MapModule,
          SceneViewModule,
          ExtentModule,
          FeatureLayerModule,
          GraphicsLayerModule,
          PointModule,
          SimpleRendererModule,
          ExtrudeSymbol3DLayerModule,
          PolygonSymbol3DModule,
          SimpleMarkerSymbolModule
        ] = await Promise.all([
          import('@arcgis/core/layers/TileLayer'),
          import('@arcgis/core/Map'),
          import('@arcgis/core/views/SceneView'),
          import('@arcgis/core/geometry/Extent'),
          import('@arcgis/core/layers/FeatureLayer'),
          import('@arcgis/core/layers/GraphicsLayer'),
          import('@arcgis/core/geometry/Point'),
          import('@arcgis/core/renderers/SimpleRenderer'),
          import('@arcgis/core/symbols/ExtrudeSymbol3DLayer'),
          import('@arcgis/core/symbols/PolygonSymbol3D'),
          import('@arcgis/core/symbols/SimpleMarkerSymbol')
        ]);
        
        const TileLayer = TileLayerModule.default;
        const Map = MapModule.default;
        const SceneView = SceneViewModule.default;
        const Extent = ExtentModule.default;
        const FeatureLayer = FeatureLayerModule.default;
        const GraphicsLayer = GraphicsLayerModule.default;
        const Point = PointModule.default;
        const SimpleRenderer = SimpleRendererModule.default;
        const ExtrudeSymbol3DLayer = ExtrudeSymbol3DLayerModule.default;
        const PolygonSymbol3D = PolygonSymbol3DModule.default;
        const SimpleMarkerSymbol = SimpleMarkerSymbolModule.default;

        setPackageInstalled(true);
        console.log('🔥 ShotHeatMapArcGIS: ArcGIS modules loaded successfully');

        // Use the public basketball court tile service
        const basketballCourtMapServiceUrl = 'https://tiles.arcgis.com/tiles/g2TonOxuRkIqSOFx/arcgis/rest/services/Dark_Basketball_Court/MapServer';
        console.log('🔥 ShotHeatMapArcGIS: Creating tile layer from:', basketballCourtMapServiceUrl);
        
        const tileLayer = new TileLayer({
          url: basketballCourtMapServiceUrl
        });
        
        console.log('🔥 ShotHeatMapArcGIS: Tile layer created, waiting for load...');

        const map = new Map({
          layers: [tileLayer],
          basemap: null // No basemap, we'll set white background
        });

        // Create 3D SceneView
        const view = new SceneView({
          container: containerRef.current,
          map: map,
          viewingMode: 'local',
          camera: {
            position: {
              x: 0,
              y: 0,
              z: 750  // Height above court (in feet, matching reference example)
            },
            heading: 0,
            tilt: 45  // 45 degree angle for 3D view
          },
          environment: {
            atmosphere: null,
            starsEnabled: false
          },
          padding: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
          }
        });

        // Disable all navigation to lock the view
        view.navigation = {
          gamepad: { enabled: false },
          mouseWheelZoomEnabled: false,
          browserTouchPanEnabled: false,
          browserTouchZoomEnabled: false
        };
        
        // Disable pointer events for panning/zooming
        view.on('drag', (event) => {
          event.stopPropagation();
        });
        
        view.on('mouse-wheel', (event) => {
          event.stopPropagation();
        });

        // Set white background
        view.container.style.backgroundColor = 'white';
        
        // Hide attribution widget
        view.ui.components = [];
        
        // Also hide all ArcGIS UI elements via CSS after view is ready
        view.when(() => {
          // Hide all UI elements - search in container and parent
          const hideUIElements = () => {
            const selectors = [
              '.esri-ui',
              '.esri-ui-inner-container',
              '.esri-ui-corner-container',
              '.esri-ui-top-left',
              '.esri-ui-top-right',
              '.esri-ui-bottom-left',
              '.esri-ui-bottom-right',
              '.esri-ui-manual-container',
              '.esri-attribution',
              '.esri-view-user-storage',
              '[class*="esri-attribution"]',
              '[class*="esri-ui"]'
            ];
            
            // Search in view container
            if (view.container) {
              selectors.forEach(selector => {
                const elements = view.container.querySelectorAll(selector);
                elements.forEach(el => {
                  el.style.display = 'none';
                  el.style.visibility = 'hidden';
                });
              });
            }
            
            // Also search in parent container if it exists
            if (containerRef.current && containerRef.current.parentElement) {
              selectors.forEach(selector => {
                const elements = containerRef.current.parentElement.querySelectorAll(selector);
                elements.forEach(el => {
                  el.style.display = 'none';
                  el.style.visibility = 'hidden';
                });
              });
            }
          };
          
          // Hide immediately and after a short delay (in case elements are added asynchronously)
          hideUIElements();
          setTimeout(hideUIElements, 100);
          setTimeout(hideUIElements, 500);
          setTimeout(hideUIElements, 1000);
          
          // Watch for dynamically added UI elements
          const observer = new MutationObserver(() => {
            hideUIElements();
          });
          
          if (view.container) {
            observer.observe(view.container, { childList: true, subtree: true });
          }
          
          // Also observe the parent container
          if (containerRef.current && containerRef.current.parentElement) {
            observer.observe(containerRef.current.parentElement, { childList: true, subtree: true });
          }
        });
        
        // Wait for the tile layer to load, then set the extent to single half court
        tileLayer.when(() => {
          console.log('🔥 ShotHeatMapArcGIS: Tile layer loaded');
          if (tileLayer.fullExtent) {
            const fullExtent = tileLayer.fullExtent;
            console.log('🔥 ShotHeatMapArcGIS: Tile layer fullExtent:', fullExtent);
            
            // Calculate half court extent - show only one court with full width
            // For half court, we want the bottom half (basket at bottom)
            const courtWidth = fullExtent.xmax - fullExtent.xmin;
            const courtHeight = fullExtent.ymax - fullExtent.ymin;
            
            // Show full width of court, but only half height (bottom half where basket is)
            const halfCourtExtent = new Extent({
              xmin: fullExtent.xmin,  // Full width - start from left edge
              xmax: fullExtent.xmax,  // Full width - end at right edge
              ymin: fullExtent.ymin,  // Bottom (basket side)
              ymax: fullExtent.ymin + courtHeight / 2,  // Half height
              spatialReference: fullExtent.spatialReference
            });
            
            view.extent = halfCourtExtent;
            view.clippingArea = halfCourtExtent;
          }
        });
        
        // Also wait for view and tile layer to be ready, then add heat map
        console.log('🔥 ShotHeatMapArcGIS: Waiting for view and tile layer...');
        Promise.all([view.when(), tileLayer.when()]).then(() => {
          console.log('🔥 ShotHeatMapArcGIS: View and tile layer ready!');
          // View and tile layer are ready - ensure navigation stays disabled
          view.navigation.mouseWheelZoomEnabled = false;
          view.navigation.browserTouchPanEnabled = false;
          view.navigation.browserTouchZoomEnabled = false;
          
          // Store ArcGIS modules for reuse when season changes
          arcGISModulesRef.current = {
            map,
            tileLayer,
            FeatureLayer,
            SimpleRenderer,
            ExtrudeSymbol3DLayer,
            PolygonSymbol3D
          };
          console.log('🔥 ShotHeatMapArcGIS: ArcGIS modules stored in ref');
          
          // Create initial multi-season heat map after a short delay to ensure view is fully ready
          console.log('🔥 ShotHeatMapArcGIS: Scheduling initial multi-season heatmap creation...', {
            shotDataLength: shotData?.length || 0,
            selectedSeason
          });
          setTimeout(() => {
            console.log('🔥 ShotHeatMapArcGIS: Timeout fired, checking shotData...', {
              hasShotData: !!shotData,
              shotDataLength: shotData?.length || 0,
              shotDataSample: shotData?.slice(0, 3)
            });
            if (shotData && shotData.length > 0) {
              console.log('🔥 ShotHeatMapArcGIS: Calling createMultiSeasonHeatMapLayer...');
              createMultiSeasonHeatMapLayer(shotData, selectedSeason, map, FeatureLayer, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D, tileLayer, featureLayerRef, seasonStatisticsRef);
            } else {
              console.warn('🔥 ShotHeatMapArcGIS: No shot data available for initial render', {
                shotData,
                shotDataType: typeof shotData
              });
            }
          }, 500);
        }).catch((error) => {
          console.error('🔥 ShotHeatMapArcGIS: Error initializing view or tile layer:', error);
        });

        sceneViewRef.current = view;
      } catch (e) {
        console.error('ArcGIS load error:', e);
        setPackageInstalled(false);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; text-align: center; padding: 20px; background: white;">
              <div>
                <p style="margin-bottom: 10px; font-size: 16px; font-weight: 500;">ArcGIS package not installed</p>
                <p style="font-size: 14px; margin-bottom: 8px;">Please install the required package:</p>
                <code style="background: #f0f0f0; padding: 8px 12px; border-radius: 4px; display: inline-block; font-size: 13px;">npm install</code>
                <p style="font-size: 12px; margin-top: 10px; color: #999;">Error: ${e.message}</p>
              </div>
            </div>
          `;
        }
      }
    };

    loadArcGIS();
    
    // Cleanup function
    return () => {
      if (sceneViewRef.current) {
        sceneViewRef.current.destroy();
        sceneViewRef.current = null;
      }
      if (featureLayerRef.current) {
        featureLayerRef.current = null;
      }
      arcGISModulesRef.current = null;
    };
  }, [isVisible, shotData]);
  
  // Update renderer when season changes (layer is already created with all seasons)
  useEffect(() => {
    console.log('🔥 ShotHeatMapArcGIS: useEffect[selectedSeason] triggered', {
      selectedSeason,
      isVisible,
      hasFeatureLayer: !!featureLayerRef.current,
      hasStatistics: !!seasonStatisticsRef.current
    });
    
    // Only update renderer if layer already exists
    if (!isVisible || !featureLayerRef.current || !seasonStatisticsRef.current) {
      console.log('🔥 ShotHeatMapArcGIS: Skipping renderer update - layer not ready', {
        isVisible,
        hasFeatureLayer: !!featureLayerRef.current,
        hasStatistics: !!seasonStatisticsRef.current
      });
      return;
    }
    
    const { SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D } = arcGISModulesRef.current || {};
    
    if (!SimpleRenderer || !ExtrudeSymbol3DLayer || !PolygonSymbol3D) {
      console.log('🔥 ShotHeatMapArcGIS: Missing ArcGIS modules, waiting...');
      return;
    }
    
    console.log('🔥 ShotHeatMapArcGIS: Updating renderer for season change...');
    // Update renderer for new season (this will animate the columns)
    updateRendererForSeason(selectedSeason, featureLayerRef.current, seasonStatisticsRef, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D);
  }, [selectedSeason, isVisible]);
  

  // Helper function to match season strings (handles various formats)
  const matchSeason = (shotSeason, filterSeason) => {
    if (!filterSeason) return true;
    const shotSeasonStr = String(shotSeason || '').trim();
    const filterSeasonStr = String(filterSeason).trim();
    
    // Direct match
    if (shotSeasonStr === filterSeasonStr) return true;
    // Match first 4 digits (e.g., "2020-21" matches "2020")
    if (shotSeasonStr.substring(0, 4) === filterSeasonStr.substring(0, 4)) return true;
    // Match if season contains the filter year
    if (shotSeasonStr.includes(filterSeasonStr) || filterSeasonStr.includes(shotSeasonStr)) return true;
    return false;
  };

  // Helper function to create multi-season heat map layer from PRE-AGGREGATED grid data
  const createMultiSeasonHeatMapLayer = (gridCells, initialSeason, map, FeatureLayer, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D, tileLayer, featureLayerRef, seasonStatisticsRef) => {
    // Remove existing feature layer if it exists
    if (featureLayerRef.current) {
      map.remove(featureLayerRef.current);
      featureLayerRef.current = null;
    }
    
    if (!gridCells || gridCells.length === 0) {
      console.warn('ShotHeatMapArcGIS: No grid data provided');
      return;
    }
    
    console.log(`🔥 ShotHeatMapArcGIS: Creating multi-season heatmap from ${gridCells.length} pre-aggregated grid cells`);
    
    // Ensure tile layer is loaded before accessing fullExtent
    const processHeatMap = () => {
      const tileExtent = tileLayer.fullExtent;
      
      if (!tileExtent) {
        console.error('🔥 ShotHeatMapArcGIS: Tile layer extent not available, waiting...');
        tileLayer.when(() => {
          const extent = tileLayer.fullExtent;
          if (extent) {
            createMultiSeasonHeatMapLayer(gridCells, initialSeason, map, FeatureLayer, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D, tileLayer, featureLayerRef, seasonStatisticsRef);
          }
        });
        return;
      }
      
      const spatialRef = tileExtent.spatialReference || tileLayer.spatialReference || { wkid: 3857 };
      
      if (isNaN(tileExtent.xmin) || isNaN(tileExtent.xmax) || isNaN(tileExtent.ymin) || isNaN(tileExtent.ymax)) {
        console.error('🔥 ShotHeatMapArcGIS: Tile extent has invalid bounds:', tileExtent);
        return;
      }
      
      // Import Polygon for creating geometry objects
      import('@arcgis/core/geometry/Polygon').then(({ default: Polygon }) => {
        // Filter grid cells to half court only (valid coordinates)
        const validCells = gridCells.filter(cell => {
          const validCoords = !isNaN(cell.x) && !isNaN(cell.y) &&
            cell.x >= -25 && cell.x <= 25 &&
            cell.y >= 0 && cell.y <= 47 &&
            cell.count > 0;
          return validCoords;
        });
        
        console.log(`🔥 ShotHeatMapArcGIS: Filtered to ${validCells.length} valid grid cells (from ${gridCells.length} total)`);
        
        if (validCells.length === 0) {
          console.warn('ShotHeatMapArcGIS: No valid grid cells after filtering');
          return;
        }
        
        // Grid cells are already keyed by x,y coordinates - group by position and season
        // Structure: Map<binKey, Map<season, count>>
        const binData = new Map();
        const seasons = new Set();
        
        console.log('🔥 ShotHeatMapArcGIS: Processing pre-aggregated grid cells...');
        
        validCells.forEach(cell => {
          const seasonYear = String(cell.season || '').trim();
          if (seasonYear) {
            seasons.add(seasonYear);
          }
          
          // Use the x,y directly as the bin key (grid data is already binned)
          const binKey = `${cell.x},${cell.y}`;
          
          if (!binData.has(binKey)) {
            binData.set(binKey, new Map());
          }
          const binSeasons = binData.get(binKey);
          
          // Use the count directly from pre-aggregated data
          const currentCount = binSeasons.get(seasonYear) || 0;
          binSeasons.set(seasonYear, currentCount + cell.count);
        });
        
        console.log(`🔥 ShotHeatMapArcGIS: Processing complete. Found ${binData.size} unique positions across ${seasons.size} seasons`);
        console.log(`🔥 Seasons found:`, Array.from(seasons).sort());
        
        // Calculate tile dimensions
        const tileWidth = tileExtent.xmax - tileExtent.xmin;
        const tileHeight = tileExtent.ymax - tileExtent.ymin;
        const halfTileHeight = tileHeight / 2;
        
        // Transform corner helper
        const transformCorner = (courtX, courtY) => {
          const normalizedX = (courtX + 25) / 50;
          const normalizedY = courtY / 47;
          const tileX = tileExtent.xmin + normalizedX * tileWidth;
          const tileY = tileExtent.ymin + normalizedY * halfTileHeight;
          return [tileX, tileY];
        };
        
        // Define all seasons list (2004-2024)
        const allSeasonsList = Array.from({ length: 21 }, (_, i) => String(2004 + i));
        
        // Normalize initialSeason to 4-digit year format to match binSeasons keys
        const initialSeasonYear = String(initialSeason || '').trim().substring(0, 4);
        
        // Calculate volume threshold for filtering low-volume bins (percentile-based)
        const VOLUME_THRESHOLD_PERCENTILE = 0.25; // Only show bins above 25th percentile
        const initialSeasonCounts = Array.from(binData.values())
          .map(binSeasons => {
            // Try both the normalized year and the original initialSeason format
            return binSeasons.get(initialSeasonYear) || binSeasons.get(initialSeason) || 0;
          })
          .filter(c => c > 0)
          .sort((a, b) => a - b);
        
        const volumeThreshold = initialSeasonCounts.length > 0
          ? initialSeasonCounts[Math.floor(initialSeasonCounts.length * VOLUME_THRESHOLD_PERCENTILE)]
          : 0;
        
        const filteredOutCount = initialSeasonCounts.filter(c => c < volumeThreshold).length;
        console.log(`🔥 ShotHeatMapArcGIS: Volume filtering - threshold = ${volumeThreshold.toFixed(2)} (${(VOLUME_THRESHOLD_PERCENTILE * 100)}th percentile), filtering out ${filteredOutCount} low-volume bins out of ${initialSeasonCounts.length} total bins with data`);
        
        // Create polygon features for non-empty bins with all season attributes
        const featuresWithAllSeasons = [];
        let newFid = 1;
        
        binData.forEach((binSeasons, binKey) => {
          if (binSeasons.size === 0) return;
          
          // Filter: only include bins with count above threshold for initial season
          const initialSeasonCount = binSeasons.get(initialSeasonYear) || binSeasons.get(initialSeason) || 0;
          if (initialSeasonCount < volumeThreshold) {
            return; // Skip low-volume bins
          }
          
          // Grid data uses actual court coordinates (e.g., x=-1, y=17)
          // Create a 1x1 foot square around each point
          const [cellX, cellY] = binKey.split(',').map(Number);
          
          // Create bin boundaries as a 1-foot square around the coordinate
          const binXMin = cellX - 0.5;
          const binXMax = cellX + 0.5;
          const binYMin = cellY - 0.5;
          const binYMax = cellY + 0.5;
          
          // Create corners and transform
          const corner0 = [binXMin, binYMin];
          const corner1 = [binXMax, binYMin];
          const corner2 = [binXMax, binYMax];
          const corner3 = [binXMin, binYMax];
          
          const tileCorner0 = transformCorner(corner0[0], corner0[1]);
          const tileCorner1 = transformCorner(corner1[0], corner1[1]);
          const tileCorner2 = transformCorner(corner2[0], corner2[1]);
          const tileCorner3 = transformCorner(corner3[0], corner3[1]);
          
          const allTileCorners = [tileCorner0, tileCorner1, tileCorner2, tileCorner3];
          const uniqueTilePoints = new Set(allTileCorners.map(p => `${p[0]},${p[1]}`));
          if (uniqueTilePoints.size < 3) return;
          
          const closedRing = [tileCorner0, tileCorner1, tileCorner2, tileCorner3, tileCorner0];
          const polygon = new Polygon({
            rings: [closedRing],
            spatialReference: spatialRef
          });
          
          // Build attributes with all seasons
          const attributes = { FID: newFid++ };
          allSeasonsList.forEach(seasonYear => {
            attributes[`Weighted_Count_${seasonYear}`] = binSeasons.get(seasonYear) || 0;
          });
          // Use normalized season key to match binSeasons map keys
          attributes.Weighted_Count_Current = binSeasons.get(initialSeasonYear) || binSeasons.get(initialSeason) || 0;
          
          featuresWithAllSeasons.push({
            geometry: polygon,
            attributes: attributes
          });
        });
        
        // Pre-calculate statistics for each season
        const stats = {};
        allSeasonsList.forEach(seasonYear => {
          const fieldName = `Weighted_Count_${seasonYear}`;
          const counts = featuresWithAllSeasons
            .map(f => f.attributes[fieldName] || 0)
            .filter(c => c > 0); // Only non-zero counts
          
          if (counts.length > 0) {
            const sortedCounts = [...counts].sort((a, b) => a - b);
            const minCount = sortedCounts[0];
            const maxCount = sortedCounts[sortedCounts.length - 1];
            const p10 = sortedCounts[Math.floor(sortedCounts.length * 0.1)] || minCount;
            const p25 = sortedCounts[Math.floor(sortedCounts.length * 0.25)] || minCount;
            const p50 = sortedCounts[Math.floor(sortedCounts.length * 0.5)] || minCount;
            const p75 = sortedCounts[Math.floor(sortedCounts.length * 0.75)] || minCount;
            const p90 = sortedCounts[Math.floor(sortedCounts.length * 0.9)] || minCount;
            
            stats[seasonYear] = { minCount, maxCount, p10, p25, p50, p75, p90 };
          } else {
            stats[seasonYear] = { minCount: 0, maxCount: 0, p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 };
          }
        });
        
        seasonStatisticsRef.current = stats;
        console.log('🔥 ShotHeatMapArcGIS: Pre-calculated statistics for all seasons');
        
        // Create initial renderer for initial season
        const initialStats = stats[initialSeason] || stats['2004'];
        const renderer = createRendererForSeason(initialSeason, initialStats, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D);
        
        // Build fields array for FeatureLayer
        const fields = [
          { name: 'FID', type: 'oid' },
          { name: 'Weighted_Count_Current', type: 'double' }
        ];
        allSeasonsList.forEach(seasonYear => {
          fields.push({ name: `Weighted_Count_${seasonYear}`, type: 'double' });
        });
        
        // Create FeatureLayer
        const featureLayer = new FeatureLayer({
          source: featuresWithAllSeasons,
          fields: fields,
          objectIdField: 'FID',
          geometryType: 'polygon',
          spatialReference: spatialRef,
          renderer: renderer
        });
        
        console.log('🔥 ShotHeatMapArcGIS: FeatureLayer created with multi-season attributes');
        
        featureLayer.when(() => {
          console.log('🔥 ShotHeatMapArcGIS: ✅ Multi-season feature layer added successfully!');
        }).catch((error) => {
          console.error('🔥 ShotHeatMapArcGIS: ❌ Error adding feature layer:', error);
        });
        
        map.add(featureLayer);
        featureLayerRef.current = featureLayer;
      }).catch((error) => {
        console.error('ShotHeatMapArcGIS: Error loading Polygon module:', error);
      });
    };
    
    if (tileLayer.fullExtent) {
      processHeatMap();
    } else {
      tileLayer.when(() => {
        processHeatMap();
      }).catch((error) => {
        console.error('ShotHeatMapArcGIS: Error waiting for tile layer:', error);
      });
    }
  };

  // Helper function to create renderer for a specific season
  const createRendererForSeason = (seasonYear, stats, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D) => {
    const { minCount, maxCount, p10, p25, p50, p75, p90 } = stats;
    
    const MAX_HEIGHT = 120;
    const MIN_HEIGHT = MAX_HEIGHT * 0.1;
    
    const sizeStops = [
      { value: minCount, size: MIN_HEIGHT },
      { value: Math.max(minCount + 1, p10), size: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * 0.2 },
      { value: Math.max(minCount + 1, p25), size: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * 0.4 },
      { value: Math.max(minCount + 1, p50), size: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * 0.6 },
      { value: Math.max(minCount + 1, p75), size: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * 0.8 },
      { value: maxCount, size: MAX_HEIGHT }
    ];
    
    const colorStops = [
      { value: minCount, color: [212, 227, 245, 255] },
      { value: Math.max(minCount + 1, p25), color: [133, 154, 250, 255] },
      { value: Math.max(minCount + 1, p50), color: [62, 90, 253, 255] },
      { value: Math.max(minCount + 1, p75), color: [132, 149, 122, 255] },
      { value: Math.max(minCount + 1, p90), color: [234, 179, 8, 255] },
      { value: maxCount, color: [255, 255, 0, 255] }
    ];
    
    return new SimpleRenderer({
      symbol: new PolygonSymbol3D({
        symbolLayers: [new ExtrudeSymbol3DLayer()]
      }),
      visualVariables: [
        {
          type: 'size',
          field: 'Weighted_Count_Current',
          stops: sizeStops
        },
        {
          type: 'color',
          field: 'Weighted_Count_Current',
          stops: colorStops
        }
      ]
    });
  };

  // Helper function to update renderer when season changes
  const updateRendererForSeason = (seasonYear, featureLayer, seasonStatisticsRef, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D) => {
    if (!featureLayer || !seasonStatisticsRef.current) {
      console.warn('🔥 ShotHeatMapArcGIS: Cannot update renderer - missing featureLayer or statistics');
      return;
    }
    
    const stats = seasonStatisticsRef.current[seasonYear];
    if (!stats) {
      console.warn(`🔥 ShotHeatMapArcGIS: No statistics found for season ${seasonYear}`);
      return;
    }
    
    console.log(`🔥 ShotHeatMapArcGIS: Updating renderer for season ${seasonYear}`);
    
    // Update Weighted_Count_Current for all features using applyEdits for smooth animation
    featureLayer.queryFeatures().then((result) => {
      const features = result.features;
      const seasonField = `Weighted_Count_${seasonYear}`;
      
      // Update attributes
      const featuresToUpdate = features.map(feature => {
        const seasonValue = feature.attributes[seasonField] || 0;
        return {
          ...feature,
          attributes: {
            ...feature.attributes,
            Weighted_Count_Current: seasonValue
          }
        };
      });
      
      // Update features and renderer
      featureLayer.applyEdits({
        updateFeatures: featuresToUpdate
      }).then(() => {
        // Create new renderer with updated statistics for this season
        const newRenderer = createRendererForSeason(seasonYear, stats, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D);
        featureLayer.renderer = newRenderer;
        console.log(`🔥 ShotHeatMapArcGIS: ✅ Renderer updated for season ${seasonYear}`);
      }).catch((error) => {
        console.error('🔥 ShotHeatMapArcGIS: Error updating features:', error);
      });
    }).catch((error) => {
      console.error('🔥 ShotHeatMapArcGIS: Error querying features:', error);
    });
  };

  // OLD Helper function to create 3D rectangular heat map layer using FeatureLayer (DEPRECATED - kept for reference)
  const createHeatMapLayer = (shots, filterSeason, map, FeatureLayer, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D, tileLayer, featureLayerRef) => {
    // Remove existing feature layer if it exists
    if (featureLayerRef.current) {
      map.remove(featureLayerRef.current);
      featureLayerRef.current = null;
    }
    
    if (!shots || shots.length === 0) {
      console.warn('ShotHeatMapArcGIS: No shot data provided');
      return;
    }
    
    console.log(`ShotHeatMapArcGIS: Creating heatmap for season ${filterSeason} with ${shots.length} total shots`);
    
    // Ensure tile layer is loaded before accessing fullExtent
    const processHeatMap = () => {
      // Get tile layer extent and spatial reference
      // CRITICAL: Ensure tile extent is fully loaded and valid
      const tileExtent = tileLayer.fullExtent;
      
      if (!tileExtent) {
        console.error('🔥 ShotHeatMapArcGIS: Tile layer extent not available, waiting...');
        // Wait for tile layer to fully load
        tileLayer.when(() => {
          const extent = tileLayer.fullExtent;
          if (extent) {
            createHeatMapLayer(shots, filterSeason, map, FeatureLayer, SimpleRenderer, ExtrudeSymbol3DLayer, PolygonSymbol3D, tileLayer, featureLayerRef);
          }
        });
        return;
      }
      
      // CRITICAL: Get spatial reference from extent (most reliable)
      const spatialRef = tileExtent.spatialReference || tileLayer.spatialReference || { wkid: 3857 };
      
      // VALIDATION: Ensure extent has valid bounds
      if (isNaN(tileExtent.xmin) || isNaN(tileExtent.xmax) || isNaN(tileExtent.ymin) || isNaN(tileExtent.ymax)) {
        console.error('🔥 ShotHeatMapArcGIS: Tile extent has invalid bounds:', tileExtent);
        return;
      }
      
      console.log('🔥 ShotHeatMapArcGIS: Tile extent validated', {
        xmin: tileExtent.xmin,
        xmax: tileExtent.xmax,
        ymin: tileExtent.ymin,
        ymax: tileExtent.ymax,
        width: tileExtent.xmax - tileExtent.xmin,
        height: tileExtent.ymax - tileExtent.ymin,
        spatialRef: spatialRef.wkid || spatialRef
      });
      
      // Import Polygon for creating geometry objects
      import('@arcgis/core/geometry/Polygon').then(({ default: Polygon }) => {
        // Filter shots by season and half court (LOC_Y <= 47)
      // Do NOT filter by EVENT_TYPE - include all shots
      console.log('🔥 ShotHeatMapArcGIS: Filtering shots...', {
        totalShots: shots.length,
        filterSeason,
        sampleShot: shots[0]
      });
      
      const filteredShots = shots.filter(shot => {
        // Filter by season (handle both string and number formats, with fallback)
        // Try multiple matching strategies to handle different CSV formats
        let seasonMatch = false;
        if (!filterSeason) {
          seasonMatch = true;
        } else {
          const shotSeasonStr = String(shot.season || '').trim();
          const filterSeasonStr = String(filterSeason).trim();
          
          // Direct match
          if (shotSeasonStr === filterSeasonStr) {
            seasonMatch = true;
          }
          // Match first 4 digits (e.g., "2020-21" matches "2020")
          else if (shotSeasonStr.substring(0, 4) === filterSeasonStr.substring(0, 4)) {
            seasonMatch = true;
          }
          // Match if season contains the filter year
          else if (shotSeasonStr.includes(filterSeasonStr) || filterSeasonStr.includes(shotSeasonStr)) {
            seasonMatch = true;
          }
        }
        
        // Filter to half court only (LOC_Y must be between 0 and 47)
        // Ignore full-court shots, heaves, and negative Y
        const halfCourt = shot.y >= 0 && shot.y <= 47;
        
        // Filter valid coordinates
        const validCoords = !isNaN(shot.x) && !isNaN(shot.y) &&
          shot.x >= -25 && shot.x <= 25 &&
          shot.y >= 0 && shot.y <= 47;
        
        return seasonMatch && halfCourt && validCoords;
      });
      
      console.log('🔥 ShotHeatMapArcGIS: Filtering complete', {
        filteredCount: filteredShots.length,
        sampleFiltered: filteredShots[0]
      });
      
      // CRITICAL VALIDATION: For seasons 2020-2022, log coordinate ranges
      if (filterSeason && (filterSeason === '2020' || filterSeason === '2021' || filterSeason === '2022')) {
        if (filteredShots.length > 0) {
          // Use reduce instead of spread operator to avoid stack overflow with large arrays
          const xValues = filteredShots.map(s => s.x).filter(x => !isNaN(x));
          const yValues = filteredShots.map(s => s.y).filter(y => !isNaN(y));
          const minX = xValues.reduce((min, val) => val < min ? val : min, xValues[0] || 0);
          const maxX = xValues.reduce((max, val) => val > max ? val : max, xValues[0] || 0);
          const minY = yValues.reduce((min, val) => val < min ? val : min, yValues[0] || 0);
          const maxY = yValues.reduce((max, val) => val > max ? val : max, yValues[0] || 0);
          console.log(`🔥 CRITICAL DEBUG Season ${filterSeason}:`, {
            shotCount: filteredShots.length,
            xRange: { min: minX, max: maxX, span: maxX - minX },
            yRange: { min: minY, max: maxY, span: maxY - minY },
            sampleShots: filteredShots.slice(0, 5).map(s => ({ x: s.x, y: s.y }))
          });
        } else {
          console.warn(`🔥 CRITICAL DEBUG Season ${filterSeason}: No filtered shots!`);
        }
      }
      
      if (filteredShots.length === 0) {
        console.warn(`ShotHeatMapArcGIS: No filtered shots for season ${filterSeason}`);
        return;
      }
      
      console.log(`ShotHeatMapArcGIS: Filtered to ${filteredShots.length} shots for season ${filterSeason}`);
      
      // Define rectangular grid parameters
      // Court space: X [-25, +25], Y [0, 47]
      const COURT_X_MIN = -25;
      const COURT_X_MAX = 25;
      const COURT_Y_MIN = 0;
      const COURT_Y_MAX = 47;
      
      // Grid resolution: Higher resolution for smaller columns
      // ~1 foot per bin for finer detail
      const BINS_X = 50; // 50 feet / 50 bins = 1.0 feet per bin
      const BINS_Y = 47; // 47 feet / 47 bins = 1.0 feet per bin
      
      const BIN_WIDTH = (COURT_X_MAX - COURT_X_MIN) / BINS_X; // 1.0 feet
      const BIN_HEIGHT = (COURT_Y_MAX - COURT_Y_MIN) / BINS_Y; // 1.0 feet
      
      // Create bin grid and count shots per bin with weighted counts
      // Store both raw count and weighted count (3PT = 1.5, 2PT = 1.0)
      const binData = new Map(); // Map<binKey, { pointCount: number, weightedPointCount: number }>
      console.log('🔥 ShotHeatMapArcGIS: Starting binning process...', {
        binCounts: `${BINS_X}x${BINS_Y}`,
        binWidth: BIN_WIDTH,
        binHeight: BIN_HEIGHT
      });
      
      filteredShots.forEach(shot => {
        // Calculate which bin this shot belongs to
        // Use floor to determine bin index
        let binX = Math.floor((shot.x - COURT_X_MIN) / BIN_WIDTH);
        let binY = Math.floor((shot.y - COURT_Y_MIN) / BIN_HEIGHT);
        
        // Handle edge cases: shots exactly at boundaries
        // If shot is at max boundary (x=25 or y=47), place in last bin
        if (shot.x >= COURT_X_MAX) binX = BINS_X - 1;
        if (shot.y >= COURT_Y_MAX) binY = BINS_Y - 1;
        
        // Clamp to valid bin indices
        if (binX >= BINS_X) binX = BINS_X - 1;
        if (binY >= BINS_Y) binY = BINS_Y - 1;
        if (binX < 0) binX = 0;
        if (binY < 0) binY = 0;
        
        const binKey = `${binX},${binY}`;
        
        // Get or create bin data
        const bin = binData.get(binKey) || { pointCount: 0, weightedPointCount: 0 };
        
        // Increment raw count
        bin.pointCount += 1;
        
        // Increment weighted count: 3PT = 1.5, 2PT = 1.0
        const weight = shot.isThreePoint ? 1.5 : 1.0;
        bin.weightedPointCount += weight;
        
        binData.set(binKey, bin);
      });
      
      console.log('🔥 ShotHeatMapArcGIS: Binning complete', {
        totalBins: binData.size,
        sampleBins: Array.from(binData.entries()).slice(0, 5).map(([key, data]) => [key, data])
      });
      
      // Create polygon features for non-empty bins
      const transformedFeatures = [];
      let fid = 1;
      console.log('🔥 ShotHeatMapArcGIS: Creating polygon features...');
      
      // CRITICAL: Calculate tile dimensions ONCE and reuse (prevents recalculation issues)
      const tileWidth = tileExtent.xmax - tileExtent.xmin;
      const tileHeight = tileExtent.ymax - tileExtent.ymin;
      const halfTileHeight = tileHeight / 2; // Calculate once to prevent double-halving
      
      console.log('🔥 ShotHeatMapArcGIS: Tile extent dimensions', {
        tileWidth,
        tileHeight,
        halfTileHeight,
        xmin: tileExtent.xmin,
        xmax: tileExtent.xmax,
        ymin: tileExtent.ymin,
        ymax: tileExtent.ymax,
        spatialRef: spatialRef.wkid || spatialRef
      });
      
      // VALIDATION: Verify transformation formula with test points
      const testPoints = [
        { courtX: -25, courtY: 0, desc: 'Basket (left edge)' },
        { courtX: 0, courtY: 0, desc: 'Basket (center)' },
        { courtX: 25, courtY: 0, desc: 'Basket (right edge)' },
        { courtX: -25, courtY: 47, desc: 'Top-left corner' },
        { courtX: 25, courtY: 47, desc: 'Top-right corner' }
      ];
      const testPointResults = testPoints.map(tp => {
        const normX = (tp.courtX + 25) / 50;
        const normY = tp.courtY / 47;
        const tileX = tileExtent.xmin + normX * tileWidth;
        const tileY = tileExtent.ymin + normY * halfTileHeight;
        return {
          description: tp.desc,
          court: `[${tp.courtX}, ${tp.courtY}]`,
          normalized: `[${normX.toFixed(4)}, ${normY.toFixed(4)}]`,
          tile: `[${tileX.toFixed(2)}, ${tileY.toFixed(2)}]`
        };
      });
      console.log('🔥 ShotHeatMapArcGIS: Transformation validation (test points):');
      testPointResults.forEach(tp => {
        console.log(`  ${tp.description}: court=${tp.court}, normalized=${tp.normalized}, tile=${tp.tile}`);
      });
      // CRITICAL: Also log raw values for first test point to verify formula
      const firstTest = testPoints[1]; // Basket center (0,0)
      const testNormX = (firstTest.courtX + 25) / 50;
      const testNormY = firstTest.courtY / 47;
      const testTileX = tileExtent.xmin + testNormX * tileWidth;
      const testTileY = tileExtent.ymin + testNormY * halfTileHeight;
      console.log(`🔥 TEST: Basket center (0,0) -> normalized(${testNormX}, ${testNormY}) -> tile(${testTileX}, ${testTileY})`);
      
      let debugBinCount = 0;
      const debugBins = []; // For 2020-2022 validation
      
      binData.forEach((binInfo, binKey) => {
        // CRITICAL: Skip empty bins (no geometry needed)
        if (binInfo.pointCount === 0) {
          return;
        }
        
        const [binX, binY] = binKey.split(',').map(Number);
        
        // Calculate bin boundaries in court space (FOUR CORNERS, not center)
        // Ensure last bins extend to exact boundaries
        const binXMin = COURT_X_MIN + binX * BIN_WIDTH;
        const binXMax = binX === BINS_X - 1 ? COURT_X_MAX : COURT_X_MIN + (binX + 1) * BIN_WIDTH;
        const binYMin = COURT_Y_MIN + binY * BIN_HEIGHT;
        const binYMax = binY === BINS_Y - 1 ? COURT_Y_MAX : COURT_Y_MIN + (binY + 1) * BIN_HEIGHT;
        
        // CRITICAL: Create FOUR CORNERS in court space (FRESH array for each bin)
        // Order: Bottom-left, Bottom-right, Top-right, Top-left (counter-clockwise)
        const corner0 = [binXMin, binYMin]; // Bottom-left
        const corner1 = [binXMax, binYMin]; // Bottom-right
        const corner2 = [binXMax, binYMax]; // Top-right
        const corner3 = [binXMin, binYMax];  // Top-left
        
        // CRITICAL: Transform EACH CORNER independently to tile space
        // Use EXACT transformation formula with NO mutations
        const transformCorner = (courtX, courtY) => {
          // STEP 1: Normalize in COURT SPACE (LOCKED FORMULA)
          const normalizedX = (courtX + 25) / 50;
          const normalizedY = courtY / 47;
          
          // STEP 2: Map to TILE SPACE (NO DOUBLE HALVING, NO CLAMPING)
          const tileX = tileExtent.xmin + normalizedX * tileWidth;
          const tileY = tileExtent.ymin + normalizedY * halfTileHeight;
          
          return [tileX, tileY];
        };
        
        // Transform all four corners (FRESH arrays, no reuse)
        const tileCorner0 = transformCorner(corner0[0], corner0[1]);
        const tileCorner1 = transformCorner(corner1[0], corner1[1]);
        const tileCorner2 = transformCorner(corner2[0], corner2[1]);
        const tileCorner3 = transformCorner(corner3[0], corner3[1]);
        
        // DEBUG: Log first 5 bins for ALL seasons to verify transformation
        if (debugBinCount < 5) {
          // Calculate normalized values explicitly for logging
          const normBL = [(corner0[0] + 25) / 50, corner0[1] / 47];
          const normBR = [(corner1[0] + 25) / 50, corner1[1] / 47];
          const normTR = [(corner2[0] + 25) / 50, corner2[1] / 47];
          const normTL = [(corner3[0] + 25) / 50, corner3[1] / 47];
          
          console.log(`🔥 DEBUG Bin ${binKey} (season ${filterSeason}):`);
          console.log(`  Court corners: BL=[${corner0[0]}, ${corner0[1]}], BR=[${corner1[0]}, ${corner1[1]}], TR=[${corner2[0]}, ${corner2[1]}], TL=[${corner3[0]}, ${corner3[1]}]`);
          console.log(`  Normalized: BL=[${normBL[0].toFixed(4)}, ${normBL[1].toFixed(4)}], BR=[${normBR[0].toFixed(4)}, ${normBR[1].toFixed(4)}], TR=[${normTR[0].toFixed(4)}, ${normTR[1].toFixed(4)}], TL=[${normTL[0].toFixed(4)}, ${normTL[1].toFixed(4)}]`);
          console.log(`  Tile corners: BL=[${tileCorner0[0].toFixed(2)}, ${tileCorner0[1].toFixed(2)}], BR=[${tileCorner1[0].toFixed(2)}, ${tileCorner1[1].toFixed(2)}], TR=[${tileCorner2[0].toFixed(2)}, ${tileCorner2[1].toFixed(2)}], TL=[${tileCorner3[0].toFixed(2)}, ${tileCorner3[1].toFixed(2)}]`);
          console.log(`  Tile extent: xmin=${tileExtent.xmin}, xmax=${tileExtent.xmax}, ymin=${tileExtent.ymin}, ymax=${tileExtent.ymax}, width=${tileWidth}, halfHeight=${halfTileHeight}`);
          // CRITICAL: Check if all tile corners are the same (collapse indicator)
          const allSameX = tileCorner0[0] === tileCorner1[0] && tileCorner1[0] === tileCorner2[0] && tileCorner2[0] === tileCorner3[0];
          const allSameY = tileCorner0[1] === tileCorner1[1] && tileCorner1[1] === tileCorner2[1] && tileCorner2[1] === tileCorner3[1];
          if (allSameX || allSameY) {
            console.error(`  ⚠️ COLLAPSE DETECTED: All corners have same ${allSameX ? 'X' : 'Y'} coordinate!`);
          }
          debugBinCount++;
        }
        
        // SAFETY CHECK: Verify corners are distinct
        const allTileCorners = [tileCorner0, tileCorner1, tileCorner2, tileCorner3];
        const uniqueTilePoints = new Set(allTileCorners.map(p => `${p[0]},${p[1]}`));
        if (uniqueTilePoints.size < 3) {
          console.warn(`🔥 Skipping collapsed bin ${binKey}: only ${uniqueTilePoints.size} unique tile points`, {
            allTileCorners,
            courtCorners: [corner0, corner1, corner2, corner3]
          });
          return; // Skip this bin
        }
        
        // CRITICAL: Create closed ring (FRESH array, close polygon properly)
        // Order: Bottom-left → Bottom-right → Top-right → Top-left → Bottom-left (close)
        const closedRing = [
          tileCorner0,  // Bottom-left
          tileCorner1,  // Bottom-right
          tileCorner2,  // Top-right
          tileCorner3,  // Top-left
          tileCorner0   // Close: back to bottom-left
        ];
        
        // CRITICAL: Create NEW Polygon instance for EACH bin (NO REUSE)
        // Ensure spatialReference matches tileLayer exactly
        const polygon = new Polygon({
          rings: [closedRing], // Single ring (rectangle)
          spatialReference: spatialRef // MUST match tileLayer spatialReference
        });
        
        transformedFeatures.push({
          geometry: polygon,
          attributes: {
            Point_Count: binInfo.pointCount, // Raw count for reference
            Weighted_Point_Count: binInfo.weightedPointCount, // Weighted count for rendering
            FID: fid++
          }
        });
      });
      
      // CRITICAL DEBUG: Log transformed bins for 2020-2022
      if (filterSeason && (filterSeason === '2020' || filterSeason === '2021' || filterSeason === '2022') && debugBins.length > 0) {
        console.log(`🔥 CRITICAL DEBUG Season ${filterSeason} - First 5 transformed bins:`, debugBins);
      }
      
      if (transformedFeatures.length === 0) {
        console.warn('ShotHeatMapArcGIS: No features created after binning');
        return;
      }
      
      console.log(`ShotHeatMapArcGIS: Created ${transformedFeatures.length} features`);
      
      // CRITICAL DEBUG: Log actual geometry coordinates for first 3 features
      console.log('🔥 CRITICAL DEBUG: Sample feature geometries:');
      transformedFeatures.slice(0, 3).forEach((f, idx) => {
        const geom = f.geometry;
        const rings = geom.rings || [];
        const firstRing = rings[0] || [];
        console.log(`  Feature ${idx}: pointCount=${f.attributes.Point_Count}, weightedCount=${f.attributes.Weighted_Point_Count}`);
        console.log(`    First ring (first 5 points):`);
        firstRing.slice(0, 5).forEach((p, pIdx) => {
          console.log(`      Point ${pIdx}: [${p[0].toFixed(2)}, ${p[1].toFixed(2)}]`);
        });
        console.log(`    SpatialRef: ${geom.spatialReference?.wkid || JSON.stringify(geom.spatialReference)}`);
      });
      
      // CRITICAL: Check if all features have the same coordinates (collapse indicator)
      if (transformedFeatures.length > 1) {
        const firstFeature = transformedFeatures[0];
        const firstRing = firstFeature.geometry.rings?.[0] || [];
        const firstPoint = firstRing[0] || [];
        const allSame = transformedFeatures.slice(1, 4).every(f => {
          const ring = f.geometry.rings?.[0] || [];
          const point = ring[0] || [];
          return point[0] === firstPoint[0] && point[1] === firstPoint[1];
        });
        if (allSame) {
          console.error(`  ⚠️ COLLAPSE DETECTED: First 3 features all have same first point: [${firstPoint[0]}, ${firstPoint[1]}]`);
        } else {
          console.log(`  ✅ Coordinates vary: First feature starts at [${firstPoint[0]}, ${firstPoint[1]}]`);
        }
        
        // CRITICAL: Calculate coordinate ranges across ALL features
        const allXValues = [];
        const allYValues = [];
        transformedFeatures.forEach(f => {
          const ring = f.geometry.rings?.[0] || [];
          ring.forEach(p => {
            if (p && p.length >= 2) {
              allXValues.push(p[0]);
              allYValues.push(p[1]);
            }
          });
        });
        
        if (allXValues.length > 0 && allYValues.length > 0) {
          const minX = allXValues.reduce((min, val) => val < min ? val : min, allXValues[0]);
          const maxX = allXValues.reduce((max, val) => val > max ? val : max, allXValues[0]);
          const minY = allYValues.reduce((min, val) => val < min ? val : min, allYValues[0]);
          const maxY = allYValues.reduce((max, val) => val > max ? val : max, allYValues[0]);
          
          console.log(`🔥 COORDINATE RANGES (all features): X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
          
          if (maxX - minX < 1 || maxY - minY < 1) {
            console.error(`  ⚠️ CRITICAL: All coordinates are within 1 unit! This indicates a collapse.`);
          }
        }
      }
      
      // Calculate min/max Weighted_Point_Count for proper scaling (use weighted count, not raw)
      const weightedCounts = transformedFeatures.map(f => f.attributes.Weighted_Point_Count || 0);
      // Use reduce to avoid stack overflow with large arrays
      const minCount = weightedCounts.length > 0 
        ? weightedCounts.reduce((min, val) => val < min ? val : min, weightedCounts[0])
        : 0;
      const maxCount = weightedCounts.length > 0
        ? weightedCounts.reduce((max, val) => val > max ? val : max, weightedCounts[0])
        : 0;
      
      console.log('🔥 ShotHeatMapArcGIS: Weighted point count statistics', {
        minCount,
        maxCount,
        featureCount: transformedFeatures.length
      });
      
      // Calculate percentiles for better distribution (using weighted counts)
      const sortedCounts = [...weightedCounts].sort((a, b) => a - b);
      const p10 = sortedCounts[Math.floor(sortedCounts.length * 0.1)] || minCount;
      const p25 = sortedCounts[Math.floor(sortedCounts.length * 0.25)] || minCount;
      const p50 = sortedCounts[Math.floor(sortedCounts.length * 0.5)] || minCount;
      const p75 = sortedCounts[Math.floor(sortedCounts.length * 0.75)] || minCount;
      const p90 = sortedCounts[Math.floor(sortedCounts.length * 0.9)] || minCount;
      
      console.log('🔥 ShotHeatMapArcGIS: Percentiles calculated (weighted)', { p10, p25, p50, p75, p90 });
      
      // Define min and max heights (in feet)
      const MAX_HEIGHT = 120; // Maximum height cap
      const MIN_HEIGHT = MAX_HEIGHT * 0.1; // 10% of maximum height (12 feet)
      
      // Calculate stops based on percentiles
      const sizeStops = [
        { value: minCount, size: MIN_HEIGHT },
        { value: Math.max(minCount + 1, p10), size: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * 0.2 },
        { value: Math.max(minCount + 1, p25), size: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * 0.4 },
        { value: Math.max(minCount + 1, p50), size: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * 0.6 },
        { value: Math.max(minCount + 1, p75), size: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * 0.8 },
        { value: maxCount, size: MAX_HEIGHT }
      ];
      
      // Color stops - blue (low) to yellow (high) gradient
      const colorStops = [
        { value: minCount, color: [212, 227, 245, 255] }, // Light blue (low density)
        { value: Math.max(minCount + 1, p25), color: [133, 154, 250, 255] }, // Blue
        { value: Math.max(minCount + 1, p50), color: [62, 90, 253, 255] }, // Darker blue
        { value: Math.max(minCount + 1, p75), color: [132, 149, 122, 255] }, // Green
        { value: Math.max(minCount + 1, p90), color: [234, 179, 8, 255] }, // Yellow
        { value: maxCount, color: [255, 255, 0, 255] } // Bright yellow (high density)
      ];
      
      // Create SimpleRenderer with dynamic visual variables
      const renderer = new SimpleRenderer({
        symbol: new PolygonSymbol3D({
          symbolLayers: [new ExtrudeSymbol3DLayer()]
        }),
        visualVariables: [
          {
            type: 'size',
            field: 'Weighted_Point_Count', // Use weighted count for height
            stops: sizeStops
          },
          {
            type: 'color',
            field: 'Weighted_Point_Count', // Use weighted count for color
            stops: colorStops
          }
        ]
      });
      
      // Create FeatureLayer from transformed features
      console.log('🔥 ShotHeatMapArcGIS: Creating FeatureLayer...', {
        featureCount: transformedFeatures.length,
        spatialRef
      });
      
      const featureLayer = new FeatureLayer({
        source: transformedFeatures,
        fields: [
          { name: 'Point_Count', type: 'integer' }, // Raw count for reference
          { name: 'Weighted_Point_Count', type: 'double' }, // Weighted count for rendering
          { name: 'FID', type: 'oid' }
        ],
        objectIdField: 'FID',
        geometryType: 'polygon',
        spatialReference: spatialRef,
        renderer: renderer
      });
      
      console.log('🔥 ShotHeatMapArcGIS: FeatureLayer created, adding to map...');
      
      // Add feature layer to map
      featureLayer.when(() => {
        console.log('🔥 ShotHeatMapArcGIS: ✅ Feature layer added successfully!');
      }).catch((error) => {
        console.error('🔥 ShotHeatMapArcGIS: ❌ Error adding feature layer:', error);
      });
      
      map.add(featureLayer);
      featureLayerRef.current = featureLayer;
      console.log('🔥 ShotHeatMapArcGIS: FeatureLayer added to map, ref updated');
      }).catch((error) => {
        console.error('ShotHeatMapArcGIS: Error loading Polygon module:', error);
      });
    };
    
    // If tile layer is already loaded, process immediately
    if (tileLayer.fullExtent) {
      processHeatMap();
    } else {
      // Otherwise wait for it
      tileLayer.when(() => {
        processHeatMap();
      }).catch((error) => {
        console.error('ShotHeatMapArcGIS: Error waiting for tile layer:', error);
      });
    }
  };


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sceneViewRef.current) {
        sceneViewRef.current.destroy();
        sceneViewRef.current = null;
      }
    };
  }, []);

  // Calculate responsive dimensions
  const actualWidth = isMobile ? Math.min(width, window.innerWidth - 32) : width;
  const actualHeight = isMobile ? Math.max(600, Math.min(window.innerHeight * 0.7, 800)) : height;
  const sliderHeight = isMobile ? 60 : 80; // Reduced slider height on mobile
  // Legend dimensions: horizontal bar on mobile, vertical bar on desktop
  // Using explicit pixel values for reliability
  const legendHeight = isMobile ? 16 : 300;
  const legendWidth = isMobile ? 180 : 30; // Fixed width for horizontal bar on mobile

  return (
    <div style={{ 
      width: actualWidth, 
      height: actualHeight, 
      backgroundColor: 'transparent',
      position: 'relative', 
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 0
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: isMobile ? 'flex-start' : 'flex-start', // Changed from 'center' to 'flex-start' to prevent extra space
        height: isMobile ? 'auto' : 'auto',
        position: 'relative',
        width: '100%',
        gap: '0', // No gap - legend should be directly under heatmap
        margin: '0',
        padding: isMobile ? '0' : '0', // No padding on mobile to maximize heatmap width
        flex: '1 1 auto'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: isMobile ? '100%' : '1000px', // Full width on mobile
          margin: isMobile ? '0' : '0 auto',
          height: isMobile ? 'auto' : '100%',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: isMobile ? 'flex-start' : 'flex-start', // Changed from 'stretch' to prevent forced height
          gap: '0', // No gap between heatmap and legend
          marginBottom: '0',
          paddingBottom: '0',
          padding: isMobile ? '0' : '0' // No padding on mobile to maximize heatmap width
        }}>
          <div 
            ref={containerRef} 
            style={{ 
              width: isMobile ? '100%' : 'calc(100% - 120px)', // Full width on mobile, reserve space for legend on desktop
              maxWidth: isMobile ? '100%' : '880px', // Full width on mobile
              height: isMobile ? 'auto' : '100%',
              minHeight: isMobile ? '400px' : 'auto',
              backgroundColor: 'white',
              margin: isMobile ? '0' : '0 auto',
              marginBottom: isMobile ? '-120px' : '-80px', // Negative margin to bring legend and slider closer
              padding: '0',
              border: 'none',
              display: 'block',
              lineHeight: '0',
              fontSize: '0',
              overflow: 'hidden'
            }} 
          />
          {/* Color Legend - horizontal on mobile, vertical on desktop */}
          <div style={{
            position: isMobile ? 'relative' : 'absolute',
            top: isMobile ? 'auto' : '0',
            right: isMobile ? 'auto' : '10px',
            width: isMobile ? '100%' : 'auto', // Auto width on desktop for vertical legend
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'column', // Column for title above gradient bar
            alignItems: 'center',
            gap: isMobile ? '4px' : '8px', // Tighter gap on mobile
            zIndex: 10,
            marginTop: isMobile ? '-80px' : '0', // Less negative margin - moved legend down
            marginBottom: isMobile ? '-60px' : '0', // Less negative margin
            padding: isMobile ? '0 5px' : '0'
          }}>
            <div style={{
              fontSize: isMobile ? '14px' : '12px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '4px'
            }}>
              Shot Density
            </div>
            {/* Horizontal gradient bar on mobile, vertical on desktop */}
            <div style={{
              position: 'relative',
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              alignItems: 'center',
              gap: isMobile ? 10 : 8,
              justifyContent: 'center'
            }}>
              <span style={{ 
                fontSize: isMobile ? 12 : 10, 
                color: '#666', 
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                Low
              </span>
              <div style={{
                width: legendWidth,
                height: legendHeight,
                background: isMobile 
                  ? 'linear-gradient(to right, rgb(212, 227, 245) 0%, rgb(133, 154, 250) 20%, rgb(62, 90, 253) 40%, rgb(132, 149, 122) 60%, rgb(234, 179, 8) 80%, rgb(255, 255, 0) 100%)'
                  : 'linear-gradient(to top, rgb(212, 227, 245) 0%, rgb(133, 154, 250) 20%, rgb(62, 90, 253) 40%, rgb(132, 149, 122) 60%, rgb(234, 179, 8) 80%, rgb(255, 255, 0) 100%)',
                borderRadius: 4,
                border: '1px solid #ddd',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }} />
              <span style={{ 
                fontSize: isMobile ? 12 : 10, 
                color: '#666', 
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                High
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Season slider at the bottom */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: `${sliderHeight}px`,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '8px 20px',
        gap: '4px',
        marginTop: isMobile ? '-140px' : '-80px' // Adjusted for legend position
      }}>
        <Slider
          label={`Season: ${selectedSeason}`}
          min={2004}
          max={2024}
          step={1}
          value={Number(selectedSeason)}
          onValueChange={(value) => {
            setSelectedSeason(String(value));
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '600px',
          fontSize: '11px',
          color: '#666',
          marginTop: '2px'
        }}>
          <span>2004</span>
          <span>2024</span>
        </div>
      </div>
    </div>
  );
}

