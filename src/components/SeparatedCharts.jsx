import { useMemo, useState, useEffect, useRef } from 'react';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import { line, curveMonotoneX as d3CurveMonotoneX } from 'd3';

const defaultMargin = { top: 40, right: 20, bottom: 40, left: 60 };
const bisectYear = bisector((d) => d.year).left;

// Single metric chart component
function SingleMetricChart({ 
  data, 
  width,
  chartWidth,
  height, 
  margin, 
  getValue, 
  color, 
  title,
  separationProgress,
  chartIndex,
  totalCharts
}) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);

  // Bounds
  const xMax = chartWidth - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales for separated chart
  const xScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    return scaleLinear({
      range: [0, xMax],
      domain: [Math.min(...data.map(d => d.year)), Math.max(...data.map(d => d.year))],
      nice: true,
    });
  }, [xMax, data]);

  const yScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    const values = data.map(d => getValue(d));
    return scaleLinear({
      range: [yMax, 0],
      domain: [
        Math.min(...values) - 2,
        Math.max(...values) + 2,
      ],
      nice: true,
    });
  }, [yMax, data, getValue]);

  // Generate curved path
  const pathString = useMemo(() => {
    if (!xScale || !yScale || !data || data.length === 0) return '';
    const lineGenerator = line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(getValue(d)))
      .curve(d3CurveMonotoneX);
    return lineGenerator(data) || '';
  }, [xScale, yScale, data, getValue]);

  useEffect(() => {
    if (pathRef.current && pathString) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathString]);

  // Animate line drawing when chart becomes visible
  useEffect(() => {
    if (separationProgress > 0) {
      setLineProgress(0);
      const duration = 2000; // 2 seconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setLineProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [separationProgress]);


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
    
    showTooltip({
      tooltipData: d,
      tooltipLeft: x,
      tooltipTop: yScale(getValue(d)) + margin.top,
    });
  };

  if (!data || data.length === 0 || !xScale || !yScale) {
    return null;
  }

  const strokeDashoffset = pathLength * (1 - lineProgress);

  return (
    <div 
      className="relative" 
      style={{ 
        width: `${chartWidth}px`,
        opacity: separationProgress
      }}
    >
      <svg width={chartWidth} height={height} className="overflow-visible" style={{ maxWidth: '100%', height: 'auto' }}>
        <rect
          x={0}
          y={0}
          width={chartWidth}
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
          <GridColumns
            scale={xScale}
            height={yMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
            strokeOpacity={0.6}
            pointerEvents="none"
          />
          
          {/* Animated line */}
          {pathString && (
            <path
              ref={pathRef}
              d={pathString}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.1s' }}
            />
          )}
          
          {/* Data points - only show after line animation is complete */}
          {lineProgress >= 1 && data.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.year)}
              cy={yScale(getValue(d))}
              r={4}
              fill={color}
              stroke="white"
              strokeWidth={2}
              className="cursor-pointer"
              style={{ 
                opacity: 0,
                animation: 'fadeIn 0.3s ease-in forwards',
                animationDelay: `${i * 0.02}s`
              }}
            />
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
              {/* Highlighted data point at crosshair */}
              <circle
                cx={xScale(tooltipData.year)}
                cy={yScale(getValue(tooltipData))}
                r={6}
                fill={color}
                stroke="white"
                strokeWidth={3}
                opacity={0.9}
                pointerEvents="none"
                style={{ filter: `drop-shadow(0 2px 4px ${color}40)` }}
              />
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

      {/* Chart title */}
      <div className="text-center mt-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
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
          <div style={{ color }}>
            {title}: {getValue(tooltipData).toFixed(1)}%
          </div>
        </Tooltip>
      )}
    </div>
  );
}

export default function SeparatedCharts({ 
  data, 
  width, 
  height, 
  isVisible
}) {
  const [separationProgress, setSeparationProgress] = useState(0);

  // Filter data to 1999+
  const filteredData = useMemo(() => {
    return data.filter(d => d.year >= 1999);
  }, [data]);

  // Calculate individual chart width - make them larger to fit screen
  const spacing = 40;
  const totalSpacing = spacing * 2; // spacing between 3 charts
  const availableWidth = width - (spacing * 2);
  const chartWidth = Math.floor(availableWidth / 3);

  // Animate separation when visible
  useEffect(() => {
    console.log('🎬 SeparatedCharts animation effect - isVisible:', isVisible);
    
    if (isVisible) {
      console.log('✅ Starting separation animation');
      setSeparationProgress(0);
      const duration = 1000; // 1 second for container fade-in
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setSeparationProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log('✅ Separation animation complete');
        }
      };

      requestAnimationFrame(animate);
    } else {
      console.log('⏸️ Animation not starting - isVisible is false');
    }
  }, [isVisible]);

  const chartConfigs = [
    {
      getValue: (d) => d.ftPercent,
      color: '#3b82f6',
      title: 'Free Throw %'
    },
    {
      getValue: (d) => d.fgPercent,
      color: '#10b981',
      title: 'Field Goal %'
    },
    {
      getValue: (d) => d.tsPercent,
      color: '#f59e0b',
      title: 'True Shooting %'
    }
  ];

  if (!filteredData || filteredData.length === 0) {
    return null;
  }

  return (
    <div 
      className="w-full flex justify-center items-start px-4"
      style={{
        opacity: separationProgress > 0 ? 1 : 0,
        gap: `${spacing}px`
      }}
    >
      {chartConfigs.map((config, index) => (
        <SingleMetricChart
          key={index}
          data={filteredData}
          width={width}
          chartWidth={chartWidth}
          height={height}
          margin={defaultMargin}
          getValue={config.getValue}
          color={config.color}
          title={config.title}
          separationProgress={separationProgress}
          chartIndex={index}
          totalCharts={3}
        />
      ))}
    </div>
  );
}

