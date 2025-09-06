import { useLocation, useNavigate } from "react-router-dom";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Scraped & Enriched Data</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(state, null, 2)}
      </pre>
      <button
        className="mt-6 bg-gray-500 text-white px-4 py-2 rounded"
        onClick={() => navigate("/")}
      >
        Back
      </button>
    </div>
  );
}
