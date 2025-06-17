import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
  delay?: number; // debounce delay
};

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  delay = 400,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState(searchTerm);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  useEffect(() => {
    onSearch(debounced.trim());
  }, [debounced, onSearch]);

  return (
    <div className="flex items-center w-full max-w-sm rounded-2xl border px-4 py-2 shadow-sm bg-white focus-within:ring-2 ring-blue-500">
      <Search className="w-5 h-5 text-gray-500" />
      <input
        type="text"
        className="ml-3 w-full outline-none text-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
