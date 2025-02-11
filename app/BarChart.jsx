import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Radar, Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BarChart = ({ data, defaultType = 'bar' }) => {
  const [chartType, setChartType] = useState(defaultType);

  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.values)) return null;

  // Common colors for consistency
  const colors = {
    primary: 'rgba(30, 144, 255, 0.4)',
    primaryBorder: 'rgba(30, 144, 255, 1)',
    hover: 'rgba(255, 165, 0, 0.6)',
    hoverBorder: 'rgba(255, 140, 0, 1)',
    pieColors: [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
    ],
  };

  // Common dataset configuration
  const baseDataset = {
    label: 'Value',
    data: data.values,
    backgroundColor: colors.primary,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    hoverBackgroundColor: colors.hover,
    hoverBorderColor: colors.hoverBorder,
  };

  // Chart specific datasets
  const chartConfigs = {
    bar: {
      data: {
        labels: data.labels,
        datasets: [baseDataset],
      },
      
    },
    line: {
      data: {
        labels: data.labels,
        datasets: [{
          ...baseDataset,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
        }],
      },
    },
    // pie: {
    //   data: {
    //     labels: data.labels,
    //     datasets: [{
    //       ...baseDataset,
    //       backgroundColor: colors.pieColors,
    //       borderColor: colors.pieColors.map(color => color.replace('0.6', '1')),
    //     }],
    //   },
    // },
    doughnut: {
      data: {
        labels: data.labels,
        datasets: [{
          ...baseDataset,
          backgroundColor: colors.pieColors,
          borderColor: colors.pieColors.map(color => color.replace('0.6', '1')),
        }],
      },
    },
    // radar: {
    //   data: {
    //     labels: data.labels,
    //     datasets: [{
    //       ...baseDataset,
    //       backgroundColor: colors.primary,
    //       borderColor: colors.primaryBorder,
    //     }],
    //   },
    // },
  };

  // Common options configuration
  const baseOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: data.title || 'Chart',
        color: '#E0E0E0',
        font: { size: 16, weight: 'bold' },
      },
      legend: {
        display: true,
        labels: { color: '#E0E0E0' },
      },
    },
  };

  // Chart specific options
  const chartOptions = {
    bar: {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: { 
            display: true, 
            text: data.yAxisTitle,
            color: '#E0E0E0',
            font: { size: 14 },
          },
          ticks: { color: '#B0B0B0' },
          grid: { color: '#808080' },
        },
        x: {
          title: {
            display: true,
            text: data.xAxisTitle,
            color: '#E0E0E0',
            font: { size: 14 },
          },
          ticks: { color: '#B0B0B0' },
          grid: { color: '#808080' },
        },
        
      },
    },
    line: {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: { 
            display: true, 
            text: data.yAxisTitle,
            color: '#E0E0E0',
            font: { size: 14 },
          },
          ticks: { color: '#B0B0B0' },
          grid: { color: '#808080' },
        },
        x: {
          title: {
            display: true,
            text: data.xAxisTitle,
            color: '#E0E0E0',
            font: { size: 14 },
          },
          ticks: { color: '#B0B0B0' },
          grid: { color: '#808080' },
        },
      },
    },
    pie: {
      ...baseOptions,
      cutout: 0,
    },
    doughnut: {
      ...baseOptions,
      cutout: '50%',
    },
    radar: {
      ...baseOptions,
      scales: {
        r: {
          ticks: { color: '#B0B0B0' },
          grid: { color: '#808080' },
          pointLabels: { color: '#E0E0E0' },
        },
      },
    },
  };

  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
    radar: Radar,
  }[chartType];

  const exportToPDF = async () => {
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
      const canvas = await html2canvas(chartContainer);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('chart.pdf');
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        {Object.keys(chartConfigs).map((type) => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${chartType === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      <div id="chart-container" className="w-full h-[400px]">
        <ChartComponent
          data={chartConfigs[chartType].data}
          options={chartOptions[chartType]}
        />
      </div>
      
      <button
        onClick={exportToPDF}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export as PDF
      </button>
    </div>
  );
};

export default BarChart;