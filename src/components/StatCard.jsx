const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center border border-gray-100 flex-1">
      <div className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2 text-center">{title}</div>
      <div className="text-2xl font-bold text-gray-900 text-center">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1 text-center">{subtitle}</div>}
    </div>
  );
};

export default StatCard;