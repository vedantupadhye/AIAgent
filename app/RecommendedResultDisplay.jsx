// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import TableWithExport from './TableWithExport';
// import BarChart from './BarChart';

// const FormatDisplay = ({ format }) => {
//   if (!format) return null;

//   switch (format.format) {
//     case 'table':
//       return (
//         <div className="mt-4">
//           <TableWithExport 
//             data={{ 
//               gemini_output: { 
//                 headers: format.headers, 
//                 rows: format.rows 
//               } 
//             }} 
//           />
//         </div>
//       );
//     case 'graph':
//       return (
//         <div className="w-full mt-4">
//           <BarChart 
//             data={{ 
//               labels: format.labels,
//               values: format.values,
//               xAxisTitle: format.xAxisTitle,
//               yAxisTitle: format.yAxisTitle
//             }} 
//           />
//         </div>
//       );
//     case 'text':
//       return (
//         <p className="mt-4 text-gray-900 dark:text-gray-100">
//           {format.description}
//         </p>
//       );
//     default:
//       return null;
//   }
// };

// const RecommendedResultDisplay = ({ data }) => {
//   const [selectedFormat, setSelectedFormat] = useState(0);

//   if (!data?.recommendations?.[0]) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4"
//     >
//       {/* Recommended Query */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
//           Recommended Query:
//         </h3>
//         <p className="text-gray-900 dark:text-gray-100">
//           {data.recommendations[0].recommendation_message}
//         </p>
//       </div>

//       {/* SQL Query */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
//           Query:
//         </h3>
//         <p className="text-gray-900 dark:text-gray-100">{data.query}</p>
//       </div>

//       {/* Format Selection */}
//       {data.formats && data.formats.length > 0 && (
//         <div className="space-y-4">
//           <div className="flex items-center space-x-4">
//             <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
//               Display Format:
//             </h3>
//             <div className="flex gap-2">
//               {data.formats.map((format, index) => (
//                 <button
//                   key={format.format}
//                   onClick={() => setSelectedFormat(index)}
//                   className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
//                     ${selectedFormat === index
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
//                     }`}
//                 >
//                   {format.format.charAt(0).toUpperCase() + format.format.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Format Display */}
//           <motion.div
//             key={selectedFormat}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.3 }}
//           >
//             <FormatDisplay format={data.formats[selectedFormat]} />
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default RecommendedResultDisplay;







// correccted

import { useState } from 'react';
import { motion } from 'framer-motion';
import TableWithExport from './TableWithExport';
import BarChart from './BarChart';

const FormatDisplay = ({ format }) => {
  if (!format) return null;

  switch (format.format) {
    case 'table':
      // Transform the data to match TableWithExport's expected structure
      const tableData = {
        gemini_output: {
          format: 'table',
          headers: format.headers,
          rows: format.rows
        },
        results: format.rows
      };
      
      return (
        <div className="mt-4">
          <TableWithExport data={tableData} />
        </div>
      );
      
    case 'graph':
      return (
        <div className="w-full mt-4">
          <BarChart 
            data={{ 
              labels: format.labels,
              values: format.values,
              xAxisTitle: format.xAxisTitle,
              yAxisTitle: format.yAxisTitle
            }} 
          />
        </div>
      );
      
    case 'text':
      return (
        <p className="mt-4 text-gray-900 dark:text-gray-100">
          {format.description}
        </p>
      );
      
    default:
      return null;
  }
};

const RecommendedResultDisplay = ({ data }) => {
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [debugMode, setDebugMode] = useState(false);

  if (!data?.recommendations?.[0]) return null;

  // Debug information
  const debugInfo = {
    availableFormats: data.formats?.map(f => f.format) || [],
    selectedFormat: data.formats?.[selectedFormat],
    hasFormats: Boolean(data.formats?.length)
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4"
    >
      {/* Debug Toggle */}
      <button 
        onClick={() => setDebugMode(!debugMode)}
        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
      </button>

      {debugMode && (
        <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}

      {/* Recommended Query */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Recommended Query:
        </h3>
        <p className="text-gray-900 dark:text-gray-100">
          {data.recommendations[0].recommendation_message}
        </p>
      </div>

      {/* SQL Query */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Query:
        </h3>
        <p className="text-gray-900 dark:text-gray-100">{data.query}</p>
      </div>

      {/* Format Selection */}
      {data.formats && data.formats.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Display Format:
            </h3>
            <div className="flex gap-2">
              {data.formats.map((format, index) => (
                <button
                  key={format.format}
                  onClick={() => setSelectedFormat(index)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${selectedFormat === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  {format.format.charAt(0).toUpperCase() + format.format.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Format Display */}
          <motion.div
            key={selectedFormat}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FormatDisplay format={data.formats[selectedFormat]} />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendedResultDisplay;


