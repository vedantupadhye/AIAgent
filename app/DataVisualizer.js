import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { FaChartBar, FaChartLine, FaChartPie } from "react-icons/fa";

const DataVisualizer = ({ data, visualization }) => {
  if (!data || !visualization) return null;
  const { type, xAxis, yAxis, title } = visualization;

  const processData = (rawData) => {
    return rawData.map(item => ({
      category: String(item[xAxis] || ''),
      value: Number(item[yAxis] || 0)
    }));
  };

  const chartData = processData(data);

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#3B82F6"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const getChartIcon = () => {
    switch (type.toLowerCase()) {
      case 'bar':
        return <FaChartBar className="w-5 h-5 text-blue-500 mr-2" />;
      case 'line':
        return <FaChartLine className="w-5 h-5 text-blue-500 mr-2" />;
      case 'pie':
        return <FaChartPie className="w-5 h-5 text-blue-500 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
        {getChartIcon()}
        {title}
      </h3>
      {renderChart()}
    </div>
  );
};

export default DataVisualizer;