export const formatPublishDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    "Digital Health": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Oncology: "bg-red-500/20 text-red-400 border-red-500/30",
    MedTech: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Medical Training": "bg-green-500/20 text-green-400 border-green-500/30",
    "Personalized Medicine":
      "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Mental Health": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "Healthcare IT": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Bioengineering: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    "Pharmaceutical AI":
      "bg-violet-500/20 text-violet-400 border-violet-500/30",
    "Remote Care": "bg-teal-500/20 text-teal-400 border-teal-500/30",
    Nanotechnology: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    Genomics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return (
    colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  );
};
