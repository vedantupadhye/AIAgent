"use client";

import 'regenerator-runtime/runtime';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone, FaArrowRight, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from 'next-themes';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme('light');
  const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [notconfirm, setNotConfirm] = useState(false);
  const [originalResult, setOriginalResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLoader, setIsEditingLoader] = useState(false);

  useEffect(() => {
    return () => {
      SpeechRecognition.abortListening(); // Ensure no lingering listeners
    };
  }, []);

  const editQuestion = () => {
    setIsEditing(true);
    setIsEditingLoader(true);
    setTimeout(() => {
      setIsEditing(false);
      setIsEditingLoader(false);
      setResponse(null);
      setConfirmed(false);
      setNotConfirm(false);
      setError(null);
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setIsLoading(true);
    setConfirmed(false);
    setNotConfirm(false);
    setOriginalResult(null);

    try {
      const res = await axios.post('http://localhost:8000/rec1', { text: question });
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    setIsListening(true);
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsListening(false);
    setTimeout(() => {
      setQuestion(transcript);
    }, 300);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const RecommendedResultDisplay = ({ data }) => {
    if (!data?.recommendations?.[0]) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Recommended Query:</h3>
          <p className="text-gray-900 dark:text-gray-100">{data.recommendations[0].recommendation_message}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Query:</h3>
          <p className="text-gray-900 dark:text-gray-100">{data.query}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Description:</h3>
          <p className="text-gray-900 dark:text-gray-100">{data.description}</p>
        </div>
      </motion.div>
    );
  };

  const OriginalResultDisplay = ({ data }) => {
    if (!data) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Query Results:</h3>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Query </h3>
          <pre className="text-sm text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 p-2 rounded my-3">
            {data.query}
          </pre>
          <pre className="text-sm text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 p-2 rounded">
            {data.results}
          </pre>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} flex justify-center`}>
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          {/* <button onClick={toggleTheme} className="p-2 bg-gray-200 dark:bg-gray-700 rounded">
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button> */}
          <h1 className="text-xl font-bold items-center content-center text-center">SQL Query Generator</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your query..."
            className="p-3 border rounded w-full text-gray-800 dark:text-gray-200 dark:bg-gray-700"
          />
          <div className="flex flex-wrap gap-4">
            <button type="submit" className="p-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 flex-1">
              Submit
            </button>
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className="p-2 bg-gray-300 dark:bg-gray-700 rounded shadow-md flex-1"
            >
              <FaMicrophone />
            </button>
          </div>
        </form>
        {isLoading && <p className="text-center text-blue-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {response && !confirmed && !notconfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md"
          >
            <p className="text-gray-700 dark:text-gray-300">Did you mean:</p>
            <p className="text-gray-900 dark:text-gray-100">{response.recommendations[0]?.recommendation_message}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button
                onClick={handleConfirm}
                className="p-2 bg-green-500 text-white rounded shadow-md hover:bg-green-600 flex-1"
              >
                Yes
              </button>
              {isEditingLoader && (
                <p className="text-center text-yellow-500">Please wait... Editing is disabled for 5 seconds.</p>
              )}
              <button
                className="p-2 bg-black text-white rounded shadow-md flex-1"
                onClick={editQuestion}
              >
                Edit Question
              </button>
            </div>
          </motion.div>
        )}
        {confirmed && response && <RecommendedResultDisplay data={response} />}
        {notconfirm && originalResult && <OriginalResultDisplay data={originalResult} />}
      </div>
    </div>
  );
}


// result={JSON.stringify(response, null, 2)} 

  // const handleNo = async () => {
  //   try {
  //     const { data } = await axios.post('http://localhost:8000/query', { text: question });
  //     setNotConfirm(true);
  //     setOriginalResult(data);
  //   } catch (error) {
  //     console.error('Error in handleNo:', error);
  //     setError('An error occurred while processing your query.');
  //   }
  // };

 {/* <button 
              className="mt-2 p-2 bg-red-500 text-white rounded shadow-md hover:bg-red-600" 
              onClick={handleNo}
            >
              Continue with your query
            </button> */}






// "use client";

// import 'regenerator-runtime/runtime';
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import { FaMicrophone, FaArrowRight, FaSun, FaMoon } from "react-icons/fa";
// import { useTheme } from 'next-themes';

// const TypewriterText = ({ text }) => {
//   const [displayText, setDisplayText] = useState('');
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (currentIndex < text.length) {
//       const timeout = setTimeout(() => {
//         setDisplayText(prev => prev + text[currentIndex]);
//         setCurrentIndex(currentIndex + 1);
//       }, 100);
//       return () => clearTimeout(timeout);
//     }
//   }, [currentIndex, text]);

//   return (
//     <span className="inline-block">
//       {displayText}
//       {currentIndex < text.length && <span className="animate-pulse">|</span>}
//     </span>
//   );
// };


// export default function ConfirmationPage() {
//   async function handleConfirm() {
//     "use server"; // Server action directive

//     try {
//       const res = await fetch("/api/rec1", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: "Your query here" }), // Replace with actual query text
//       });

//       if (!res.ok) {
//         throw new Error("Failed to fetch query and recommendations");
//       }

//       const data = await res.json();
//       return data;
//     } catch (error) {
//       console.error(error);
//       throw new Error("An error occurred while fetching data.");
//     }
//   }
// }
// export default function Home() {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme } = useTheme('light');
//   const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
//   const [submitted, setSubmitted] = useState(false);
//   const [confirmed, setConfirmed] = useState(false);
//   const [rejected, setRejected] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   if (!browserSupportsSpeechRecognition) {
//     return (
//       <div className="flex items-center justify-center h-screen dark:bg-gray-900">
//         <p className="text-red-500 text-lg font-medium bg-red-50 dark:bg-red-900 px-6 py-4 rounded-lg">
//           Your browser doesn't support speech recognition.
//         </p>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setResponse(null);
//     setIsLoading(true);
//     setSubmitted(true);
//     setConfirmed(false);
//     setRejected(false);

//     try {
//       const res = await axios.post('http://localhost:8000/rec1', { text: question });
//       setResponse(res.data);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startListening = () => {
//     SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     SpeechRecognition.stopListening();
//     setIsListening(false);
//     setQuestion(transcript);
//   };

//   const handleConfirm = (isConfirmed) => {
//     if (isConfirmed) {
//       setConfirmed(true);
//       setRejected(false);
//     } else {
//       setConfirmed(false);
//       setRejected(true);
//     }
//   };
//   const toggleTheme = () => {
//     if (!mounted) return; // Ensure this runs only when mounted
  
//     const newTheme = theme === 'dark' ? 'light' : 'dark';
//     setTheme(newTheme);
  
//     // Update the HTML <body> class
//     document.documentElement.classList.remove(theme);
//     document.documentElement.classList.add(newTheme);
  
//     // Save the new theme in localStorage
//     localStorage.setItem('theme', newTheme);
//   };
  

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200 flex items-center justify-center">
//       <div className="container mx-auto max-w-3xl my-auto">
//         <motion.div 
//           className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 relative"
//           initial={{ opacity: 0, y: 100 }}
//           animate={submitted ? { y: -100, opacity: 1 } : { y: 0, opacity: 1 }}
//           transition={{ duration: 0.8 }}
//         >
//           <button
//             onClick={toggleTheme}
//             className="absolute top-6 right-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//           >
//             {theme === 'dark' ? (
//               <FaSun className="w-5 h-5 text-yellow-500" />
//             ) : (
//               <FaMoon className="w-5 h-5 text-gray-700" />
//             )}
//             </button>
//           <motion.h1 
//             className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#4285f4] to-[#d96570] dark:from-[#4285f4] dark:to-[#d96570]"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <TypewriterText text="SQL Query Generator" />
//           </motion.h1>
          
//           <motion.form 
//             onSubmit={handleSubmit} 
//             className="relative flex flex-col items-center"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="relative w-full flex items-center mb-6">
//               <button
//                 type="button"
//                 onClick={isListening ? stopListening : startListening}
//                 className={`absolute left-4 p-2 rounded-full transition-colors ${
//                   isListening 
//                     ? 'bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800' 
//                     : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
//                 }`}
//               >
//                 <FaMicrophone className="w-5 h-5" />
//               </button>

//               <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 placeholder="Type your question here or use the mic..."
//                 className="w-full pl-14 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
//               />

//               <button
//                 type="submit"
//                 className="absolute right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors disabled:opacity-50"
//                 disabled={isLoading}
//               >
//                 <FaArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </motion.form>

//           {isLoading && (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//               <p className="ml-3 text-blue-500 dark:text-blue-400 font-medium">Generating response...</p>
//             </div>
//           )}

//           {error && (
//             <motion.div 
//               className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.3 }}
//             >
//               <p className="text-red-700 dark:text-red-400">{error}</p>
//             </motion.div>
//           )}

//           {response && !confirmed && !rejected && (
//             <motion.div
//               className="mt-6 space-y-4"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
//                <p className="text-gray-800 dark:text-gray-200">{response.recommendations && response.recommendations[0]?.recommendation_message}</p> 
//                {/* <p className="text-gray-800 dark:text-gray-200">{response.do_you_mean}</p>   */}
//               </div>

//               <div className="flex justify-center gap-4">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                   onClick={() => handleConfirm(true)}
//                   className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md shadow-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-300"
//                 >
//                   Yes
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                   onClick={() => handleConfirm(false)}
//                   className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md shadow-lg hover:from-red-600 hover-to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-300"
//                 >
//                   No
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}

//           {rejected && (
//             <motion.div
//               className="mt-6 bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-500 p-4 rounded-lg"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.3 }}
//             >
//               <p className="text-yellow-700 dark:text-yellow-400">Please input a valid query</p>
//             </motion.div>
//           )}

//           {confirmed && response && (
//             <motion.div 
//               className="space-y-6 mt-6"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200flex items-center">
//                   <span className="w-2 h-2  rounded-full mr-2"></span>
//                   Generated SQL Query
//                 </h3>
//                 <motion.pre 
//                   className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-100 font-mono"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {response.query}
//                 </motion.pre>
//               </div>

//               <div>
//       <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
//         <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
//         Query Results
//       </h3>
//       <div className="bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden">
//         <div className="overflow-x-auto">
//           {response.results.map((row, index) => {
//             const hasNullValue = Object.values(row).some(value => value === null);                    
//             return (
//               <motion.div
//                 key={index}
//                 className="p-3 border-b border-gray-700 last:border-0 hover:bg-gray-700 dark:hover:bg-gray-600"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: index * 0.1, duration: 0.2 }}
//               >
//                 {hasNullValue ? (
//                   <div className="text-gray-400">No values for the given input</div>
//                 ) : (
//                   response.columns.map((column, colIndex) => (
//                     <div key={column} className="flex justify-between py-1">
//                       {/* <span className="text-gray-200">{column}</span> */}
//                       <span className="text-gray-200">
//                         {row[colIndex]} {response.matched_unit}
//                       </span>
//                     </div>
//                   ))
//                 )}
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   </motion.div>
// )}
//         </motion.div>
//       </div>
//     </div>
//   );
// }














// "use client";
// import { useState } from 'react';
// import { fetchQuery } from './apiActions';
// import { motion } from 'framer-motion';
// import { FaArrowRight } from "react-icons/fa";

// export default function Home() {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [confirmed, setConfirmed] = useState(false);
//   const [rejected, setRejected] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setResponse(null);
//     setIsLoading(true);
//     setConfirmed(false);
//     setRejected(false);
    
//     try {
//       const data = await fetchQuery(question);
//       setResponse(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleConfirm = (isConfirmed) => {
//     if (isConfirmed) {
//       setConfirmed(true);
//       setRejected(false);
//     } else {
//       setConfirmed(false);
//       setRejected(true);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="max-w-xl w-full p-6 bg-white shadow-lg rounded-lg">
//         <motion.h1
//           className="text-2xl font-bold text-center mb-6"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           SQL Query Generator
//         </motion.h1>
        
//         <form onSubmit={handleSubmit} className="flex flex-col items-center">
//           <div className="relative w-full mb-6">
//             <input
//               type="text"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="Type your question here..."
//               className="w-full pl-4 pr-14 py-4 rounded-lg border border-gray-300"
//             />
//             <button
//               type="submit"
//               className="absolute right-4 top-2 bottom-2 bg-blue-500 text-white p-2 rounded-lg"
//               disabled={isLoading}
//             >
//               <FaArrowRight />
//             </button>
//           </div>
//         </form>

//         {isLoading && <p className="text-center text-blue-500">Loading...</p>}
        
//         {error && (
//           <motion.div
//             className="bg-red-100 text-red-500 p-4 rounded-lg"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.3 }}
//           >
//             {error}
//           </motion.div>
//         )}

//         {response && !confirmed && !rejected && (
//           <motion.div
//             className="mt-6 text-black"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <pre className="bg-gray-100 p-4 rounded-lg mt-2">{response.do_you_mean}</pre>
//             <div className="my-5 flex justify-center gap-4">
//               <button
//                 onClick={() => handleConfirm(true)}
//                 className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
//               >
//                 Yes
//               </button>
//               <button
//                 onClick={() => handleConfirm(false)}
//                 className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
//               >
//                 No
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {confirmed && (
//           <motion.div
//             className="mt-6 text-black"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <h2 className="text-lg font-semibold">Generated SQL Query</h2>
//             <pre className="bg-gray-100 p-4 rounded-lg mt-2">{response.query}</pre>
//             <pre className="bg-gray-100 p-4 rounded-lg mt-2">{response.results}</pre>
//           </motion.div>
//         )}

//         {rejected && (
//           <motion.div
//             className="mt-6 bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.3 }}
//           >
//             Please input a valid query
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }
















// --------------------------------------------------

// "use client";

// import 'regenerator-runtime/runtime';
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import { FaMicrophone, FaArrowRight, FaSun, FaMoon } from "react-icons/fa";
// import { useTheme } from 'next-themes';

// const TypewriterText = ({ text }) => {
//   const [displayText, setDisplayText] = useState('');
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (currentIndex < text.length) {
//       const timeout = setTimeout(() => {
//         setDisplayText(prev => prev + text[currentIndex]);
//         setCurrentIndex(currentIndex + 1);
//       }, 100);
//       return () => clearTimeout(timeout);
//     }
//   }, [currentIndex, text]);

//   return (
//     <span className="inline-block">
//       {displayText}
//       {currentIndex < text.length && <span className="animate-pulse">|</span>}
//     </span>
//   );
// };

// export default function Home() {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme } = useTheme();
//   const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
//   const [submitted, setSubmitted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   if (!browserSupportsSpeechRecognition) {
//     return (
//       <div className="flex items-center justify-center h-screen dark:bg-gray-900">
//         <p className="text-red-500 text-lg font-medium bg-red-50 dark:bg-red-900 px-6 py-4 rounded-lg">
//           Your browser doesn't support speech recognition.
//         </p>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setResponse(null);
//     setIsLoading(true);
//     setSubmitted(true);

//     try {
//       const res = await axios.post('http://localhost:8000/query', { text: question });
//       setResponse(res.data);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startListening = () => {
//     SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     SpeechRecognition.stopListening();
//     setIsListening(false);
//     setQuestion(transcript);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200 flex items-center justify-center">
//       <div className="container mx-auto max-w-3xl">
//         <motion.div 
//           className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 relative"
//           initial={{ opacity: 0, y: 100 }}
//           animate={submitted ? { y: -100, opacity: 1 } : { y: 0, opacity: 1 }}
//           transition={{ duration: 0.8 }}
//         >
//           <button
//             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//             className="absolute top-6 right-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//           >
//             {theme === 'dark' ? (
//               <FaSun className="w-5 h-5 text-yellow-500" />
//             ) : (
//               <FaMoon className="w-5 h-5 text-gray-700" />
//             )}
//           </button>

//           <motion.h1 
//             className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <TypewriterText text="SQL Query Generator" />
//           </motion.h1>

//           <motion.form 
//             onSubmit={handleSubmit} 
//             className="relative flex flex-col items-center"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="relative w-full flex items-center mb-6">
//               <button
//                 type="button"
//                 onClick={isListening ? stopListening : startListening}
//                 className={`absolute left-4 p-2 rounded-full transition-colors ${
//                   isListening 
//                     ? 'bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800' 
//                     : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
//                 }`}
//               >
//                 <FaMicrophone className="w-5 h-5" />
//               </button>

//               <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 placeholder="Type your question here or use the mic..."
//                 className="w-full pl-14 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
//               />

//               <button
//                 type="submit"
//                 className="absolute right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors disabled:opacity-50"
//                 disabled={isLoading}
//               >
//                 <FaArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </motion.form>

//           {isLoading && (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//               <p className="ml-3 text-blue-500 dark:text-blue-400 font-medium">Generating response...</p>
//             </div>
//           )}

//           {error && (
//             <motion.div 
//               className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.3 }}
//             >
//               <p className="text-red-700 dark:text-red-400">{error}</p>
//             </motion.div>
//           )}

//           <div>
//             <p>do you mean text</p>
//           </div>
//           <div className='my-8'>
//               <button className='mx-4'>Yes</button>
//               <button>No</button>
//           </div>

//           {response && (
//             <motion.div 
//               className="space-y-6"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
//                   <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
//                   Generated SQL Query
//                 </h3>
//                 <motion.pre 
//                   className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-100 font-mono"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {response.query}
//                 </motion.pre>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
//                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
//                   Query Results
//                 </h3>
//                 <div className="bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden">
//                   <div className="overflow-x-auto">
//                     {response.results.map((row, index) => (
//                       <motion.div 
//                         key={index} 
//                         className="p-3 border-b border-gray-700 last:border-0 hover:bg-gray-700 dark:hover:bg-gray-600"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: index * 0.1, duration: 0.2 }}
//                       >
//                         {Object.entries(row).map(([key, value]) => (
//                           <div key={key} className="flex justify-between py-1">
//                             {/* <span className="text-gray-400">{key}:</span> */}
//                             <span className="text-gray-200">{value}</span>
//                           </div>
//                         ))}
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   );
// }




// "use client";
// import "regenerator-runtime/runtime";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import { FaMicrophone, FaArrowRight, FaSun, FaMoon } from "react-icons/fa";

// import { useTheme } from "next-themes";

// const TypewriterText = ({ text }) => {
//   const [displayText, setDisplayText] = useState("");
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (currentIndex < text.length) {
//       const timeout = setTimeout(() => {
//         setDisplayText((prev) => prev + text[currentIndex]);
//         setCurrentIndex(currentIndex + 1);
//       }, 100);
//       return () => clearTimeout(timeout);
//     }
//   }, [currentIndex, text]);

//   return (
//     <span className="inline-block">
//       {displayText}
//       {currentIndex < text.length && <span className="animate-pulse">|</span>}
//     </span>
//   );
// };



// export default function Home() {
//   const [question, setQuestion] = useState("");
//   const [sqlQuery, setSqlQuery] = useState("");
//   const [queryResults, setQueryResults] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [suggestion, setSuggestion] = useState("");
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const { theme, setTheme } = useTheme();
//   const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (transcript) {
//       setQuestion(transcript);
//     }
//   }, [transcript]);

//   if (!mounted) return null;

//   if (!browserSupportsSpeechRecognition) {
//     return (
//       <div className="flex items-center justify-center h-screen dark:bg-gray-900">
//         <p className="text-red-500 text-lg font-medium bg-red-50 dark:bg-red-900 px-6 py-4 rounded-lg">
//           Your browser doesn't support speech recognition.
//         </p>
//       </div>
//     );
//   }
//   const checkSynonyms = async () => {
//     try {
//       const res = await axios.post("http://localhost:8000/query", {
//         question,
//         action: "suggest",
//       });
//       console.log("Response data:", res.data); // Debug log
//       if (res.data.suggestion) {
//         setSuggestion(res.data.suggestion);
//         setShowConfirmation(true);
//         return true;
//       }
//       return false;
//     } catch (err) {
//       setError(err.response?.data?.detail || "An error occurred while checking synonyms.");
//       return false;
//     }
//   };
  
//   const executeQuery = async () => {
//     try {
//       const res = await axios.post("http://localhost:8000/query", {
//         question,
//         action: "execute",
//       });
//       if (res.data.sql_query) {
//         setSqlQuery(res.data.sql_query);
//         setQueryResults(res.data.response);
//       } else {
//         setError("No results found for your query.");
//       }
//     } catch (err) {
//       setError(err.response?.data?.detail || "An error occurred while executing the query.");
//     }
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setError(null);
//     setSqlQuery("");
//     setQueryResults(null);
//     setIsLoading(true);

//     try {
//       const hasSuggestion = await checkSynonyms();
//       if (!hasSuggestion) {
//         await executeQuery();
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleConfirmation = async (confirmed) => {
//     setShowConfirmation(false);
//     if (confirmed) {
//       setIsLoading(true);
//       await executeQuery();
//       setIsLoading(false);
//     } else {
//       setError("Please rephrase your question.");
//     }
//   };

//   const startListening = () => {
//     SpeechRecognition.startListening({ continuous: true, language: "en-US" });
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     SpeechRecognition.stopListening();
//     setIsListening(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200 flex items-center justify-center">
//       <div className="container mx-auto max-w-4xl">
//         <motion.div
//           className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 relative"
//           initial={{ opacity: 0, y: 100 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           <button
//             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//             className="absolute top-6 right-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//           >
//             {theme === "dark" ? <FaSun className="w-5 h-5 text-yellow-500" /> : <FaMoon className="w-5 h-5 text-gray-700" />}
//           </button>

//           <motion.h1
//             className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <TypewriterText text="SQL Query Generator" />
//           </motion.h1>

//           <motion.form onSubmit={handleSubmit} className="relative flex flex-col items-center">
//             <div className="relative w-full flex items-center mb-6">
//               <button
//                 type="button"
//                 onClick={isListening ? stopListening : startListening}
//                 className={`absolute left-4 p-2 rounded-full transition-colors ${
//                   isListening
//                     ? "bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800"
//                     : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
//                 }`}
//               >
//                 <FaMicrophone className="w-5 h-5" />
//               </button>

//               <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 placeholder="Type your question here or use the mic..."
//                 className="w-full pl-14 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
//               />

//               <button
//                 type="submit"
//                 className="absolute right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isLoading || !question.trim()}
//               >
//                 <FaArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </motion.form>

//                   {showConfirmation && suggestion && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg shadow-lg"
//           >
//             <p className="text-blue-700 dark:text-blue-300 mb-3">{suggestion}</p>
//             <div className="flex space-x-4">
//               <button
//                 onClick={() => handleConfirmation(true)}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//               >
//                 Yes
//               </button>
//               <button
//                 onClick={() => handleConfirmation(false)}
//                 className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//               >
//                 No
//               </button>
//             </div>
//           </motion.div>
//         )}


//           {isLoading && (
//             <div className="flex justify-center mt-4">
//               <div className="w-6 h-6 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
//             </div>
//           )}

//           {sqlQuery && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mt-6 space-y-2"
//             >
//               <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Generated SQL Query:</h3>
//               <Code className="block w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-x-auto">
//                 {sqlQuery}
//               </Code>
//             </motion.div>
//           )}

//           {queryResults && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mt-6 space-y-2"
//             >
//               <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Query Results:</h3>
//               <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
//                 <table className="min-w-full">
//                   <tbody>
//                     {Array.isArray(queryResults) ? (
//                       queryResults.map((row, index) => (
//                         <tr key={index} className="border-b dark:border-gray-600">
//                           <td className="py-2 px-4 text-gray-800 dark:text-gray-200">
//                             {JSON.stringify(row)}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className="py-2 px-4 text-gray-800 dark:text-gray-200">
//                           {JSON.stringify(queryResults)}
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </motion.div>
//           )}

//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mt-6 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 p-4 rounded-lg"
//             >
//               {error}
//             </motion.div>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   );
// }




// chart generation 


// "use client";
// import 'regenerator-runtime/runtime';

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import { FaMicrophone, FaArrowRight, FaSun, FaMoon } from "react-icons/fa";
// import { useTheme } from 'next-themes';
// import DataVisualizer from './DataVisualizer';

// const TypewriterText = ({ text }) => {
//   const [displayText, setDisplayText] = useState('');
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (currentIndex < text.length) {
//       const timeout = setTimeout(() => {
//         setDisplayText(prev => prev + text[currentIndex]);
//         setCurrentIndex(currentIndex + 1);
//       }, 100);
//       return () => clearTimeout(timeout);
//     }
//   }, [currentIndex, text]);

//   return (
//     <span className="inline-block">
//       {displayText}
//       {currentIndex < text.length && <span className="animate-pulse">|</span>}
//     </span>
//   );
// };

// export default function Home() {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme } = useTheme();
//   const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
//   const [submitted, setSubmitted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   if (!browserSupportsSpeechRecognition) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p className="text-red-500">Browser doesn't support speech recognition.</p>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setResponse(null);
//     setIsLoading(true);
//     setSubmitted(true);

//     try {
//       const res = await axios.post('http://localhost:8000/query', { text: question });
//       setResponse(res.data);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startListening = () => {
//     SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     SpeechRecognition.stopListening();
//     setIsListening(false);
//     setQuestion(transcript);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200">
//       <div className="container mx-auto max-w-3xl">
//         <motion.div 
//           className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 relative"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <button
//             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//             className="absolute top-6 right-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//           >
//             {theme === 'dark' ? (
//               <FaSun className="w-5 h-5 text-yellow-500" />
//             ) : (
//               <FaMoon className="w-5 h-5 text-gray-700" />
//             )}
//           </button>

//           <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
//             <TypewriterText text="SQL Query Generator" />
//           </h1>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="relative flex items-center">
//               <button
//                 type="button"
//                 onClick={isListening ? stopListening : startListening}
//                 className={`absolute left-4 p-2 rounded-full transition-colors ${
//                   isListening 
//                     ? 'bg-red-100 text-red-500 hover:bg-red-200' 
//                     : 'text-gray-400 hover:text-gray-600'
//                 }`}
//               >
//                 <FaMicrophone className="w-5 h-5" />
//               </button>

//               <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 placeholder="Type your question here or use the mic..."
//                 className="w-full pl-14 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />

//               <button
//                 type="submit"
//                 className="absolute right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
//                 disabled={isLoading}
//               >
//                 <FaArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </form>

//           {isLoading && (
//             <div className="flex items-center justify-center mt-4">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//               <p className="ml-3 text-blue-500">Generating response...</p>
//             </div>
//           )}

//           {error && (
//             <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
//               <p className="text-red-700">{error}</p>
//             </div>
//           )}

//           {response && (
//             <div className="mt-6 space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Generated SQL Query</h3>
//                 <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-100">
//                   {response.query}
//                 </pre>
//               </div>

//               <DataVisualizer 
//                 data={response.results} 
//                 visualization={response.visualization}
//               />
//             </div>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   );
// }











// "use client";
// import 'regenerator-runtime/runtime';
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import { FaMicrophone, FaArrowRight, FaSun, FaMoon } from "react-icons/fa";
// import { useTheme } from 'next-themes';

// const TypewriterText = ({ text }) => {
//   const [displayText, setDisplayText] = useState('');
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (currentIndex < text.length) {
//       const timeout = setTimeout(() => {
//         setDisplayText(prev => prev + text[currentIndex]);
//         setCurrentIndex(currentIndex + 1);
//       }, 100);
//       return () => clearTimeout(timeout);
//     }
//   }, [currentIndex, text]);

//   return (
//     <span className="inline-block">
//       {displayText}
//       {currentIndex < text.length && <span className="animate-pulse">|</span>}
//     </span>
//   );
// };

// export default function Home() {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme } = useTheme();
//   const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
//   const [submitted, setSubmitted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   if (!browserSupportsSpeechRecognition) {
//     return (
//       <div className="flex items-center justify-center h-screen dark:bg-gray-900">
//         <p className="text-red-500 text-lg font-medium bg-red-50 dark:bg-red-900 px-6 py-4 rounded-lg">
//           Your browser doesn't support speech recognition.
//         </p>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setResponse(null);
//     setIsLoading(true);
//     setSubmitted(true);

//     try {
//       const res = await axios.post('http://localhost:8000/query', { text: question });
//       setResponse(res.data);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startListening = () => {
//     SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     SpeechRecognition.stopListening();
//     setIsListening(false);
//     setQuestion(transcript);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200 flex items-center justify-center">
//       <div className="container mx-auto max-w-3xl">
//         <motion.div 
//           className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 relative"
//           initial={{ opacity: 0, y: 100 }}
//           animate={submitted ? { y: -100, opacity: 1 } : { y: 0, opacity: 1 }}
//           transition={{ duration: 0.8 }}
//         >
//           <button
//             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//             className="absolute top-6 right-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//           >
//             {theme === 'dark' ? (
//               <FaSun className="w-5 h-5 text-yellow-500" />
//             ) : (
//               <FaMoon className="w-5 h-5 text-gray-700" />
//             )}
//           </button>

//           <motion.h1 
//             className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <TypewriterText text="SQL Query Generator" />
//           </motion.h1>

//           <motion.form 
//             onSubmit={handleSubmit} 
//             className="relative flex flex-col items-center"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="relative w-full flex items-center mb-6">
//               <button
//                 type="button"
//                 onClick={isListening ? stopListening : startListening}
//                 className={`absolute left-4 p-2 rounded-full transition-colors ${
//                   isListening 
//                     ? 'bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800' 
//                     : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
//                 }`}
//               >
//                 <FaMicrophone className="w-5 h-5" />
//               </button>

//               <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 placeholder="Type your question here or use the mic..."
//                 className="w-full pl-14 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
//               />

//               <button
//                 type="submit"
//                 className="absolute right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors disabled:opacity-50"
//                 disabled={isLoading}
//               >
//                 <FaArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </motion.form>

//           {isLoading && (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//               <p className="ml-3 text-blue-500 dark:text-blue-400 font-medium">Generating response...</p>
//             </div>
//           )}

//           {error && (
//             <motion.div 
//               className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.3 }}
//             >
//               <p className="text-red-700 dark:text-red-400">{error}</p>
//             </motion.div>
//           )}

//           {response && (
//             <motion.div 
//               className="space-y-6"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
//                   <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
//                   Generated SQL Query
//                 </h3>
//                 <motion.pre 
//                   className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-100 font-mono"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {response.query}
//                 </motion.pre>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
//                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
//                   Query Results
//                 </h3>
//                 <div className="bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden">
//                   <div className="overflow-x-auto">
//                     {response.results.map((row, index) => (
//                       <motion.div 
//                         key={index} 
//                         className="p-3 border-b border-gray-700 last:border-0 hover:bg-gray-700 dark:hover:bg-gray-600"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: index * 0.1, duration: 0.2 }}
//                       >
//                         {Object.entries(row).map(([key, value]) => (
//                           <div key={key} className="flex justify-between py-1">
//                             {/* <span className="text-gray-400">{key}:</span> */}
//                             <span className="text-gray-200">{value}</span>
//                           </div>
//                         ))}
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   );
// }







// "use client";
// import 'regenerator-runtime/runtime';
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import { FaMicrophone, FaArrowRight, FaSun, FaMoon } from "react-icons/fa";
// import { useTheme } from 'next-themes';

// const TypewriterText = ({ text }) => {
//   const [displayText, setDisplayText] = useState('');
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (currentIndex < text.length) {
//       const timeout = setTimeout(() => {
//         setDisplayText(prev => prev + text[currentIndex]);
//         setCurrentIndex(currentIndex + 1);
//       }, 100);
//       return () => clearTimeout(timeout);
//     }
//   }, [currentIndex, text]);

//   return (
//     <span className="inline-block">
//       {displayText}
//       {currentIndex < text.length && (
//         <span className="animate-pulse">|</span>
//       )}
//     </span>
//   );
// };

// export default function Home() {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme } = useTheme();
//   const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   if (!browserSupportsSpeechRecognition) {
//     return (
//       <div className="flex items-center justify-center h-screen dark:bg-gray-900">
//         <p className="text-red-500 text-lg font-medium bg-red-50 dark:bg-red-900 px-6 py-4 rounded-lg">
//           Your browser doesn't support speech recognition.
//         </p>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setResponse(null);
//     setIsLoading(true);

//     try {
//       const res = await axios.post('http://localhost:8000/query', { text: question });
//       setResponse(res.data);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startListening = () => {
//     SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     SpeechRecognition.stopListening();
//     setIsListening(false);
//     setQuestion(transcript);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200">
//       <div className="container mx-auto max-w-3xl">
//         <motion.div 
//           className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 relative"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           {/* Theme Toggle Button */}
//           <button
//             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//             className="absolute top-6 right-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//           >
//             {theme === 'dark' ? (
//               <FaSun className="w-5 h-5 text-yellow-500" />
//             ) : (
//               <FaMoon className="w-5 h-5 text-gray-700" />
//             )}
//           </button>

//           <motion.h1 
//             className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <TypewriterText text="SQL Query Generator" />
//           </motion.h1>

//           <div className="space-y-6 mb-6">
//             {isLoading && (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//                 <p className="ml-3 text-blue-500 dark:text-blue-400 font-medium">Generating response...</p>
//               </div>
//             )}

//             {error && (
//               <motion.div 
//                 className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <p className="text-red-700 dark:text-red-400">{error}</p>
//               </motion.div>
//             )}

//             {response && (
//               <motion.div 
//                 className="space-y-6"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
//                     <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
//                     Generated SQL Query
//                   </h3>
//                   <motion.pre 
//                     className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-100 font-mono"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ duration: 0.5 }}
//                   >
//                     {response.query}
//                   </motion.pre>
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
//                     <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
//                     Query Results
//                   </h3>
//                   <div className="bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden">
//                     <div className="overflow-x-auto">
//                       {response.results.map((row, index) => (
//                         <motion.div 
//                           key={index} 
//                           className="p-3 border-b border-gray-700 last:border-0 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
//                           initial={{ opacity: 0, x: -10 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ duration: 0.3, delay: index * 0.1 }}
//                         >
//                           <code className="text-sm text-gray-100 font-mono">
//                             {JSON.stringify(row)}
//                           </code>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </div>

//           <motion.form 
//             onSubmit={handleSubmit} 
//             className="relative"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="relative flex items-center">
//               <button
//                 type="button"
//                 onClick={isListening ? stopListening : startListening}
//                 className={`absolute left-4 p-2 rounded-full transition-colors ${
//                   isListening 
//                     ? 'bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800' 
//                     : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
//                 }`}
//               >
//                 <FaMicrophone className="w-5 h-5" />
//               </button>

//               <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 placeholder="Type your question here or use the mic..."
//                 className="w-full pl-14 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
//               />

//               <button
//                 type="submit"
//                 className="absolute right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors disabled:opacity-50"
//                 disabled={isLoading}
//               >
//                 <FaArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </motion.form>

//           {transcript && (
//             <motion.div 
//               className="mt-4 text-center"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.4 }}
//             >
//               <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-full inline-block">
//                 {transcript}
//               </p>
//             </motion.div>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// "use client";
// import 'regenerator-runtime/runtime';
// import { useState } from 'react'
// import axios from 'axios'
// import { motion } from 'framer-motion'
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import { FaMicrophone } from "react-icons/fa";


// export default function Home() {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();

//   if (!browserSupportsSpeechRecognition) {
//     return <p>Your browser doesn't support speech recognition.</p>;
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setResponse(null);
//     setIsLoading(true);

//     try {
//       const res = await axios.post('http://localhost:8000/query', { text: question });
//       setResponse(res.data);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startListening = () => {
//     SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     SpeechRecognition.stopListening();
//     setIsListening(false);
//     setQuestion(transcript);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <motion.h1 
//         className="text-3xl font-bold mb-6 text-center"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         SQL Query Generator
//       </motion.h1>
      
//       <motion.form 
//         onSubmit={handleSubmit} 
//         className="mb-6 max-w-lg mx-auto"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="relative">
//           <input
//             type="text"
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder="Enter your question"
//             className="w-full p-3 pr-10 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
//           />
//           <button
//             type="button"
//             onClick={isListening ? stopListening : startListening}
//             className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
//           >
//             <FaMicrophone className={`w-5 h-5 ${isListening ? 'text-red-500' : ''}`} />
//           </button>
//         </div>
//         <motion.button 
//           type="submit" 
//           className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600 transition-all duration-300"
//           disabled={isLoading}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {isLoading ? 'Loading...' : 'Ask Question'}
//         </motion.button>
//       </motion.form>

//       {error && (
//         <motion.p 
//           className="text-red-500 text-center mb-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.3 }}
//         >
//           {error}
//         </motion.p>
//       )}

//       {response && (
//         <motion.div 
//           className="max-w-2xl mx-auto"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <motion.h2 
//             className="text-xl font-semibold mb-2 text-center"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//           >
//             Response
//           </motion.h2>

//           <div className="bg-gray-100 p-4 rounded mb-4 text-black shadow-lg">
//             <h3 className="font-semibold mb-2 text-blue-700">Generated SQL Query:</h3>
//             <motion.pre 
//               className="whitespace-pre-wrap bg-gray-200 p-2 rounded"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.4, delay: 0.3 }}
//             >
//               {response.query}
//             </motion.pre>
//           </div>

//           <div className="bg-gray-100 p-4 rounded text-black shadow-lg">
//             <h3 className="font-semibold mb-2 text-blue-700">Query Results:</h3>
//             {response.results.map((row, index) => (
//               <motion.p 
//                 key={index} 
//                 className="mb-1"
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
//               >
//                 {JSON.stringify(row)}
//               </motion.p>
//             ))}
//           </div>
//         </motion.div>
//       )}
//     </div>
//   )
// }


// "use client"
// import { useState } from 'react'
// import axios from 'axios'
// import { motion } from 'framer-motion'

// export default function Home() {
//   const [question, setQuestion] = useState('')
//   const [response, setResponse] = useState(null)
//   const [error, setError] = useState(null)
//   const [isLoading, setIsLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError(null)
//     setResponse(null)
//     setIsLoading(true)

//     try {
//       const res = await axios.post('http://localhost:8000/query', { text: question })
//       setResponse(res.data)
//     } catch (err) {
//       setError(err.response?.data?.detail || 'An error occurred')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <motion.h1 
//         className="text-3xl font-bold mb-6 text-center"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         SQL Query Generator
//       </motion.h1>
      
//       <motion.form 
//         onSubmit={handleSubmit} 
//         className="mb-6 max-w-lg mx-auto"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <input
//           type="text"
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           placeholder="Enter your question"
//           className="w-full p-3 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
//         />
//         <motion.button 
//           type="submit" 
//           className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600 transition-all duration-300"
//           disabled={isLoading}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {isLoading ? 'Loading...' : 'Ask Question'}
//         </motion.button>
//       </motion.form>

//       {error && (
//         <motion.p 
//           className="text-red-500 text-center mb-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.3 }}
//         >
//           {error}
//         </motion.p>
//       )}

//       {response && (
//         <motion.div 
//           className="max-w-2xl mx-auto"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <motion.h2 
//             className="text-xl font-semibold mb-2 text-center"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//           >
//             Response
//           </motion.h2>

//           <div className="bg-gray-100 p-4 rounded mb-4 text-black shadow-lg">
//             <h3 className="font-semibold mb-2 text-blue-700">Generated SQL Query:</h3>
//             <motion.pre 
//               className="whitespace-pre-wrap bg-gray-200 p-2 rounded"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.4, delay: 0.3 }}
//             >
//               {response.query}
//             </motion.pre>
//           </div>

//           <div className="bg-gray-100 p-4 rounded text-black shadow-lg">
//             <h3 className="font-semibold mb-2 text-blue-700">Query Results:</h3>
//             {response.results.map((row, index) => (
//               <motion.p 
//                 key={index} 
//                 className="mb-1"
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
//               >
//                 {JSON.stringify(row)}
//               </motion.p>
//             ))}
//           </div>
//         </motion.div>
//       )}
//     </div>
//   )
// }
