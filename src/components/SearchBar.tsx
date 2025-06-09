// components/SearchBar.tsx
import { BeatLoader } from "react-spinners";

const SearchBar = ({
  value = "",
  onChange = (val: string) => {},
  onSearch = () => {},
  loading = false,
}) => {
  return (
    <div className="w-[400px] mt-5 flex gap-2">
      <input
        className="border border-gray-300 rounded p-2 w-full"
        type="text"
        placeholder="What are you looking for?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        id="search-button"
        className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center"
        onClick={onSearch}
      >
        {loading ? <BeatLoader color="#fff" size={6} /> : "Search"}
      </button>
    </div>
  );
};

export default SearchBar;
