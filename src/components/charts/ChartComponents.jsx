// src/components/charts/ChartComponents.jsx

import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Default color palette
const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center text-sm">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 mr-2">{entry.name}:</span>
          <span className="font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Line Chart Component
export const AdvancedLineChart = ({ 
  data, 
  xKey, 
  lines = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis 
          dataKey={xKey} 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color || COLORS[index % COLORS.length]}
            strokeWidth={line.strokeWidth || 2}
            name={line.name || line.dataKey}
            dot={line.showDots !== false}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Bar Chart Component
export const AdvancedBarChart = ({ 
  data, 
  xKey, 
  bars = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  stacked = false
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis 
          dataKey={xKey} 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color || COLORS[index % COLORS.length]}
            name={bar.name || bar.dataKey}
            stackId={stacked ? 'stack' : undefined}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// Pie Chart Component
export const AdvancedPieChart = ({ 
  data, 
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  colors = COLORS
}) => {
  const RADIAN = Math.PI / 180;
  
  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomLabel : false}
          outerRadius={height / 3}
          innerRadius={innerRadius}
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        {showLegend && <Legend />}
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Area Chart Component
export const AdvancedAreaChart = ({ 
  data, 
  xKey, 
  areas = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  stacked = false
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis 
          dataKey={xKey} 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && <Legend />}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.color || COLORS[index % COLORS.length]}
            fill={area.color || COLORS[index % COLORS.length]}
            fillOpacity={0.6}
            name={area.name || area.dataKey}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Chart Card Wrapper
export const ChartCard = ({ title, subtitle, children, actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// Sparkline Component (Mini chart)
export const Sparkline = ({ data, dataKey, color = COLORS[0], height = 40 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Example Usage Component
export const ChartExamples = () => {
  // Sample data
  const lineData = [
    { month: 'Jan', users: 400, revenue: 2400 },
    { month: 'Feb', users: 500, revenue: 2800 },
    { month: 'Mar', users: 600, revenue: 3200 },
    { month: 'Apr', users: 750, revenue: 3600 },
    { month: 'May', users: 900, revenue: 4200 },
    { month: 'Jun', users: 1100, revenue: 4800 },
  ];

  const pieData = [
    { name: 'Free', value: 400 },
    { name: 'Basic', value: 300 },
    { name: 'Pro', value: 200 },
    { name: 'Enterprise', value: 100 },
  ];

  const barData = [
    { day: 'Mon', calls: 120 },
    { day: 'Tue', calls: 150 },
    { day: 'Wed', calls: 180 },
    { day: 'Thu', calls: 140 },
    { day: 'Fri', calls: 200 },
    { day: 'Sat', calls: 90 },
    { day: 'Sun', calls: 70 },
  ];

  return (
    <div className="space-y-6">
      {/* Line Chart */}
      <ChartCard 
        title="User Growth & Revenue" 
        subtitle="Last 6 months"
        actions={
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View Details →
          </button>
        }
      >
        <AdvancedLineChart
          data={lineData}
          xKey="month"
          lines={[
            { dataKey: 'users', name: 'Users', color: '#667eea' },
            { dataKey: 'revenue', name: 'Revenue ($)', color: '#43e97b' }
          ]}
          height={300}
        />
      </ChartCard>

      {/* Bar Chart */}
      <ChartCard title="API Calls by Day">
        <AdvancedBarChart
          data={barData}
          xKey="day"
          bars={[
            { dataKey: 'calls', name: 'API Calls', color: '#764ba2' }
          ]}
          height={250}
        />
      </ChartCard>

      {/* Pie Chart */}
      <ChartCard title="Subscription Distribution">
        <AdvancedPieChart
          data={pieData}
          height={300}
          innerRadius={60}
        />
      </ChartCard>

      {/* Area Chart */}
      <ChartCard title="Cumulative Growth">
        <AdvancedAreaChart
          data={lineData}
          xKey="month"
          areas={[
            { dataKey: 'users', name: 'Total Users', color: '#667eea' }
          ]}
          height={250}
        />
      </ChartCard>
    </div>
  );
};

export default {
  AdvancedLineChart,
  AdvancedBarChart,
  AdvancedPieChart,
  AdvancedAreaChart,
  ChartCard,
  Sparkline,
};