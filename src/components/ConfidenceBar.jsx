const ConfidenceBar = ({ value, colorClass, label = "Keyakinan Model AI" }) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700 tracking-wide uppercase">{label}</span>
        <span className="text-lg font-bold text-gray-900">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;
