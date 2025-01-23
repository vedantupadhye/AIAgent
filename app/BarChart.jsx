import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data }) {
  // Check if data exists and has the correct structure
  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.values)) return null;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Value',
        data: data.values,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Graph',
      },
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Coil Width',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  const exportToPDF = async () => {
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
      const canvas = await html2canvas(chartContainer);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190; // PDF page width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('chart.pdf');
    }
  };

  return (
    <div className="w-full">
      <div id="chart-container" className="w-full h-[400px]">
        <Bar data={chartData} options={options} />
      </div>
      <button
        onClick={exportToPDF}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export as PDF
      </button>
    </div>
  );
}
