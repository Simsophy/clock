export default function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#0b0f1a] border border-gray-800 p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-white text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}