import { useMemo, useState, useEffect, useRef } from 'react';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import { line, curveMonotoneX as d3CurveMonotoneX } from 'd3';

const defaultMargin = { top: 40, right: 20, bottom: 60, left: 60 };
const bisectYear = bisector((d) => d.year).left;

const TEAM_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
];

export default function TopTeamsUsageChart({ 
  data, 
  width = 800, 
  height = 500, 
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
  const pathRefs = useRef({});
  const [pathLengths, setPathLengths] = useState({});

  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Get all years from all teams
  const allYears = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = new Set();
    data.forEach(team => {
      team.data.forEach(d => years.add(d.year));
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [data]);

  // Scales
  const xScale = useMemo(() => {
    if (allYears.length === 0) return null;
    return scaleLinear({
      range: [0, xMax],
      domain: [Math.min(...allYears), Math.max(...allYears)],
      nice: true,
    });
  }, [xMax, allYears]);

  const yScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    const allValues = data.flatMap(team => team.data.map(d => d.usage));
    const maxUsage = Math.max(...allValues);
    const minUsage = Math.min(...allValues);
    return scaleLinear({
      range: [yMax, 0],
      domain: [Math.max(0, minUsage - 2), maxUsage + 2],
      nice: true,
    });
  }, [yMax, data]);

  // Generate line paths for each team
  const pathStrings = useMemo(() => {
    if (!xScale || !yScale || !data || data.length === 0) return {};
    
    const paths = {};
    data.forEach((team, idx) => {
      if (team.data.length === 0) return;
      const lineGenerator = line()
        .x((d) => xScale(d.year))
        .y((d) => yScale(d.usage))
        .curve(d3CurveMonotoneX);
      paths[team.team] = lineGenerator(team.data) || '';
    });
    return paths;
  }, [xScale, yScale, data]);

  useEffect(() => {
    const lengths = {};
    Object.entries(pathRefs.current).forEach(([team, ref]) => {
      if (ref && ref.current) {
        const length = ref.current.getTotalLength();
        if (length > 0) {
          lengths[team] = length;
        }
      }
    });
    setPathLengths(lengths);
  }, [pathStrings]);

  // Animate when visible
  useEffect(() => {
    if (isVisible && data.length > 0) {
      setContainerOpacity(0);
      setLineProgress(0);
      
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setContainerOpacity(progress);

        if (progress < 1) {
          containerAnimationRef.current = requestAnimationFrame(animate);
        } else {
          setContainerOpacity(1);
          // Animate lines after container
          const lineDuration = 2000;
          const lineStartTime = Date.now();
          
          const animateLine = () => {
            const lineElapsed = Date.now() - lineStartTime;
            const lineProgress = Math.min(lineElapsed / lineDuration, 1);
            setLineProgress(lineProgress);

            if (lineProgress < 1) {
              animationRef.current = requestAnimationFrame(animateLine);
            }
          };
          
          animationRef.current = requestAnimationFrame(animateLine);
        }
      };

      containerAnimationRef.current = requestAnimationFrame(animate);

      return () => {
        if (containerAnimationRef.current) {
          cancelAnimationFrame(containerAnimationRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else if (!isVisible) {
      setContainerOpacity(0);
      setLineProgress(0);
    }
  }, [isVisible, data.length]);

  // Handle mouse events
  const handleMouseMove = (event) => {
    if (!xScale || !data || data.length === 0) return;
    
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x - margin.left);
    
    if (x0 === undefined || isNaN(x0)) return;
    
    // Find closest data point across all teams
    let closestData = null;
    let minDistance = Infinity;
    
    data.forEach(team => {
      const index = bisectYear(team.data, x0, 1);
      const d0 = team.data[index - 1];
      const d1 = team.data[index];
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
      
      const distance = Math.abs(x0 - d.year);
      if (distance < minDistance) {
        minDistance = distance;
        closestData = { ...d, team: team.team };
      }
    });
    
    if (closestData) {
      showTooltip({
        tooltipData: closestData,
        tooltipLeft: x,
        tooltipTop: yScale(closestData.usage) + margin.top,
      });
    }
  };

  if (!data || data.length === 0 || !xScale || !yScale) {
    return null;
  }

  return (
    <div style={{ opacity: containerOpacity }}>
      <svg width={width} height={height} className="overflow-visible">
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="white"
          rx={8}
        />
        
        <g transform={`translate(${margin.left},${margin.top})`}>
          <GridRows
            scale={yScale}
            width={xMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
            strokeOpacity={0.6}
            pointerEvents="none"
          />
          
          {/* Lines for each team */}
          {data.map((team, idx) => {
            const pathString = pathStrings[team.team];
            if (!pathString) return null;
            
            const pathLength = pathLengths[team.team] || 0;
            const strokeDashoffset = pathLength * (1 - lineProgress);
            const color = TEAM_COLORS[idx % TEAM_COLORS.length];
            
            return (
              <g key={team.team}>
                <path
                  ref={(el) => {
                    if (el) pathRefs.current[team.team] = { current: el };
                  }}
                  d={pathString}
                  fill="none"
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={strokeDashoffset}
                />
                
                {/* Data points */}
                {lineProgress >= 1 && team.data.map((d, i) => (
                  <circle
                    key={i}
                    cx={xScale(d.year)}
                    cy={yScale(d.usage)}
                    r={4}
                    fill={color}
                    stroke="white"
                    strokeWidth={2}
                    style={{ 
                      opacity: 0,
                      animation: 'fadeIn 0.3s ease-in forwards',
                      animationDelay: `${(idx * team.data.length + i) * 0.01}s`
                    }}
                  />
                ))}
              </g>
            );
          })}
          
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
              {data.map((team, idx) => {
                if (team.team !== tooltipData.team) return null;
                const color = TEAM_COLORS[idx % TEAM_COLORS.length];
                const teamData = team.data.find(d => d.year === tooltipData.year);
                if (!teamData) return null;
                return (
                  <circle
                    key={team.team}
                    cx={xScale(tooltipData.year)}
                    cy={yScale(teamData.usage)}
                    r={6}
                    fill={color}
                    stroke="white"
                    strokeWidth={3}
                    opacity={0.9}
                    pointerEvents="none"
                  />
                );
              })}
            </>
          )}
          
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
            numTicks={width > 400 ? 8 : 5}
          />
        </g>
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        {data.map((team, idx) => {
          const color = TEAM_COLORS[idx % TEAM_COLORS.length];
          return (
            <div key={team.team} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-700">{team.team}</span>
            </div>
          );
        })}
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
          <div className="font-semibold mb-1">{tooltipData.team}</div>
          <div className="text-xs text-gray-300 mb-1">Year: {tooltipData.year}</div>
          <div>Usage: {tooltipData.usage.toFixed(1)}%</div>
        </Tooltip>
      )}
    </div>
  );
}

