import { useMemo, useState, useEffect, useRef } from 'react';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Area } from '@visx/shape';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import { line, curveMonotoneX as d3CurveMonotoneX } from 'd3';

const defaultMargin = { top: 40, right: 80, bottom: 40, left: 60 };
const bisectYear = bisector((d) => d.year).left;

// Define NBA eras (ordered: Early Modern, Deadball, Three-Point Revolution)
const ERAS = [
  {
    name: "Early Modern / Fast-Break Era",
    startYear: 1979,
    endYear: 1989,
    color: "#3b82f6", // blue
    description: "Introduction of three-point line, fast-paced play"
  },
  {
    name: "Deadball Era",
    startYear: 1997,
    endYear: 2004,
    color: "#ef4444", // red
    description: "Low-scoring, defensive-focused basketball"
  },
  {
    name: "Three-Point Revolution",
    startYear: 2013,
    endYear: 2019,
    color: "#10b981", // green
    description: "Analytics-driven three-point shooting explosion"
  }
];

export default function DualAxisChart({ 
  data, 
  width = 800, 
  height = 500, 
  margin = defaultMargin,
  isVisible = false,
  activeEraIndex = null
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
  const [eraOpacity, setEraOpacity] = useState(0);
  const [areaScale, setAreaScale] = useState(0);
  const animationRef = useRef(null);
  const containerAnimationRef = useRef(null);
  const areaAnimationRef = useRef(null);
  const pacePathRef = useRef(null);
  const ortgPathRef = useRef(null);
  const [pacePathLength, setPacePathLength] = useState(0);
  const [ortgPathLength, setOrtgPathLength] = useState(0);

  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Filter data to only include entries with both pace and ortg
  const filteredData = useMemo(() => {
    return data.filter(d => d.pace != null && d.ortg != null && !isNaN(d.pace) && !isNaN(d.ortg));
  }, [data]);

  // Scales
  const xScale = useMemo(
    () => {
      if (!filteredData || filteredData.length === 0) return null;
      return scaleLinear({
        range: [0, xMax],
        domain: [Math.min(...filteredData.map(d => d.year)), Math.max(...filteredData.map(d => d.year))],
        nice: true,
      });
    },
    [xMax, filteredData]
  );

  // Left Y-axis scale for Pace
  const paceYScale = useMemo(
    () => {
      if (!filteredData || filteredData.length === 0) return null;
      const paceValues = filteredData.map(d => d.pace);
      return scaleLinear({
        range: [yMax, 0],
        domain: [
          Math.min(...paceValues) - 2,
          Math.max(...paceValues) + 2,
        ],
        nice: true,
      });
    },
    [yMax, filteredData]
  );

  // Right Y-axis scale for ORtg (points per 100 possessions)
  const ortgYScale = useMemo(
    () => {
      if (!filteredData || filteredData.length === 0) return null;
      const ortgValues = filteredData.map(d => d.ortg);
      return scaleLinear({
        range: [yMax, 0],
        domain: [
          Math.min(...ortgValues) - 2,
          Math.max(...ortgValues) + 2,
        ],
        nice: true,
      });
    },
    [yMax, filteredData]
  );

  // Generate curved paths
  const generateCurvedPath = (getValue, yScaleForPath) => {
    if (!xScale || !yScaleForPath || !filteredData || filteredData.length === 0) return '';
    
    const lineGenerator = line()
      .x((d) => xScale(d.year))
      .y((d) => yScaleForPath(getValue(d)))
      .curve(d3CurveMonotoneX);
    
    return lineGenerator(filteredData) || '';
  };

  const pacePathString = useMemo(() => generateCurvedPath(d => d.pace, paceYScale), [xScale, paceYScale, filteredData]);
  const ortgPathString = useMemo(() => generateCurvedPath(d => d.ortg, ortgYScale), [xScale, ortgYScale, filteredData]);

  // Calculate path lengths
  useEffect(() => {
    const calculateLengths = () => {
      if (pacePathRef.current && pacePathString) {
        const length = pacePathRef.current.getTotalLength();
        if (length > 0) {
          setPacePathLength(length);
        }
      }
      if (ortgPathRef.current && ortgPathString) {
        const length = ortgPathRef.current.getTotalLength();
        if (length > 0) {
          setOrtgPathLength(length);
        }
      }
    };

    calculateLengths();
    const timer = setTimeout(calculateLengths, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [pacePathString, ortgPathString]);

  // Animate container fade-in (1 second)
  useEffect(() => {
    if (isVisible && filteredData.length > 0) {
      setContainerOpacity(0);
      const duration = 1000; // 1 second for container fade-in
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setContainerOpacity(progress);

        if (progress < 1) {
          containerAnimationRef.current = requestAnimationFrame(animate);
        } else {
          setContainerOpacity(1);
        }
      };

      containerAnimationRef.current = requestAnimationFrame(animate);

      return () => {
        if (containerAnimationRef.current) {
          cancelAnimationFrame(containerAnimationRef.current);
        }
      };
    } else if (!isVisible) {
      setContainerOpacity(0);
    }

    return () => {
      if (containerAnimationRef.current) {
        cancelAnimationFrame(containerAnimationRef.current);
      }
    };
  }, [isVisible, filteredData.length]);

  // Animate line drawing (2 seconds) - starts after container fade-in begins
  useEffect(() => {
    if (isVisible && filteredData.length > 0) {
      setLineProgress(0);
      const duration = 2000; // 2 seconds for line drawing
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setLineProgress(progress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setLineProgress(1);
        }
      };

      // Start line animation immediately (overlaps with container fade-in)
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else if (!isVisible) {
      setLineProgress(0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, filteredData.length]);

  const getStrokeDashoffset = (pathLength) => pathLength * (1 - lineProgress);

  // Handle era opacity and animation transitions
  useEffect(() => {
    if (activeEraIndex !== null) {
      // Reset and animate area
      setEraOpacity(0);
      setAreaScale(0);
      
      const duration = 800; // 0.8 seconds for area animation
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        setEraOpacity(easedProgress);
        setAreaScale(easedProgress);

        if (progress < 1) {
          areaAnimationRef.current = requestAnimationFrame(animate);
        } else {
          setEraOpacity(1);
          setAreaScale(1);
        }
      };

      areaAnimationRef.current = requestAnimationFrame(animate);
    } else {
      setEraOpacity(0);
      setAreaScale(0);
    }

    return () => {
      if (areaAnimationRef.current) {
        cancelAnimationFrame(areaAnimationRef.current);
      }
    };
  }, [activeEraIndex]);

  // Generate era area data for visx Area component - includes pace values to shade below the line
  const eraAreaData = useMemo(() => {
    if (activeEraIndex === null || activeEraIndex < 0 || activeEraIndex >= ERAS.length || !xScale || !paceYScale || !filteredData.length) {
      return [];
    }
    
    try {
      const era = ERAS[activeEraIndex];
      // Get data points within the era range
      const eraDataPoints = filteredData.filter(d => d.year >= era.startYear && d.year <= era.endYear);
      
      if (eraDataPoints.length === 0) return [];
      
      // Add boundary points if needed (use first and last pace values)
      const firstPoint = eraDataPoints[0];
      const lastPoint = eraDataPoints[eraDataPoints.length - 1];
      
      // Create start point with pace value
      const startPoint = { 
        year: era.startYear, 
        pace: firstPoint.pace 
      };
      
      // Create end point with pace value
      const endPoint = { 
        year: era.endYear, 
        pace: lastPoint.pace 
      };
      
      // Combine start, middle points, and end - each point needs pace for y0
      return [startPoint, ...eraDataPoints, endPoint];
    } catch (error) {
      console.error('Error generating era area data:', error);
      return [];
    }
  }, [activeEraIndex, filteredData, xScale, paceYScale]);

  // Get current era info for label
  const currentEra = useMemo(() => {
    if (activeEraIndex === null || activeEraIndex < 0 || activeEraIndex >= ERAS.length) {
      return null;
    }
    return ERAS[activeEraIndex];
  }, [activeEraIndex]);

  // Handle mouse events
  const handleMouseMove = (event) => {
    if (!xScale) return;
    
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x - margin.left);
    
    if (x0 === undefined || isNaN(x0)) return;
    
    const index = bisectYear(filteredData, x0, 1);
    const d0 = filteredData[index - 1];
    const d1 = filteredData[index];
    let d = d0;
    
    if (d1 && d0) {
      d = Math.abs(x0 - d0.year) < Math.abs(x0 - d1.year) ? d0 : d1;
    } else if (d1) {
      d = d1;
    } else if (d0) {
      d = d0;
    } else {
      return;
    }
    
    const avgY = (paceYScale(d.pace) + ortgYScale(d.ortg)) / 2;
    showTooltip({
      tooltipData: d,
      tooltipLeft: x,
      tooltipTop: avgY + margin.top,
    });
  };

  if (!filteredData || filteredData.length === 0 || !xScale || !paceYScale || !ortgYScale) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center items-center" style={{ opacity: containerOpacity }}>
      <svg width={width} height={height} className="overflow-visible" style={{ maxWidth: '100%', height: 'auto' }}>
        <defs>
          {/* Gradient definitions for each era */}
          <linearGradient id="deadballGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="earlyModernGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="threePointGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="white"
          rx={8}
        />
        
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid */}
          <GridRows
            scale={paceYScale}
            width={xMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
            strokeOpacity={0.6}
            pointerEvents="none"
          />
          
          {/* Clip path for area animation - fades in from line graph downward */}
          {activeEraIndex !== null && currentEra && xScale && paceYScale && eraAreaData.length > 0 && (
            <defs>
              <clipPath id={`eraClip-${activeEraIndex}`}>
                {/* Calculate the minimum y position (top of area at the line) */}
                {(() => {
                  const minY = Math.min(...eraAreaData.map(d => paceYScale(d.pace)));
                  const maxY = yMax;
                  const animatedHeight = (maxY - minY) * areaScale;
                  return (
                    <rect
                      x={xScale(currentEra.startYear)}
                      y={minY}
                      width={xScale(currentEra.endYear) - xScale(currentEra.startYear)}
                      height={animatedHeight}
                    />
                  );
                })()}
              </clipPath>
            </defs>
          )}
          
          {/* Era highlight area - using visx Area component, shading below the pace line */}
          {activeEraIndex !== null && xScale && paceYScale && eraAreaData.length > 0 && currentEra && (
            <Area
              data={eraAreaData}
              x={(d) => xScale(d.year)}
              y0={(d) => paceYScale(d.pace)} // Top of area follows the pace line
              y1={yMax} // Bottom of area is the bottom of chart
              fill={
                activeEraIndex === 0 ? "url(#earlyModernGradient)" :
                activeEraIndex === 1 ? "url(#deadballGradient)" :
                "url(#threePointGradient)"
              }
              fillOpacity={eraOpacity}
              clipPath={`url(#eraClip-${activeEraIndex})`}
              pointerEvents="none"
            />
          )}
          
          {/* Animated lines */}
          {pacePathString && (
            <path
              ref={pacePathRef}
              d={pacePathString}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pacePathLength || undefined}
              strokeDashoffset={pacePathLength ? getStrokeDashoffset(pacePathLength) : pacePathLength}
            />
          )}
          {ortgPathString && (
            <path
              ref={ortgPathRef}
              d={ortgPathString}
              fill="none"
              stroke="#ec4899"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={ortgPathLength || undefined}
              strokeDashoffset={ortgPathLength ? getStrokeDashoffset(ortgPathLength) : ortgPathLength}
            />
          )}
          
          {/* Era label - positioned below the chart area to avoid overlap */}
          {activeEraIndex !== null && xScale && eraOpacity > 0 && currentEra && (
            <text
              x={xScale((currentEra.startYear + currentEra.endYear) / 2)}
              y={yMax + (16 * 1.5) + 30}
              textAnchor="middle"
              fill={currentEra.color}
              fontSize={16}
              fontWeight="bold"
              opacity={0.9 * eraOpacity}
              pointerEvents="none"
              style={{
                transition: 'opacity 0.5s ease-in-out'
              }}
            >
              {currentEra.name}
            </text>
          )}

          {/* Crosshair on hover */}
          {tooltipOpen && tooltipData && (
            <>
              <line
                x1={xScale(tooltipData.year)}
                x2={xScale(tooltipData.year)}
                y1={0}
                y2={yMax}
                stroke="#6b7280"
                strokeWidth={1.5}
                strokeDasharray="4,4"
                opacity={0.6}
                pointerEvents="none"
              />
              <circle
                cx={xScale(tooltipData.year)}
                cy={paceYScale(tooltipData.pace)}
                r={6}
                fill="#8b5cf6"
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4))' }}
              />
              <circle
                cx={xScale(tooltipData.year)}
                cy={ortgYScale(tooltipData.ortg)}
                r={6}
                fill="#ec4899"
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(236, 72, 153, 0.4))' }}
              />
            </>
          )}
          
          {/* Data points - only show after line animation is complete */}
          {lineProgress >= 1 && filteredData.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(d.year)}
                cy={paceYScale(d.pace)}
                r={4}
                fill="#8b5cf6"
                stroke="white"
                strokeWidth={2}
                className="cursor-pointer"
                style={{ 
                  opacity: 0,
                  animation: 'fadeIn 0.3s ease-in forwards',
                  animationDelay: `${i * 0.02}s`
                }}
              />
              <circle
                cx={xScale(d.year)}
                cy={ortgYScale(d.ortg)}
                r={4}
                fill="#ec4899"
                stroke="white"
                strokeWidth={2}
                className="cursor-pointer"
                style={{ 
                  opacity: 0,
                  animation: 'fadeIn 0.3s ease-in forwards',
                  animationDelay: `${i * 0.02}s`
                }}
              />
            </g>
          ))}
          
          {/* Invisible overlay for mouse events */}
          <rect
            x={0}
            y={0}
            width={xMax}
            height={yMax}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={hideTooltip}
          />
          
          {/* Axes */}
          <AxisLeft
            scale={paceYScale}
            left={0}
            stroke="#6b7280"
            tickStroke="#6b7280"
            tickLabelProps={() => ({
              fill: '#8b5cf6',
              fontSize: 12,
              textAnchor: 'end',
              dx: -10,
            })}
            tickFormat={(value) => value.toFixed(1)}
          />
          {/* Right axis - using AxisLeft positioned on the right */}
          <AxisLeft
            scale={ortgYScale}
            left={xMax}
            stroke="#6b7280"
            tickStroke="#6b7280"
            tickLabelProps={() => ({
              fill: '#ec4899',
              fontSize: 12,
              textAnchor: 'start',
              dx: 10,
            })}
            tickFormat={(value) => value.toFixed(1)}
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
            numTicks={width > 600 ? 10 : 5}
          />
        </g>
      </svg>
      
      {/* Legend - positioned on the right */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#8b5cf6]"></div>
            <span className="text-gray-700 font-semibold">Pace</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#ec4899]"></div>
            <span className="text-gray-700 font-semibold">Points/100 Poss</span>
          </div>
        </div>
      </div>

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
          <div className="text-purple-300">
            Pace: {tooltipData.pace?.toFixed(1)}
          </div>
          <div className="text-pink-300">
            Points/100 Poss: {tooltipData.ortg?.toFixed(1)}
          </div>
        </Tooltip>
      )}
    </div>
  );
}

