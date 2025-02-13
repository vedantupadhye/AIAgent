"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

const FAQData = [
  { question: "What is the average coil weight for each day? " },
  { question: "Coil with the most width for each shift? " },
  { question: "What is the grade-wise production for each shift " },
  { question: "Number of good coils produced for each day " },
  { question: "Number of good yield coils with weight more than 22 tons" },
  { question: "What is the average coil weight for each day? " },
];

const FAQ = ({ setQuestion }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-500 text-transparent bg-clip-text mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FAQData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: hoveredIndex === index ? 1.02 : 1,
                  boxShadow: hoveredIndex === index 
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
                className="h-full bg-gradient-to-br from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <button
                  onClick={() => {
                    setExpandedIndex(expandedIndex === index ? null : index);
                    setQuestion(faq.question);
                  }}
                  className="w-full h-full p-6 text-left group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-cyan-500 transition-colors duration-200">
                      {faq.question}
                    </h3>
                  </div>
                </button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FAQ;
