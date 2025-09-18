import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsgs = [...messages, { from: "You", text: input }];
    setMessages(newMsgs);
    setInput("");

    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ultravox/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await resp.json();
      setMessages((prev) => [...prev, { from: "Agent", text: data.reply || JSON.stringify(data) }]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: "Agent", text: "⚠️ Error contacting backend" }]);
    }
  };

  const startCall = async () => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ultravox/start-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await resp.json();
      setMessages((prev) => [...prev, { from: "System", text: `📞 Call started: ${JSON.stringify(data)}` }]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: "System", text: "⚠️ Error starting call" }]);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🏥 Alaska Super Hospital Voice Agent</h2>

      <div style={{ border: "1px solid #ccc", padding: 10, height: 300, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i}><b>{m.from}:</b> {m.text}</div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          style={{ width: "70%" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={startCall} style={{ marginLeft: 10 }}>Start Call</button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
