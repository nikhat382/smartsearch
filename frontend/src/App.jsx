import React, { useState } from "react";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file!");
    const formData = new FormData();
    formData.append("file", selectedFile); // must match backend

    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      // Add extracted text to chat messages
      setMessages(prev => [...prev, { role: "assistant", text: data.extractedText }]);
      alert("📄 Document uploaded successfully!");
    } else {
      alert(" Error uploading file: " + data.error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: input }]);

    const res = await fetch("http://localhost:5000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();
    setMessages(prev => [...prev, { role: "assistant", text: data.answer }]);
    setInput("");
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>SmartDocs</h2>
        <button className="new-chat-btn">+ New Chat</button>
        <div className="chat-history">
          <p>Chat 1</p>
          <p>Chat 2</p>
        </div>
        <div className="footer">
          <p>{currentDate}</p>
          <p>{currentTime}</p>
        </div>
      </div>

      <div className="main-area">
        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="empty-message">
              <h2>Ask anything about your document 📄</h2>
              <p>Upload a file and start chatting with it.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                <p>{msg.text}</p>
              </div>
            ))
          )}
        </div>

        <div className="bottom-input">
          <input type="file" onChange={handleFileChange} className="file-input" />
          <button onClick={handleUpload} className="upload-btn">Upload</button>

          <input
            type="text"
            placeholder="Ask anything about the document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="chat-input"
          />
          <button onClick={handleSend} className="send-btn">Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
