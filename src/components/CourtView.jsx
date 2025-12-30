import { useEffect, useRef } from 'react';

export default function CourtView({ 
  width = 800, 
  height = 600, 
  isVisible = false
}) {
  const sceneViewRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const loadArcGIS = async () => {
      try {
        const [
          TileLayerModule,
          MapModule,
          SceneViewModule,
          ExtentModule
        ] = await Promise.all([
          import('@arcgis/core/layers/TileLayer'),
          import('@arcgis/core/Map'),
          import('@arcgis/core/views/SceneView'),
          import('@arcgis/core/geometry/Extent')
        ]);
        
        const TileLayer = TileLayerModule.default;
        const Map = MapModule.default;
        const SceneView = SceneViewModule.default;
        const Extent = ExtentModule.default;

        // Use the public basketball court tile service
        const basketballCourtMapServiceUrl = 'https://tiles.arcgis.com/tiles/g2TonOxuRkIqSOFx/arcgis/rest/services/Dark_Basketball_Court/MapServer';
        
        const tileLayer = new TileLayer({
          url: basketballCourtMapServiceUrl
        });

        const map = new Map({
          layers: [tileLayer],
          basemap: null
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
              z: 750
            },
            heading: 0,
            tilt: 45
          },
          environment: {
            atmosphere: null,
            starsEnabled: false
          }
        });

        // Disable all navigation
        view.navigation = {
          gamepad: { enabled: false },
          mouseWheelZoomEnabled: false,
          browserTouchPanEnabled: false,
          browserTouchZoomEnabled: false
        };
        
        view.on('drag', (event) => {
          event.stopPropagation();
        });
        
        view.on('mouse-wheel', (event) => {
          event.stopPropagation();
        });

        // Set white background
        view.container.style.backgroundColor = 'white';
        
        // Wait for the tile layer to load, then set the extent to show only ONE court
        tileLayer.when(() => {
          if (tileLayer.fullExtent) {
            const fullExtent = tileLayer.fullExtent;
            
            // The tile layer might contain multiple courts or a full court
            // We need to show only ONE half court (one basket)
            const courtWidth = fullExtent.xmax - fullExtent.xmin;
            const courtHeight = fullExtent.ymax - fullExtent.ymin;
            
            // Check if this is a full court (two baskets) or multiple courts
            // If courtHeight is very large, it might be multiple courts stacked
            // We'll assume it's a full court and show only the bottom half
            
            // Calculate center point of the full extent
            const centerX = (fullExtent.xmin + fullExtent.xmax) / 2;
            const centerY = (fullExtent.ymin + fullExtent.ymax) / 2;
            
            // Show only ONE half court - bottom half (basket at bottom)
            // Use a quarter of the full height to ensure we only get one court
            // This handles cases where there might be multiple courts
            const singleCourtHeight = courtHeight / 2; // Half court height
            const singleCourtExtent = new Extent({
              xmin: fullExtent.xmin,  // Full width
              xmax: fullExtent.xmax,  // Full width  
              ymin: fullExtent.ymin,  // Start from absolute bottom
              ymax: fullExtent.ymin + singleCourtHeight,  // Only half the total height
              spatialReference: fullExtent.spatialReference
            });
            
            // Set clipping area FIRST to clip the view
            view.clippingArea = singleCourtExtent;
            
            // Then set the extent to zoom to the single court
            view.extent = singleCourtExtent;
            
            // Force the view to go to the single court extent
            view.goTo({
              target: singleCourtExtent,
              tilt: 45,
              heading: 0
            }).catch(() => {
              // If goTo fails, just set extent directly
              view.extent = singleCourtExtent;
            });
          }
        });

        sceneViewRef.current = view;
      } catch (e) {
        console.error('ArcGIS load error:', e);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; text-align: center; padding: 20px; background: white;">
              <div>
                <p style="margin-bottom: 10px; font-size: 16px; font-weight: 500;">Error loading court</p>
                <p style="font-size: 12px; color: #999;">${e.message}</p>
              </div>
            </div>
          `;
        }
      }
    };

    loadArcGIS();

    return () => {
      if (sceneViewRef.current) {
        sceneViewRef.current.destroy();
        sceneViewRef.current = null;
      }
    };
  }, [isVisible]);

  return (
    <div style={{ width, height, backgroundColor: 'white', position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: 'white'
        }} 
      />
    </div>
  );
}

