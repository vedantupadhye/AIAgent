// import React from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// const TableWithExport = ({ data }) => {
//   const exportToPDF = async () => {
//     const table = document.querySelector('.table-container');
//     if (!table) return;
//     try {
//       const button = document.querySelector('.export-button');
//       if (button) button.textContent = 'Exporting...';

//       const originalColor = table.style.color;
//       const originalBgColor = table.style.backgroundColor;
//       table.style.color = 'white';
//       table.style.backgroundColor = 'black';

//       const canvas = await html2canvas(table);
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');

//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const aspectRatio = canvas.height / canvas.width;
//       const imgWidth = pageWidth - 20;
//       const imgHeight = imgWidth * aspectRatio;

//       pdf.setTextColor(0, 0, 0); 
//       pdf.setFontSize(16);
//       pdf.text('Table Export', 10, 10);
//       pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);

//       pdf.save('table-export.pdf');
//       table.style.color = originalColor;
//       table.style.backgroundColor = originalBgColor;

//       if (button) button.textContent = 'Export to PDF';
//     } catch (error) {
//       console.error('Failed to export PDF:', error);
//       alert('Failed to export PDF. Please try again.');
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {data.gemini_output?.format === "table" && (
//         <>
//           <div className="flex justify-end mb-4">
//             <button
//               onClick={exportToPDF}
//               className="export-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                 />
//               </svg>
//               <span>Export to PDF</span>
//             </button>
//           </div>

//           <div className="table-container overflow-x-auto rounded-lg shadow">
//             <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600">
//               <thead>
//                 <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
//                   {data.gemini_output.headers.map((header, index) => (
//                     <th
//                       key={index}
//                       className="px-4 py-2 border border-gray-300 dark:border-gray-600"
//                     >
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.gemini_output.rows.map((row, rowIndex) => (
//                   <tr
//                     key={rowIndex}
//                     className="hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     {row.map((cell, cellIndex) => (
//                       <td
//                         key={cellIndex}
//                         className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
//                       >
//                         {cell}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default TableWithExport;






// import React, { useState } from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// const TableWithExport = ({ data }) => {
//   const [filterText, setFilterText] = useState('');
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

//     const exportToPDF = async () => {
//     const table = document.querySelector('.table-container');
//     if (!table) return;

//     try {
//       const button = document.querySelector('.export-button');
//       if (button) button.textContent = 'Exporting...';

//       // Temporarily set table styles for proper rendering in PDF
//       const originalColor = table.style.color;
//       const originalBgColor = table.style.backgroundColor;
//       table.style.color = 'white';
//       table.style.backgroundColor = 'black';

//       // Generate canvas and PDF
//       const canvas = await html2canvas(table);
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');

//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const aspectRatio = canvas.height / canvas.width;
//       const imgWidth = pageWidth - 20;
//       const imgHeight = imgWidth * aspectRatio;

//       pdf.setTextColor(0, 0, 0); 
//       pdf.setFontSize(16);
//       pdf.text('Table Export', 10, 10);
//       pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);

//       pdf.save('table-export.pdf');

//       // Restore original styles
//       table.style.color = originalColor;
//       table.style.backgroundColor = originalBgColor;

//       if (button) button.textContent = 'Export to PDF';
//     } catch (error) {
//       console.error('Failed to export PDF:', error);
//       alert('Failed to export PDF. Please try again.');
//     }
//   };
//   // **Filtering Logic* 
//   const filteredRows = data.gemini_output.rows.filter((row) =>
//     row.some((cell) => cell.toString().toLowerCase().includes(filterText.toLowerCase()))
//   );

//   // **Sorting  **
//     const sortedRows = [...filteredRows].sort((a, b) => {
//     if (sortColumn === null) return 0; // No sorting if no column selected
//     const valueA = a[sortColumn];
//     const valueB = b[sortColumn];

//     if (typeof valueA === 'number' && typeof valueB === 'number') {
//       return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
//     } else {
//       return sortOrder === 'asc'
//         ? valueA.toString().localeCompare(valueB.toString())
//         : valueB.toString().localeCompare(valueA.toString());
//     }
//   });

//   return (
//     <div className="space-y-4">
//       {/* **Filter and Sorting Controls** */}
//       <div className="flex justify-between mb-4 space-x-4">
//         <input
//           type="text"
//           placeholder="Filter table..."
//           value={filterText}
//           onChange={(e) => setFilterText(e.target.value)}
//           className="border bg-gray-600 px-4 py-2 rounded-md"
//         />

//         {/* Sorting Dropdown */}
//         <select
//           value={sortColumn !== null ? sortColumn : ''}
//           onChange={(e) => setSortColumn(e.target.value ? Number(e.target.value) : null)}
//           className="border bg-gray-600 px-4 py-2 rounded-md"
//         >
//           <option value="">Sort by column</option>
//           {data.gemini_output.headers.map((header, index) => (
//             <option key={index} value={index}>
//               {header}
//             </option>
//           ))}
//         </select>

//         {/* Sorting Order Button */}
//         <button
//           onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
//           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
//         >
//           {sortOrder === 'asc' ? 'Ascending 🔼' : 'Descending 🔽'}
//         </button>
//       </div>

//       {/* **Table Display** */}
//       <div className="table-container overflow-x-auto rounded-lg shadow">
//         <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600">
//           <thead>
//             <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
//               {data.gemini_output.headers.map((header, index) => (
//                 <th key={`header-${index}`} className="px-4 py-2 border border-gray-300 dark:border-gray-600">
//                   {header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {sortedRows.map((row, rowIndex) => (
//               <tr key={`row-${rowIndex}`} className="hover:bg-gray-100 dark:hover:bg-gray-700">
//                 {row.map((cell, cellIndex) => (
//                   <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
//                     {cell}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>     
//       <div className="flex justify-end mb-4">
//                <button
//               onClick={exportToPDF}
//               className="export-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                 />
//               </svg>
//               <span>Export to PDF</span>
//             </button>
//           </div>
//     </div>
//   );
// };

// export default TableWithExport;





// using tanstack/react-table

import React, { useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TableWithExport = ({ data }) => {
  const [filterText, setFilterText] = useState('');
  const [sorting, setSorting] = useState([]);

  const columns = data.gemini_output.headers.map((header, index) => ({
    accessorKey: index.toString(),
    header: header,
  }));

  const table = useReactTable({
    data: data.gemini_output.rows,
    columns,
    state: { sorting, globalFilter: filterText },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilterText,
  });

  const exportToPDF = async () => {
    const tableElement = document.querySelector('.table-container');
    if (!tableElement) return;

    try {
      const canvas = await html2canvas(tableElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save('table-export.pdf');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* **Filter Input** */}
      <input
        type="text"
        placeholder="Filter table..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="border bg-gray-600 px-4 py-2 rounded-md"
      />

      {/* **Table Display** */}
      <div className="table-container overflow-x-auto rounded-lg shadow">
        <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-200 dark:bg-gray-700">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-2 border border-gray-300 cursor-pointer"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 border border-gray-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* **Export Button** */}
      <button onClick={exportToPDF} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
        Export to PDF
      </button>
    </div>
  );
};

export default TableWithExport;
