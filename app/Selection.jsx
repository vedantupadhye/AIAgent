import { useState } from "react";

const Selection = () => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleSelectionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div>
      <p className="my-2">Custom Input</p>
      <select
        className="p-4 w-full my-2"
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
          <input
            type="number"
            placeholder=" Width = +/-13"
            className="p-2 border border-gray-300 rounded mb-2 w-full"
          />
          <input
            type="number"
            placeholder="thickness = +/-0.013"
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
      )}

      {selectedOption === "good_yield" && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="97%"
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
      )}
    </div>
  );
};

export default Selection;
