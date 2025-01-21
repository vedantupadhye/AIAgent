import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TableWithExport = ({ data }) => {
  const exportToPDF = async () => {
    // Get the table element
    const table = document.querySelector('.table-container');
    if (!table) return;

    try {
      // Show loading state
      const button = document.querySelector('.export-button');
      if (button) button.textContent = 'Exporting...';

      // Create the PDF
      const canvas = await html2canvas(table);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const aspectRatio = canvas.height / canvas.width;
      const imgWidth = pageWidth - 20; // Leave 10mm margin on each side
      const imgHeight = imgWidth * aspectRatio;

      // Add title
      pdf.setFontSize(16);
      pdf.text('Table Export', 10, 10);

      // Add the table image
      pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);

      // Save the PDF
      pdf.save('table-export.pdf');

      // Reset button text
      if (button) button.textContent = 'Export to PDF';
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {data.gemini_output?.format === "table" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={exportToPDF}
              className="export-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Export to PDF</span>
            </button>
          </div>
          
          <div className="table-container overflow-x-auto rounded-lg shadow">
            <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {data.gemini_output.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.gemini_output.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TableWithExport;