import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

const querySuggestions = [
  "Number of good coils produced for each day",
  "Number of good yield coils with weight more than 22 tons",
  "Grade-wise production for each shift",
  "Average coil weight for each day",
  "Coil with the most width for each shift",
  "Total coil production this month",
  "Number of coils with weight more than 20 tons in stock",
];

export default function QuerySearch() {
  const [question, setQuestion] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (question.length > 0) {
      const filtered = querySuggestions.filter((query) =>
        query.toLowerCase().includes(question.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [question]);

  const handleSelectSuggestion = (query) => {
    setQuestion(query);
    setShowSuggestions(false);
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
    >
      <div className="max-w-5xl mx-auto px-4 py-4">
        <motion.form onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            {/* Suggestions Panel */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.ul
                  className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg mb-2 shadow-lg overflow-hidden max-h-48 overflow-y-auto mx-20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {filteredSuggestions.map((query, index) => (
                    <motion.li
                      key={index}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 dark:border-gray-600"
                      onClick={() => handleSelectSuggestion(query)}
                      whileHover={{ backgroundColor: "rgb(243 244 246)" }}
                    >
                      {query}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {/* Input Section */}
            <div className="flex items-center mx-20 gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything about your data..."
                className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              
              <motion.button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MdOutlineSettingsInputComposite />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setIsListening(!isListening)}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaMicrophone className="text-gray-600 dark:text-gray-300" />
              </motion.button>

              <motion.button 
                type="submit"
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoSend />
              </motion.button>
            </div>

            {/* Custom Input Panel */}
            <AnimatePresence>
              {showCustomInput && (
                <motion.div 
                  className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mx-20"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="space-y-4">
                    <select 
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200"
                      onChange={handleSelectionChange} 
                      value={selectedOption}
                    >
                      <option value="" disabled>Select custom input type</option>
                      <option value="good_yield">Yield input</option>
                      <option value="good_coil">Good coil values</option>
                    </select>

                    {selectedOption === 'good_yield' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <label className="block">
                          <span className="text-gray-700 dark:text-gray-300 block mb-2">Target Yield (%)</span>
                          <input
                            type="text"
                            placeholder="e.g., 97"
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200"
                            value={yieldValue}
                            onChange={handleYieldChange}
                          />
                        </label>
                      </motion.div>
                    )}

                    {selectedOption === 'good_coil' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <label className="block">
                          <span className="text-gray-700 dark:text-gray-300 block mb-2">Width</span>
                          <input
                            type="text"
                            placeholder="Enter width range"
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200"
                            value={widthValue}
                            onChange={handleWidthChange}
                          />
                        </label>
                        <label className="block">
                          <span className="text-gray-700 dark:text-gray-300 block mb-2">Thickness</span>
                          <input
                            type="text"
                            placeholder="Enter thickness range"
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200"
                            value={thicknessValue}
                            onChange={handleThicknessChange}
                          />
                        </label>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
}