import React, { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");        // User input
  const [aiResponse, setAiResponse] = useState(""); // AI output
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState("");         // Error handling

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiResponse("");
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/process_prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.ai_response) {
        setAiResponse(data.ai_response);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Banyan AI</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="5"
          style={{ width: "100%", padding: 10, fontSize: 16 }}
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        ></textarea>
        <button
          type="submit"
          style={{
            marginTop: 10,
            padding: "10px 20px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {aiResponse && (
        <div style={{ marginTop: 20, padding: 10, border: "1px solid #ddd", background: "#f9f9f9" }}>
          <h3>AI Response:</h3>
          <p>{aiResponse}</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20, color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default App;
