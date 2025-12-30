import { useMemo, useState, useEffect, useRef } from 'react';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import { line, curveMonotoneX as d3CurveMonotoneX } from 'd3';

// Chart dimensions
const defaultMargin = { top: 20, right: 20, bottom: 40, left: 60 };

const bisectYear = bisector((d) => d.year).left;

export default function FTPercentChart({ data, width = 800, height = 400, margin = defaultMargin, isVisible = false }) {
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

  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(
    () => {
      if (!data || data.length === 0) return null;
      return scaleLinear({
        range: [0, xMax],
        domain: [Math.min(...data.map(d => d.year)), Math.max(...data.map(d => d.year))],
        nice: true,
      });
    },
    [xMax, data]
  );

  const yScale = useMemo(
    () => {
      if (!data || data.length === 0) return null;
      // Find min and max across all three metrics
      const allValues = [
        ...data.map(d => d.fgPercent),
        ...data.map(d => d.ftPercent),
        ...data.map(d => d.tsPercent)
      ];
      return scaleLinear({
        range: [yMax, 0],
        domain: [
          Math.min(...allValues) - 2,
          Math.max(...allValues) + 2,
        ],
        nice: true,
      });
    },
    [yMax, data]
  );

  // Generate smooth curved path strings for animation - one for each metric
  const ftPathRef = useRef(null);
  const fgPathRef = useRef(null);
  const tsPathRef = useRef(null);
  const [ftPathLength, setFtPathLength] = useState(0);
  const [fgPathLength, setFgPathLength] = useState(0);
  const [tsPathLength, setTsPathLength] = useState(0);

  // Generate smooth curved paths using d3's line generator with curveMonotoneX
  const generateCurvedPath = (getValue) => {
    if (!xScale || !yScale || !data || data.length === 0) return '';
    
    const lineGenerator = line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(getValue(d)))
      .curve(d3CurveMonotoneX);
    
    return lineGenerator(data) || '';
  };

  const ftPathString = useMemo(() => generateCurvedPath(d => d.ftPercent), [xScale, yScale, data]);
  const fgPathString = useMemo(() => generateCurvedPath(d => d.fgPercent), [xScale, yScale, data]);
  const tsPathString = useMemo(() => generateCurvedPath(d => d.tsPercent), [xScale, yScale, data]);

  useEffect(() => {
    // Calculate path lengths when paths are available
    const calculateLengths = () => {
      if (ftPathRef.current && ftPathString) {
        const length = ftPathRef.current.getTotalLength();
        if (length > 0) {
          setFtPathLength(length);
        }
      }
      if (fgPathRef.current && fgPathString) {
        const length = fgPathRef.current.getTotalLength();
        if (length > 0) {
          setFgPathLength(length);
        }
      }
      if (tsPathRef.current && tsPathString) {
        const length = tsPathRef.current.getTotalLength();
        if (length > 0) {
          setTsPathLength(length);
        }
      }
    };

    // Calculate immediately
    calculateLengths();
    
    // Also calculate after a short delay to ensure paths are rendered
    const timer = setTimeout(calculateLengths, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [ftPathString, fgPathString, tsPathString]);

  // Animate line when visible - same approach as SeparatedCharts
  // Animate container fade-in (1 second)
  useEffect(() => {
    if (isVisible && data.length > 0) {
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
  }, [isVisible, data.length]);

  // Animate line drawing (2 seconds) - starts after container fade-in begins
  useEffect(() => {
    if (isVisible && data.length > 0) {
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
  }, [isVisible, data.length]);


  const getStrokeDashoffset = (pathLength) => pathLength * (1 - lineProgress);

  // Handle mouse events
  const handleMouseMove = (event) => {
    if (!xScale) return;
    
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x - margin.left);
    
    if (x0 === undefined || isNaN(x0)) return;
    
    const index = bisectYear(data, x0, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
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
    
    // Position tooltip at middle of the three lines
    const avgY = (yScale(d.fgPercent) + yScale(d.ftPercent) + yScale(d.tsPercent)) / 3;
    showTooltip({
      tooltipData: d,
      tooltipLeft: x,
      tooltipTop: avgY + margin.top,
    });
  };

  if (!data || data.length === 0 || !xScale || !yScale) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center items-center" style={{ opacity: containerOpacity }}>
      <svg width={width} height={height} className="overflow-visible" style={{ maxWidth: '100%', height: 'auto' }}>
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
          
          {/* Animated Smooth Curved Lines - FT% (Blue), FG% (Green), TS% (Orange) */}
          {ftPathString && (
            <path
              ref={ftPathRef}
              d={ftPathString}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={ftPathLength || undefined}
              strokeDashoffset={ftPathLength ? getStrokeDashoffset(ftPathLength) : ftPathLength}
            />
          )}
          {fgPathString && (
            <path
              ref={fgPathRef}
              d={fgPathString}
              fill="none"
              stroke="#10b981"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={fgPathLength || undefined}
              strokeDashoffset={fgPathLength ? getStrokeDashoffset(fgPathLength) : fgPathLength}
            />
          )}
          {tsPathString && (
            <path
              ref={tsPathRef}
              d={tsPathString}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={tsPathLength || undefined}
              strokeDashoffset={tsPathLength ? getStrokeDashoffset(tsPathLength) : tsPathLength}
            />
          )}

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
                cy={yScale(tooltipData.ftPercent)}
                r={6}
                fill="#3b82f6"
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))' }}
              />
              <circle
                cx={xScale(tooltipData.year)}
                cy={yScale(tooltipData.fgPercent)}
                r={6}
                fill="#10b981"
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))' }}
              />
              <circle
                cx={xScale(tooltipData.year)}
                cy={yScale(tooltipData.tsPercent)}
                r={6}
                fill="#f59e0b"
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))' }}
              />
            </>
          )}
          
          {/* Data points - only show after line animation is complete */}
          {lineProgress >= 1 && data.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(d.year)}
                cy={yScale(d.ftPercent)}
                r={4}
                fill="#3b82f6"
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
                cy={yScale(d.fgPercent)}
                r={4}
                fill="#10b981"
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
                cy={yScale(d.tsPercent)}
                r={4}
                fill="#f59e0b"
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
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#3b82f6]"></div>
            <span className="text-gray-700">FT%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#10b981]"></div>
            <span className="text-gray-700">FG%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#f59e0b]"></div>
            <span className="text-gray-700">TS%</span>
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
          <div className="text-blue-300">
            FT%: {tooltipData.ftPercent.toFixed(1)}%
          </div>
          <div className="text-green-300">
            FG%: {tooltipData.fgPercent.toFixed(1)}%
          </div>
          <div className="text-orange-300">
            TS%: {tooltipData.tsPercent.toFixed(1)}%
          </div>
        </Tooltip>
      )}
    </div>
  );
}
