import { useMemo, useState, useEffect, useRef } from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

const defaultMargin = { top: 40, right: 20, bottom: 60, left: 60 };

export default function LollipopChart({ 
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

  const [containerOpacity, setContainerOpacity] = useState(0);
  const containerAnimationRef = useRef(null);

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

  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(
    () => {
      if (!data || data.length === 0) return null;
      return scaleBand({
        range: [0, xMax],
        domain: data.map(d => d.season),
        padding: 0.2,
      });
    },
    [xMax, data]
  );

  const yScale = useMemo(
    () => {
      if (!data || data.length === 0) return null;
      const maxCount = Math.max(...data.map(d => d.count), 0);
      return scaleLinear({
        range: [yMax, 0],
        domain: [0, Math.max(maxCount * 1.1, 10)],
        nice: true,
      });
    },
    [yMax, data]
  );

  // Color scale: red (lowest) to blue (highest)
  const colorScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    const counts = data.map(d => d.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    
    return scaleLinear({
      range: [0, 1],
      domain: [minCount, maxCount],
    });
  }, [data]);

  // Function to interpolate color from red to blue
  const getColor = (count) => {
    if (!colorScale) return "#3b82f6"; // Default blue
    
    const t = colorScale(count); // t is between 0 and 1
    // Interpolate from red (#ef4444 = rgb(239, 68, 68)) to blue (#3b82f6 = rgb(59, 130, 246))
    const red = Math.round(239 - (239 - 59) * t); // 239 (red) to 59 (blue)
    const green = Math.round(68 + (130 - 68) * t); // 68 (red) to 130 (blue)
    const blue = Math.round(68 + (246 - 68) * t); // 68 (red) to 246 (blue)
    
    return `rgb(${red}, ${green}, ${blue})`;
  };

  if (!data || data.length === 0 || !xScale || !yScale) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  const handleMouseMove = (event, datum) => {
    const coords = localPoint(event);
    if (coords) {
      showTooltip({
        tooltipLeft: coords.x,
        tooltipTop: coords.y,
        tooltipData: datum,
      });
    }
  };

  return (
    <div className="relative" style={{ opacity: containerOpacity }}>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid */}
          <GridRows
            scale={yScale}
            width={xMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
            strokeOpacity={0.5}
          />

          {/* Lollipop sticks and circles */}
          {data.map((d, i) => {
            const x = xScale(d.season);
            const y = yScale(d.count);
            const barHeight = yMax - y;
            const circleRadius = 8;
            const circleColor = getColor(d.count);
            
            if (x === undefined) return null;
            
            return (
              <g key={d.season}>
                {/* Stick */}
                <line
                  x1={x + xScale.bandwidth() / 2}
                  y1={yMax}
                  x2={x + xScale.bandwidth() / 2}
                  y2={y}
                  stroke={circleColor}
                  strokeWidth={2}
                  opacity={containerOpacity}
                />
                
                {/* Circle */}
                <circle
                  cx={x + xScale.bandwidth() / 2}
                  cy={y}
                  r={circleRadius}
                  fill={circleColor}
                  stroke={circleColor}
                  strokeWidth={2}
                  opacity={containerOpacity}
                  style={{
                    cursor: 'pointer',
                  }}
                  onMouseMove={(e) => handleMouseMove(e, d)}
                  onMouseLeave={hideTooltip}
                />
              </g>
            );
          })}

          {/* Axes */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="#6b7280"
            tickStroke="#6b7280"
            tickLabelProps={{
              fill: '#6b7280',
              fontSize: 11,
              textAnchor: 'middle',
              angle: -45,
              dx: -10,
              dy: 5,
            }}
            numTicks={data.length > 20 ? 20 : data.length}
          />
          
          <AxisLeft
            scale={yScale}
            stroke="#6b7280"
            tickStroke="#6b7280"
            tickLabelProps={{
              fill: '#6b7280',
              fontSize: 11,
              textAnchor: 'end',
              dx: -5,
            }}
          />

          {/* Axis Labels */}
          <text
            x={xMax / 2}
            y={yMax + margin.bottom - 5}
            textAnchor="middle"
            fill="#374151"
            fontSize={14}
            fontWeight="500"
          >
            Season
          </text>
          <text
            x={-margin.left / 2}
            y={yMax / 2}
            textAnchor="middle"
            fill="#374151"
            fontSize={14}
            fontWeight="500"
            transform={`rotate(-90, ${-margin.left / 2}, ${yMax / 2})`}
          >
            Number of Players
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <Tooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {tooltipData.season}
            </div>
            <div>
              {tooltipData.count} {tooltipData.count === 1 ? 'player' : 'players'}
            </div>
            <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>
              &gt;25 pts, &gt;5 reb, &gt;5 ast
            </div>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

