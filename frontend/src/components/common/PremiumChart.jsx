import React from 'react';

export default function PremiumChart({ type = 'line', data = [], height = 200, color = 'brand' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-brand-50/50 rounded-xl border border-dashed border-brand-200">
        <span className="text-xs text-brand-800">No chart data available</span>
      </div>
    );
  }

  // Common SVG layout parameters
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 25;

  const colorMaps = {
    brand: {
      stroke: '#2d8f66',
      fillStart: 'rgba(45, 143, 102, 0.4)',
      fillStop: 'rgba(45, 143, 102, 0.0)'
    },
    accent: {
      stroke: '#b59560',
      fillStart: 'rgba(181, 149, 96, 0.4)',
      fillStop: 'rgba(181, 149, 96, 0.0)'
    },
    red: {
      stroke: '#dc2626',
      fillStart: 'rgba(220, 38, 38, 0.4)',
      fillStop: 'rgba(220, 38, 38, 0.0)'
    }
  };

  const scheme = colorMaps[color] || colorMaps.brand;

  // 1. Line Chart Implementation
  if (type === 'line') {
    const values = data.map(d => d.value || d.score || 0);
    const labels = data.map(d => d.label || d.date || '');
    
    const maxVal = Math.max(...values, 100);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal;
    
    // Width is responsive so we use a viewBox representation
    const viewWidth = 500;
    const viewHeight = height;
    
    const chartWidth = viewWidth - paddingLeft - paddingRight;
    const chartHeight = viewHeight - paddingTop - paddingBottom;
    
    // Map data indices to coordinates
    const points = values.map((val, idx) => {
      const x = paddingLeft + (idx / (values.length - 1)) * chartWidth;
      // Invert Y axis for SVG orientation
      const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
      return { x, y, value: val, label: labels[idx] };
    });
    
    // Generate SVG path strings
    const pathString = points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaString = `${pathString} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

    return (
      <div className="relative w-full">
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scheme.stroke} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={scheme.stroke} stopOpacity="0.0"/>
            </linearGradient>
          </defs>
          
          {/* Y Axis Grid lines (4 divisions) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const gridVal = Math.round(maxVal - ratio * range);
            return (
              <g key={idx} className="opacity-40">
                <line x1={paddingLeft} y1={y} x2={viewWidth - paddingRight} y2={y} stroke="#ede7d5" strokeWidth="0.75" strokeDasharray="3 3"/>
                <text x={paddingLeft - 5} y={y + 3} textAnchor="end" className="fill-brand-800 text-[10px] font-medium font-sans">
                  {gridVal}
                </text>
              </g>
            );
          })}
          
          {/* Shaded Area Under Curve */}
          <path d={areaString} fill={`url(#gradient-${color})`} />
          
          {/* The Stroke Line */}
          <path d={pathString} fill="none" stroke={scheme.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Intersections (Data points circles) */}
          {points.map((pt, idx) => (
            <g key={idx} className="group/node">
              <circle cx={pt.x} cy={pt.y} r="3.5" fill="white" stroke={scheme.stroke} strokeWidth="2.5" className="transition-all duration-200 hover:r-5 cursor-pointer" />
              {/* Tooltip Overlay */}
              <g className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect x={pt.x - 20} y={pt.y - 25} width="40" height="18" rx="4" fill="#0d291f" />
                <text x={pt.x} y={pt.y - 13} textAnchor="middle" className="fill-white text-[9px] font-bold font-sans">
                  {pt.value}
                </text>
              </g>
            </g>
          ))}
          
          {/* X Axis Labels */}
          {points.map((pt, idx) => (
            <text key={idx} x={pt.x} y={viewHeight - 5} textAnchor="middle" className="fill-brand-850 text-[9px] font-semibold font-display">
              {pt.label}
            </text>
          ))}
        </svg>
      </div>
    );
  }

  // 2. Bar Chart Implementation
  if (type === 'bar') {
    const values = data.map(d => d.value || d.count || 0);
    const labels = data.map(d => d.label || d.day || '');
    
    const maxVal = Math.max(...values, 10);
    
    const viewWidth = 500;
    const viewHeight = height;
    
    const chartWidth = viewWidth - paddingLeft - paddingRight;
    const chartHeight = viewHeight - paddingTop - paddingBottom;
    
    const numBars = values.length;
    const colWidth = chartWidth / numBars;
    const barWidth = colWidth * 0.55;

    return (
      <div className="relative w-full">
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const gridVal = Math.round(maxVal - ratio * maxVal);
            return (
              <g key={idx} className="opacity-40">
                <line x1={paddingLeft} y1={y} x2={viewWidth - paddingRight} y2={y} stroke="#ede7d5" strokeWidth="0.75" strokeDasharray="3 3"/>
                <text x={paddingLeft - 5} y={y + 3} textAnchor="end" className="fill-brand-800 text-[10px] font-medium font-sans">
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {values.map((val, idx) => {
            const barHeight = (val / maxVal) * chartHeight;
            const x = paddingLeft + idx * colWidth + (colWidth - barWidth) / 2;
            const y = paddingTop + chartHeight - barHeight;

            return (
              <g key={idx} className="group/bar">
                {/* Rounded Bar */}
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  rx="4" 
                  fill={scheme.stroke} 
                  className="opacity-90 hover:opacity-100 hover:fill-brand-700 transition-all duration-200 cursor-pointer" 
                />
                
                {/* Hover value indicator */}
                <text 
                  x={x + barWidth / 2} 
                  y={y - 5} 
                  textAnchor="middle" 
                  className="opacity-0 group-hover/bar:opacity-100 transition-opacity fill-brand-950 font-bold text-[10px] font-sans"
                >
                  {val}
                </text>

                {/* X Label */}
                <text 
                  x={x + barWidth / 2} 
                  y={viewHeight - 5} 
                  textAnchor="middle" 
                  className="fill-brand-850 text-[9px] font-semibold font-display"
                >
                  {labels[idx]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // 3. Donut / Pie Chart Implementation
  if (type === 'donut') {
    const total = data.reduce((acc, curr) => acc + (curr.value || curr.percentage || 0), 0);
    const viewSize = 200;
    const center = viewSize / 2;
    const radius = 60;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercentage = 0;

    const colors = [
      '#2d8f66', // Brand Green
      '#b59560', // Gold/Sand Accent
      '#dc2626', // Red
      '#2563eb', // Blue
      '#8b5cf6'  // Purple
    ];

    return (
      <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
        {/* SVG Circle Graph */}
        <div className="relative w-36 h-36">
          <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full h-full -rotate-90">
            {/* Background base ring */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
            
            {data.map((item, idx) => {
              const val = item.value || item.percentage || 0;
              const ratio = val / total;
              const strokeLength = ratio * circumference;
              const strokeOffset = circumference - (accumulatedPercentage / total) * circumference;
              
              accumulatedPercentage += val;
              const colorHex = colors[idx % colors.length];

              return (
                <circle 
                  key={idx}
                  cx={center} 
                  cy={center} 
                  r={radius} 
                  fill="none" 
                  stroke={colorHex} 
                  strokeWidth={strokeWidth} 
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:stroke-[16px] cursor-pointer"
                />
              );
            })}
          </svg>
          {/* Core Display Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center font-display">
            <span className="text-[10px] uppercase font-bold text-brand-800">Total Cases</span>
            <span className="text-xl font-extrabold text-brand-950">{total}</span>
          </div>
        </div>

        {/* Legend Box */}
        <div className="space-y-2 font-sans text-xs">
          {data.map((item, idx) => {
            const colorHex = colors[idx % colors.length];
            const val = item.value || item.percentage || 0;
            const pct = Math.round((val / total) * 100);
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
                <span className="text-brand-900 font-medium truncate max-w-[120px]">
                  {item.label || item.condition || ''}
                </span>
                <span className="text-brand-800 font-bold ml-auto">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
