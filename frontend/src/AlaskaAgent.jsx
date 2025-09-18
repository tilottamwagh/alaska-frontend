import React, { useState } from "react";

function AlaskaAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ultravox/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();
      setMessages([...newMessages, { from: "bot", text: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { from: "bot", text: "⚠️ Error contacting agent." }]);
    }

    setInput("");
  };

  const startCall = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ultravox/start-call`, {
        method: "POST",
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { from: "system", text: `📞 Call started: ID=${data.callId}, status=${data.status}` },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "system", text: "⚠️ Error starting call." },
      ]);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.from}>
            <b>{msg.from === "user" ? "You: " : msg.from === "bot" ? "Agent: " : "System: "}</b>{" "}
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={startCall}>📞 Start Call</button>
      </div>
    </div>
  );
}

export default AlaskaAgent;
