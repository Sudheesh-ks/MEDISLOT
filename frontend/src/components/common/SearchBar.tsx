import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

type SearchBarProps = { placeholder?: string; onSearch: (query: string) => void; delay?: number };

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search…", onSearch, delay = 400 }) => {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  useEffect(() => { onSearch(debounced.trim()); }, [debounced, onSearch]);

  return (
    <div className="flex items-center w-full max-w-sm rounded-2xl px-4 py-2 bg-white/5 backdrop-blur ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-cyan-500">
      <Search className="w-5 h-5 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="ml-3 w-full bg-transparent outline-none text-sm placeholder:text-slate-500"
      />
    </div>
  );
};

export default SearchBar;