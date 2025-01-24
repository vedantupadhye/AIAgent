import { useState } from "react";

const Selection = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [values, setValues] = useState({
    good_coils_width: "",
    good_coils_thickness: "",
    good_yield: "",
  });

  const handleSelectionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleInputChange = (field, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  return (
    <div className="p-4 border border-gray-300 rounded w-full max-w-md mx-auto">
      <p className="my-2 text-lg font-semibold">Custom Input</p>
      <select
        className="p-2 border border-gray-300 rounded w-full my-2"
        onChange={handleSelectionChange}
        value={selectedOption}
      >
        <option value="" disabled>
          Select an option
        </option>
        <option value="good_coils">Good Coils</option>
        <option value="good_yield">Good Yield</option>
      </select>

      {selectedOption === "good_coils" && (
        <div className="mt-4">
          <label className="block mb-2">
            <span>Width (±13):</span>
            <input
              type="number"
              placeholder="Enter width"
              className="p-2 border border-gray-300 rounded w-full"
              value={values.good_coils_width}
              onChange={(e) => handleInputChange("good_coils_width", e.target.value)}
            />
          </label>
          <label className="block mb-2">
            <span>Thickness (±0.013):</span>
            <input
              type="number"
              placeholder="Enter thickness"
              className="p-2 border border-gray-300 rounded w-full"
              value={values.good_coils_thickness}
              onChange={(e) => handleInputChange("good_coils_thickness", e.target.value)}
            />
          </label>
        </div>
      )}

      {selectedOption === "good_yield" && (
        <div className="mt-4">
          <label className="block mb-2">
            <span>Yield (%):</span>
            <input
              type="text"
              placeholder="Enter yield (e.g., 97%)"
              className="p-2 border border-gray-300 rounded w-full"
              value={values.good_yield}
              onChange={(e) => handleInputChange("good_yield", e.target.value)}
            />
          </label>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-bold">Current Values:</h3>
        <p className="bg-gray-100 p-4 text-black rounded text-sm mt-2">
          {JSON.stringify(values, null, 2)}
        </p>
      </div>
    </div>
  );
};

export default Selection;
