import { useMemo, useState, useEffect, useRef } from 'react';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import { line, curveMonotoneX as d3CurveMonotoneX } from 'd3';

// Chart dimensions
const defaultMargin = { top: 20, right: 20, bottom: 40, left: 60 };

const bisectYear = bisector((d) => d.year).left;

// Colors for each metric
const METRIC_COLORS = {
  efg: '#3b82f6', // Blue
  ts: '#10b981', // Green
  ftPerFga: '#f59e0b', // Orange
  orb: '#ef4444', // Red
};

export default function NormalizedOffenseChart({ 
  data, 
  width = 800, 
  height = 400, 
  margin = defaultMargin, 
  isVisible = false 
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
  const animationRef = useRef(null);
  const containerAnimationRef = useRef(null);

  // Filter data to only include entries with all required metrics and year >= 1979
  const filteredData = useMemo(() => {
    return data.filter(d => 
      d.year >= 1979 && 
      d.efgPercent != null && 
      d.tsPercent != null && 
      d.ftPerFga != null && 
      d.orbPercent != null &&
      !isNaN(d.efgPercent) && 
      !isNaN(d.tsPercent) && 
      !isNaN(d.ftPerFga) && 
      !isNaN(d.orbPercent)
    );
  }, [data]);

  // Normalize data: 1980 = 100 for each metric
  const normalizedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Find 1980 baseline values
    const baseline1980 = filteredData.find(d => d.year === 1980);
    if (!baseline1980) {
      // If 1980 not found, use first available year
      const firstYear = filteredData[0];
      return filteredData.map(d => ({
        ...d,
        normalizedEfg: (d.efgPercent / firstYear.efgPercent) * 100,
        normalizedTs: (d.tsPercent / firstYear.tsPercent) * 100,
        normalizedFtPerFga: (d.ftPerFga / firstYear.ftPerFga) * 100,
        normalizedOrb: (d.orbPercent / firstYear.orbPercent) * 100,
      }));
    }

    return filteredData.map(d => ({
      ...d,
      normalizedEfg: (d.efgPercent / baseline1980.efgPercent) * 100,
      normalizedTs: (d.tsPercent / baseline1980.tsPercent) * 100,
      normalizedFtPerFga: (d.ftPerFga / baseline1980.ftPerFga) * 100,
      normalizedOrb: (d.orbPercent / baseline1980.orbPercent) * 100,
    }));
  }, [filteredData]);

  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(
    () => {
      if (!normalizedData || normalizedData.length === 0) return null;
      return scaleLinear({
        range: [0, xMax],
        domain: [Math.min(...normalizedData.map(d => d.year)), Math.max(...normalizedData.map(d => d.year))],
        nice: true,
      });
    },
    [xMax, normalizedData]
  );

  const yScale = useMemo(
    () => {
      if (!normalizedData || normalizedData.length === 0) return null;
      // Find min and max across all four normalized metrics
      const allValues = [
        ...normalizedData.map(d => d.normalizedEfg),
        ...normalizedData.map(d => d.normalizedTs),
        ...normalizedData.map(d => d.normalizedFtPerFga),
        ...normalizedData.map(d => d.normalizedOrb),
      ];
      return scaleLinear({
        range: [yMax, 0],
        domain: [
          Math.min(...allValues) - 5,
          Math.max(...allValues) + 5,
        ],
        nice: true,
      });
    },
    [yMax, normalizedData]
  );

  // Generate smooth curved path strings for animation - one for each metric
  const efgPathRef = useRef(null);
  const tsPathRef = useRef(null);
  const ftPerFgaPathRef = useRef(null);
  const orbPathRef = useRef(null);
  const [efgPathLength, setEfgPathLength] = useState(0);
  const [tsPathLength, setTsPathLength] = useState(0);
  const [ftPerFgaPathLength, setFtPerFgaPathLength] = useState(0);
  const [orbPathLength, setOrbPathLength] = useState(0);

  // Generate smooth curved paths using d3's line generator with curveMonotoneX
  const generateCurvedPath = (getValue) => {
    if (!xScale || !yScale || !normalizedData || normalizedData.length === 0) return '';
    
    const lineGenerator = line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(getValue(d)))
      .curve(d3CurveMonotoneX);
    
    return lineGenerator(normalizedData) || '';
  };

  const efgPathString = useMemo(() => generateCurvedPath(d => d.normalizedEfg), [xScale, yScale, normalizedData]);
  const tsPathString = useMemo(() => generateCurvedPath(d => d.normalizedTs), [xScale, yScale, normalizedData]);
  const ftPerFgaPathString = useMemo(() => generateCurvedPath(d => d.normalizedFtPerFga), [xScale, yScale, normalizedData]);
  const orbPathString = useMemo(() => generateCurvedPath(d => d.normalizedOrb), [xScale, yScale, normalizedData]);

  useEffect(() => {
    // Calculate path lengths when paths are available
    const calculateLengths = () => {
      if (efgPathRef.current && efgPathString) {
        const length = efgPathRef.current.getTotalLength();
        if (length > 0) {
          setEfgPathLength(length);
        }
      }
      if (tsPathRef.current && tsPathString) {
        const length = tsPathRef.current.getTotalLength();
        if (length > 0) {
          setTsPathLength(length);
        }
      }
      if (ftPerFgaPathRef.current && ftPerFgaPathString) {
        const length = ftPerFgaPathRef.current.getTotalLength();
        if (length > 0) {
          setFtPerFgaPathLength(length);
        }
      }
      if (orbPathRef.current && orbPathString) {
        const length = orbPathRef.current.getTotalLength();
        if (length > 0) {
          setOrbPathLength(length);
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      calculateLengths();
    });
  }, [efgPathString, tsPathString, ftPerFgaPathString, orbPathString]);

  // Animate line drawing
  useEffect(() => {
    if (!isVisible) {
      setLineProgress(0);
      setContainerOpacity(0);
      return;
    }

    // Fade in container
    containerAnimationRef.current = requestAnimationFrame(() => {
      setContainerOpacity(1);
    });

    // Animate line drawing
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setLineProgress(eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerAnimationRef.current) {
        cancelAnimationFrame(containerAnimationRef.current);
      }
    };
  }, [isVisible, normalizedData.length]);

  const getStrokeDashoffset = (pathLength) => pathLength * (1 - lineProgress);

  // Handle mouse events
  const handleMouseMove = (event) => {
    if (!xScale) return;
    
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x - margin.left);
    
    if (x0 === undefined || isNaN(x0)) return;
    
    const index = bisectYear(normalizedData, x0, 1);
    const d0 = normalizedData[index - 1];
    const d1 = normalizedData[index];
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
    
    // Position tooltip at middle of the four lines
    const avgY = (
      yScale(d.normalizedEfg) + 
      yScale(d.normalizedTs) + 
      yScale(d.normalizedFtPerFga) + 
      yScale(d.normalizedOrb)
    ) / 4;
    showTooltip({
      tooltipData: d,
      tooltipLeft: x,
      tooltipTop: avgY + margin.top,
    });
  };

  if (!normalizedData || normalizedData.length === 0 || !xScale || !yScale) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center items-center" style={{ opacity: containerOpacity }}>
      <svg 
        width={width} 
        height={height} 
        className="overflow-visible" 
        style={{ maxWidth: '100%', height: 'auto' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={hideTooltip}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="white"
          rx={8}
        />
        
        {/* Grid */}
        <g transform={`translate(${margin.left},${margin.top})`}>
          <GridRows
            scale={yScale}
            width={xMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
            strokeOpacity={0.6}
            pointerEvents="none"
          />
          <GridColumns
            scale={xScale}
            height={yMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
            strokeOpacity={0.6}
            pointerEvents="none"
          />
          
          {/* Animated Smooth Curved Lines */}
          {efgPathString && (
            <path
              ref={efgPathRef}
              d={efgPathString}
              fill="none"
              stroke={METRIC_COLORS.efg}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={efgPathLength || undefined}
              strokeDashoffset={efgPathLength ? getStrokeDashoffset(efgPathLength) : efgPathLength}
            />
          )}
          {tsPathString && (
            <path
              ref={tsPathRef}
              d={tsPathString}
              fill="none"
              stroke={METRIC_COLORS.ts}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={tsPathLength || undefined}
              strokeDashoffset={tsPathLength ? getStrokeDashoffset(tsPathLength) : tsPathLength}
            />
          )}
          {ftPerFgaPathString && (
            <path
              ref={ftPerFgaPathRef}
              d={ftPerFgaPathString}
              fill="none"
              stroke={METRIC_COLORS.ftPerFga}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={ftPerFgaPathLength || undefined}
              strokeDashoffset={ftPerFgaPathLength ? getStrokeDashoffset(ftPerFgaPathLength) : ftPerFgaPathLength}
            />
          )}
          {orbPathString && (
            <path
              ref={orbPathRef}
              d={orbPathString}
              fill="none"
              stroke={METRIC_COLORS.orb}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={orbPathLength || undefined}
              strokeDashoffset={orbPathLength ? getStrokeDashoffset(orbPathLength) : orbPathLength}
            />
          )}

          {/* Data points on lines - animate from left to right */}
          {lineProgress >= 1 && normalizedData.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(d.year)}
                cy={yScale(d.normalizedEfg)}
                r={4}
                fill={METRIC_COLORS.efg}
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
                cy={yScale(d.normalizedTs)}
                r={4}
                fill={METRIC_COLORS.ts}
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
                cy={yScale(d.normalizedFtPerFga)}
                r={4}
                fill={METRIC_COLORS.ftPerFga}
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
                cy={yScale(d.normalizedOrb)}
                r={4}
                fill={METRIC_COLORS.orb}
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

          {/* Crosshair on hover */}
          {tooltipOpen && tooltipData && (
            <>
              {/* Vertical crosshair line */}
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
              {/* Highlighted data points at crosshair */}
              <circle
                cx={xScale(tooltipData.year)}
                cy={yScale(tooltipData.normalizedEfg)}
                r={6}
                fill={METRIC_COLORS.efg}
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))' }}
              />
              <circle
                cx={xScale(tooltipData.year)}
                cy={yScale(tooltipData.normalizedTs)}
                r={6}
                fill={METRIC_COLORS.ts}
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))' }}
              />
              <circle
                cx={xScale(tooltipData.year)}
                cy={yScale(tooltipData.normalizedFtPerFga)}
                r={6}
                fill={METRIC_COLORS.ftPerFga}
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))' }}
              />
              <circle
                cx={xScale(tooltipData.year)}
                cy={yScale(tooltipData.normalizedOrb)}
                r={6}
                fill={METRIC_COLORS.orb}
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.4))' }}
              />
            </>
          )}

          {/* Axes */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            numTicks={width > 600 ? 10 : 5}
            stroke="#374151"
            strokeWidth={1}
            tickStroke="#374151"
            tickLabelProps={() => ({
              fill: '#6b7280',
              fontSize: 11,
              textAnchor: 'middle',
            })}
            tickFormat={(d) => `${Math.round(d)}`}
          />
          <AxisLeft
            left={0}
            scale={yScale}
            numTicks={6}
            stroke="#374151"
            strokeWidth={1}
            tickStroke="#374151"
            tickLabelProps={() => ({
              fill: '#6b7280',
              fontSize: 11,
              textAnchor: 'end',
              dx: -10,
            })}
            tickFormat={(d) => `${Math.round(d)}`}
          />

          {/* Axis Labels */}
          <text
            x={xMax / 2}
            y={yMax + margin.bottom + 5}
            textAnchor="middle"
            fill="#374151"
            fontSize={14}
            fontWeight="500"
          >
            Season
          </text>
          <text
            x={-margin.left / 2 - 20}
            y={yMax / 2}
            textAnchor="middle"
            fill="#374151"
            fontSize={14}
            fontWeight="500"
            transform={`rotate(-90, ${-margin.left / 2 - 20}, ${yMax / 2})`}
          >
            Normalized Value (1980 = 100)
          </text>
        </g>
      </svg>

      {/* Legend - centered vertically */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: METRIC_COLORS.efg }} />
            <span className="text-gray-700">eFG%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: METRIC_COLORS.ts }} />
            <span className="text-gray-700">TS%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: METRIC_COLORS.ftPerFga }} />
            <span className="text-gray-700">FT/FGA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: METRIC_COLORS.orb }} />
            <span className="text-gray-700">ORB%</span>
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
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="font-semibold mb-1">{tooltipData.season}</div>
            <div style={{ color: METRIC_COLORS.efg }}>
              eFG%: {tooltipData.normalizedEfg.toFixed(1)}
            </div>
            <div style={{ color: METRIC_COLORS.ts }}>
              TS%: {tooltipData.normalizedTs.toFixed(1)}
            </div>
            <div style={{ color: METRIC_COLORS.ftPerFga }}>
              FT/FGA: {tooltipData.normalizedFtPerFga.toFixed(1)}
            </div>
            <div style={{ color: METRIC_COLORS.orb }}>
              ORB%: {tooltipData.normalizedOrb.toFixed(1)}
            </div>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

