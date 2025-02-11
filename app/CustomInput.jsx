"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useTheme } from "next-themes";
import Link from "next/link";
import BarChart from "./BarChart";
import TableWithExport from "./TableWithExport";

export default function CustomInput() {
  const [customQuery, setCustomQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/rec1", { text: customQuery });
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const ResultDisplay = ({ data }) => {
    if (!data) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4"
      >
        {/* Query Display */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Query:</h3>
          <p className="text-gray-900 dark:text-gray-100">{data.query}</p>
        </div>

        {/* Results Display */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Results:</h3>
          {data.gemini_output?.format === "table" && <TableWithExport data={data} />}
          {data.gemini_output?.format === "text" && (
            <p className="text-gray-900 dark:text-gray-100">{data.gemini_output.description}</p>
          )}
          {data.gemini_output?.format === "graph" && (
            <div className="w-full">
              <BarChart data={data.gemini_output} />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""} flex justify-center`}>
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold items-center content-center text-center">
            Custom Query Input
          </h1>
          <Link href="/">
            <h1 className="text-blue-500 underline">Back to Home</h1>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Enter your custom SQL query..."
            className="p-3 border rounded w-full text-gray-800 dark:text-gray-200 dark:bg-gray-700"
            rows={5}
          ></textarea>

          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 w-full"
          >
            Submit Custom Query
          </button>
        </form>

        {isLoading && <p className="text-center text-blue-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {response && <ResultDisplay data={response} />}
      </div>
    </div>
  );
}
