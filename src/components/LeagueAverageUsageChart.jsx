import { useMemo, useState, useEffect, useRef } from 'react';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { PatternLines } from '@visx/pattern';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import { line, curveMonotoneX as d3CurveMonotoneX } from 'd3';
import { BoxPlot, ViolinPlot } from '@visx/stats';

const defaultMargin = { top: 40, right: 20, bottom: 60, left: 60 };
const bisectYear = bisector((d) => d.year).left;

// Players to exclude from outliers
const EXCLUDED_OUTLIER_PLAYERS = ['Derrick Coleman', 'Terry Cummings', 'Tom Gugliotta'];

// Calculate box plot statistics
function calculateBoxPlotStats(values) {
  if (!values || values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const iqr = q3 - q1;
  const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
  const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
  
  return { min, q1, median, q3, max, lowerWhisker, upperWhisker };
}

// Create bin data for violin plot from raw values
function createBinData(values, numBins = 20) {
  if (!values || values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / numBins;
  
  const bins = Array(numBins).fill(0).map((_, i) => ({
    value: min + (i + 0.5) * binWidth,
    count: 0,
  }));
  
  values.forEach(value => {
    const binIndex = Math.min(
      Math.floor((value - min) / binWidth),
      numBins - 1
    );
    bins[binIndex].count++;
  });
  
  // Normalize counts to density
  const maxCount = Math.max(...bins.map(b => b.count));
  return bins.map(bin => ({
    value: bin.value,
    count: maxCount > 0 ? bin.count / maxCount : 0,
  }));
}

// Check if two labels overlap
function checkLabelOverlap(label1, label2, minDistance = 15) {
  const distance = Math.sqrt(
    Math.pow(label1.x - label2.x, 2) + Math.pow(label1.y - label2.y, 2)
  );
  return distance < minDistance;
}

// Position outlier labels to avoid overlaps
function positionOutlierLabels(outliers, x, yScale) {
  const labels = [];
  const minDistance = 20; // Minimum distance between labels
  
  outliers.forEach((outlier, i) => {
    const y = yScale(outlier.usage);
    let labelX = x + 8;
    let labelY = y - 8;
    let offset = 0;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Try different positions to avoid overlap
    while (attempts < maxAttempts) {
      const overlaps = labels.some(existing => 
        checkLabelOverlap(
          { x: labelX, y: labelY },
          { x: existing.x, y: existing.y },
          minDistance
        )
      );
      
      if (!overlaps) break;
      
      // Try offsetting vertically
      offset += 12;
      labelY = y - 8 + (attempts % 2 === 0 ? offset : -offset);
      attempts++;
    }
    
    labels.push({
      x: labelX,
      y: labelY,
      outlier,
    });
  });
  
  return labels;
}

export default function LeagueAverageUsageChart({ 
  data, 
  width = 800, 
  height = 500, 
  margin = defaultMargin,
  isVisible = false,
  scrollProgress = 0
}) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const [lineProgress, setLineProgress] = useState(0);
  const [containerOpacity, setContainerOpacity] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0); // For left-to-right animation
  const animationRef = useRef(null);
  const containerAnimationRef = useRef(null);
  const revealAnimationRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const prevZoomStateRef = useRef(null);

  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Determine zoom state from scroll progress
  // 0-1: Zoomed out (25-40%), animate left to right
  // 1-2: Zoomed out (25-40%), show outliers
  // 2-3: Zoom into 2010+
  const zoomState = useMemo(() => {
    if (scrollProgress < 1) return 'zoomed-out-animate';
    if (scrollProgress < 2) return 'zoomed-out-outliers';
    return 'post-2010';
  }, [scrollProgress]);

  // Calculate box plot stats, bin data, and outliers for each season
  const dataWithStats = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(d => {
      const boxStats = calculateBoxPlotStats(d.teamUsages);
      if (!boxStats) return { ...d, boxStats: null, binData: [], outliers: [] };
      
      // Find outliers with player info, excluding specific players
      const teamUsageData = d.teamUsageData || [];
      const outliers = teamUsageData.filter(
        item => {
          const usage = typeof item === 'number' ? item : item.usage;
          const playerName = typeof item === 'number' ? '' : (item.playerName || '');
          // Exclude specific players
          if (EXCLUDED_OUTLIER_PLAYERS.includes(playerName)) {
            return false;
          }
          return usage < boxStats.lowerWhisker || usage > boxStats.upperWhisker;
        }
      ).map(item => ({
        usage: typeof item === 'number' ? item : item.usage,
        playerName: typeof item === 'number' ? 'Unknown' : (item.playerName || item.team || 'Unknown'),
      }));
      
      return {
        ...d,
        boxStats,
        binData: createBinData(d.teamUsages),
        outliers: outliers.map(o => o.usage),
        outlierData: outliers, // Keep player info
      };
    });
  }, [data]);

  // Filter data for post-2010 view
  const filteredData = useMemo(() => {
    if (zoomState === 'post-2010') {
      return data.filter(d => d.year >= 2010);
    }
    return data;
  }, [data, zoomState]);

  // Scales - use scaleBand for better spacing of box/violin plots
  const xScale = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;
    return scaleBand({
      range: [0, xMax],
      domain: filteredData.map(d => d.year),
      padding: 0.2,
    });
  }, [xMax, filteredData]);

  // Y-axis scaling based on zoom state
  const yScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    if (zoomState === 'post-2010') {
      // Post-2010 data only, tight range
      const post2010Data = data.filter(d => d.year >= 2010);
      const allValues = post2010Data.flatMap(d => d.teamUsages);
      const maxUsage = Math.max(...allValues);
      const minUsage = Math.min(...allValues);
      const range = maxUsage - minUsage;
      
      return scaleLinear({
        range: [yMax, 0],
        domain: [
          Math.max(0, minUsage - range * 0.05),
          maxUsage + range * 0.05
        ],
        nice: false,
      });
    } else {
      // Zoomed out: fixed domain [25, 40.5] to accommodate outliers slightly above 40%
      return scaleLinear({
        range: [yMax, 0],
        domain: [25, 40.5],
        nice: false,
      });
    }
  }, [yMax, data, zoomState]);

  // Generate line path
  const pathString = useMemo(() => {
    if (!xScale || !yScale || !filteredData || filteredData.length === 0) return '';
    const lineGenerator = line()
      .x((d) => (xScale(d.year) || 0) + (xScale.bandwidth() || 0) / 2)
      .y((d) => yScale(d.avgUsage))
      .curve(d3CurveMonotoneX);
    return lineGenerator(filteredData) || '';
  }, [xScale, yScale, filteredData]);

  useEffect(() => {
    if (pathRef.current && pathString) {
      const length = pathRef.current.getTotalLength();
      if (length > 0) {
        setPathLength(length);
      }
    }
  }, [pathString]);

  // Animate when visible or when zoom state changes to post-2010 (but not when switching to outliers)
  useEffect(() => {
    const shouldAnimate = isVisible && data.length > 0;
    const zoomStateChanged = prevZoomStateRef.current !== zoomState;
    // Only trigger animation on initial load or when switching to post-2010, not when switching to outliers
    const isSwitchingToOutliers = zoomState === 'zoomed-out-outliers' && prevZoomStateRef.current === 'zoomed-out-animate';
    const shouldTriggerAnimation = shouldAnimate && (zoomStateChanged || !prevZoomStateRef.current) && !isSwitchingToOutliers;
    
    if (shouldTriggerAnimation) {
      prevZoomStateRef.current = zoomState;
      
      // Reset states
      setContainerOpacity(1);
      setLineProgress(0);
      setRevealProgress(0);
      
      // Cancel any existing animations
      if (containerAnimationRef.current) {
        cancelAnimationFrame(containerAnimationRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (revealAnimationRef.current) {
        cancelAnimationFrame(revealAnimationRef.current);
      }
      
      // Animate left-to-right reveal - DOUBLE SPEED AGAIN (0.75 seconds)
      const revealDuration = 750; // 0.75 seconds for left-to-right (doubled speed again)
      const revealStartTime = Date.now();
      
      const animateReveal = () => {
        const elapsed = Date.now() - revealStartTime;
        const progress = Math.min(elapsed / revealDuration, 1);
        setRevealProgress(progress);
        
        if (progress < 1) {
          revealAnimationRef.current = requestAnimationFrame(animateReveal);
        } else {
          setRevealProgress(1);
          // After reveal, animate line
          const lineDuration = 2000;
          const lineStartTime = Date.now();
          
          const animateLine = () => {
            const lineElapsed = Date.now() - lineStartTime;
            const lineProgress = Math.min(lineElapsed / lineDuration, 1);
            setLineProgress(lineProgress);
            
            if (lineProgress < 1) {
              animationRef.current = requestAnimationFrame(animateLine);
            } else {
              setLineProgress(1);
            }
          };
          
          animationRef.current = requestAnimationFrame(animateLine);
        }
      };
      
      revealAnimationRef.current = requestAnimationFrame(animateReveal);
      
      return () => {
        if (containerAnimationRef.current) {
          cancelAnimationFrame(containerAnimationRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (revealAnimationRef.current) {
          cancelAnimationFrame(revealAnimationRef.current);
        }
      };
    } else if (!isVisible) {
      setContainerOpacity(0);
      setLineProgress(0);
      setRevealProgress(0);
    } else if (isSwitchingToOutliers) {
      // When switching to outliers, just update the zoom state without re-animating
      prevZoomStateRef.current = zoomState;
    }
  }, [isVisible, data.length, zoomState]);

  // Handle mouse events - FIXED crosshair for scaleBand
  const handleMouseMove = (event) => {
    if (!xScale || !filteredData || filteredData.length === 0) return;
    
    const coords = localPoint(event);
    if (!coords) return;
    
    // Get x relative to the chart area (not the SVG)
    const x = coords.x - margin.left;
    
    // For scaleBand, we need to find which band the mouse is over
    // Find the closest year by checking each band
    let closestYear = null;
    let minDistance = Infinity;
    
    filteredData.forEach(d => {
      const bandStart = xScale(d.year) || 0;
      const bandEnd = bandStart + (xScale.bandwidth() || 0);
      const bandCenter = bandStart + (xScale.bandwidth() || 0) / 2;
      const distance = Math.abs(x - bandCenter);
      
      if (x >= bandStart && x <= bandEnd && distance < minDistance) {
        minDistance = distance;
        closestYear = d.year;
      }
    });
    
    if (closestYear === null) {
      hideTooltip();
      return;
    }
    
    const d = filteredData.find(d => d.year === closestYear);
    if (!d) {
      hideTooltip();
      return;
    }
    
    // Find corresponding data with stats
    const dWithStats = dataWithStats.find(dws => dws.season === d.season) || d;
    
    const xPos = (xScale(d.year) || 0) + (xScale.bandwidth() || 0) / 2;
    
    showTooltip({
      tooltipData: dWithStats,
      tooltipLeft: xPos + margin.left,
      tooltipTop: yScale(d.avgUsage) + margin.top,
    });
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  if (!data || data.length === 0 || !xScale || !yScale) {
    return null;
  }

  const boxWidth = xScale.bandwidth() * 0.4;
  const constrainedWidth = Math.min(40, xScale.bandwidth() * 0.8);
  const centerX = (bandStart) => bandStart + (xScale.bandwidth() || 0) / 2;

  // Get filtered data with stats for rendering
  const filteredDataWithStats = useMemo(() => {
    if (zoomState === 'post-2010') {
      return dataWithStats.filter(d => d.year >= 2010);
    }
    return dataWithStats;
  }, [dataWithStats, zoomState]);

  // Calculate how many data points should be visible based on reveal progress
  const visibleCount = Math.ceil(filteredData.length * revealProgress);

  return (
    <div style={{ opacity: containerOpacity }}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <PatternLines
            id="violinLines"
            height={3}
            width={3}
            stroke="#3b82f6"
            strokeWidth={1}
            orientation={['horizontal']}
          />
        </defs>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="white"
          rx={8}
        />
        
        <Group top={margin.top} left={margin.left}>
          <GridRows
            scale={yScale}
            width={xMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
            strokeOpacity={0.6}
            pointerEvents="none"
          />
          
          {/* Violin plots using visx with stripes - FIXED alignment */}
          {filteredDataWithStats.slice(0, visibleCount).map((d, i) => {
            if (!d.binData || d.binData.length === 0 || !d.boxStats) return null;
            
            const left = xScale(d.year);
            if (left === undefined) return null;
            const xCenter = centerX(left);
            
            return (
              <ViolinPlot
                key={`violin-${i}`}
                data={d.binData}
                left={xCenter - constrainedWidth / 2}
                width={constrainedWidth}
                valueScale={yScale}
                stroke="#3b82f6"
                fill="url(#violinLines)"
                fillOpacity={0.3}
                strokeWidth={1}
              />
            );
          })}
          
          {/* Box plots using visx - aligned to center */}
          {filteredDataWithStats.slice(0, visibleCount).map((d, i) => {
            if (!d.boxStats) return null;
            
            const left = xScale(d.year);
            if (left === undefined) return null;
            
            const stats = d.boxStats;
            const xCenter = centerX(left);
            
            return (
              <BoxPlot
                key={`box-${i}`}
                min={stats.lowerWhisker}
                max={stats.upperWhisker}
                left={xCenter - boxWidth / 2}
                firstQuartile={stats.q1}
                thirdQuartile={stats.q3}
                median={stats.median}
                boxWidth={boxWidth}
                valueScale={yScale}
                fill="#3b82f6"
                fillOpacity={0.3}
                stroke="#3b82f6"
                strokeWidth={1.5}
                medianProps={{
                  stroke: '#1f2937',
                  strokeWidth: 2,
                }}
                outliers={zoomState === 'zoomed-out-outliers' ? d.outliers : []}
                outlierProps={{
                  fill: '#ef4444',
                  stroke: '#dc2626',
                  strokeWidth: 2,
                  r: 4,
                }}
              />
            );
          })}
          
          {/* Average line - GREEN, aligned to center */}
          {pathString && (
            <path
              ref={pathRef}
              d={pathString}
              fill="none"
              stroke="#10b981"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - lineProgress)}
            />
          )}
          
          {/* Data points on line - aligned to center */}
          {lineProgress >= 1 && filteredData.slice(0, visibleCount).map((d, i) => {
            const left = xScale(d.year);
            if (left === undefined) return null;
            const x = centerX(left);
            return (
              <circle
                key={i}
                cx={x}
                cy={yScale(d.avgUsage)}
                r={4}
                fill="#10b981"
                stroke="white"
                strokeWidth={2}
                style={{ 
                  opacity: 0,
                  animation: 'fadeIn 0.3s ease-in forwards',
                  animationDelay: `${i * 0.02}s`
                }}
              />
            );
          })}
          
          {/* Crosshair - FIXED using visx pattern */}
          {tooltipOpen && tooltipData && (
            <>
              {/* Vertical crosshair line */}
              <line
                x1={centerX(xScale(tooltipData.year) || 0)}
                x2={centerX(xScale(tooltipData.year) || 0)}
                y1={0}
                y2={yMax}
                stroke="#6b7280"
                strokeWidth={1.5}
                strokeDasharray="4,4"
                opacity={0.6}
                pointerEvents="none"
              />
              {/* Highlighted data point at crosshair */}
              <circle
                cx={centerX(xScale(tooltipData.year) || 0)}
                cy={yScale(tooltipData.avgUsage)}
                r={6}
                fill="#10b981"
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))' }}
              />
            </>
          )}
          
          {/* Highlight outliers with player names when zoomed out - with overlap detection */}
          {zoomState === 'zoomed-out-outliers' && filteredDataWithStats.slice(0, visibleCount).map((d, i) => {
            if (!d.outlierData || d.outlierData.length === 0) return null;
            
            const left = xScale(d.year);
            if (left === undefined) return null;
            const x = centerX(left);
            
            // Position labels to avoid overlaps
            const positionedLabels = positionOutlierLabels(d.outlierData, x, yScale);
            
            return positionedLabels.map((label, j) => {
              const y = yScale(label.outlier.usage);
              // Allow labels slightly outside the visible range (within 50px) to show edge outliers
              if (y === undefined || y < -50 || y > yMax + 50) return null;
              
              return (
                <g key={`outlier-${i}-${j}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={5}
                    fill="#ef4444"
                    stroke="#dc2626"
                    strokeWidth={2}
                    opacity={0.9}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.4))',
                      animation: 'pulseOnce 1s ease-in-out',
                    }}
                  />
                  <text
                    x={label.x}
                    y={label.y}
                    fontSize="10"
                    fill="#dc2626"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
                    style={{
                      pointerEvents: 'none',
                      textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {label.outlier.playerName}
                  </text>
                </g>
              );
            });
          })}
          
          {/* Invisible overlay for mouse events */}
          <rect
            x={0}
            y={0}
            width={xMax}
            height={yMax}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          
          {/* Axes */}
          <AxisLeft
            scale={yScale}
            left={0}
            stroke="#6b7280"
            tickStroke="#6b7280"
            tickLabelProps={() => ({
              fill: '#6b7280',
              fontSize: 12,
              textAnchor: 'end',
              dx: -10,
            })}
            tickFormat={(value) => `${value.toFixed(1)}%`}
            numTicks={10}
          />
          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="#6b7280"
            tickStroke="#6b7280"
            tickLabelProps={() => ({
              fill: '#6b7280',
              fontSize: 12,
              textAnchor: 'middle',
              dy: 10,
            })}
            tickFormat={(value) => Math.round(value).toString()}
            numTicks={width > 400 ? 10 : 5}
          />
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <Tooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="font-semibold mb-2">{tooltipData.season}</div>
          <div>Avg Usage: {tooltipData.avgUsage.toFixed(1)}%</div>
          {tooltipData.boxStats && (
            <>
              <div className="text-xs mt-1 text-gray-300">
                Median: {tooltipData.boxStats.median.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-300">
                Q1: {tooltipData.boxStats.q1.toFixed(1)}% | Q3: {tooltipData.boxStats.q3.toFixed(1)}%
              </div>
            </>
          )}
        </Tooltip>
      )}
    </div>
  );
}
