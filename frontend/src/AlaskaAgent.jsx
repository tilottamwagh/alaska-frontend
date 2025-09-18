import React, { useState } from "react";

function AlaskaAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);

    const res = await fetch("alaska-backend-production.up.railway.app/api/ultravox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });

    const data = await res.json();
    setMessages([...newMessages, { from: "bot", text: data.reply || "No response" }]);
    setInput("");
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.from}>
            <b>{msg.from === "user" ? "You: " : "Agent: "}</b> {msg.text}
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
      </div>
    </div>
  );
}

export default AlaskaAgent;
