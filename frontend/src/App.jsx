import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setLoading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setLoading(false);

      setChat((prev) => [...prev, { sender: "System", message: data.message }]);
    } catch (err) {
      setLoading(false);
      setChat((prev) => [...prev, { sender: "System", message: "Upload failed" }]);
    }
  };

  const handleSearch = async () => {
    if (!query) return alert("Please type something to search");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.results) {
        data.results.forEach((line) => {
          setChat((prev) => [...prev, { sender: "Document", message: line }]);
        });
      } else {
        setChat((prev) => [...prev, { sender: "System", message: data.message }]);
      }

      setQuery(""); // clear input
    } catch (err) {
      setLoading(false);
      setChat((prev) => [...prev, { sender: "System", message: "Search failed" }]);
    }
  };

  return (
    <div className="app-container">
      <h2>Smart Document Search</h2>

      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          Upload
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type anything to search"
        />
        <button onClick={handleSearch} disabled={loading}>
          Search
        </button>
      </div>

      <div className="chat-box">
        {chat.map((msg, idx) => (
          <div key={idx} className="chat-message">
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
        {loading && <div>Loading...</div>}
      </div>
    </div>
  );
}

export default App;
