import React, { useState } from "react";
import { Room, RoomEvent } from "livekit-client";

function AlaskaAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // ================== CHAT ==================
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

      if (!res.ok) {
        const errText = await res.text();
        setMessages([
          ...newMessages,
          { from: "error", text: `Ultravox chat error: ${res.status} - ${errText}` },
        ]);
        return;
      }

      const data = await res.json();
      setMessages([...newMessages, { from: "bot", text: data.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { from: "error", text: `Network/Backend error: ${err.message}` },
      ]);
    }

    setInput("");
  };

  // ================== START CALL ==================
  const startCall = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ultravox/start-call`, {
        method: "POST",
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages((prev) => [
          ...prev,
          { from: "error", text: `Start call error: ${res.status} - ${errText}` },
        ]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { from: "system", text: `📞 Call started: ID=${data.callId}, status=${data.status}` },
      ]);

      if (data.livekitUrl && data.token) {
        const room = new Room();

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === "audio") {
            const audioEl = track.attach();
            document.body.appendChild(audioEl);
          }
        });

        await room.connect(data.livekitUrl, data.token);

        const tracks = await Room.createLocalTracks({ audio: true });
        await room.localParticipant.publishTrack(tracks[0]);

        console.log("✅ Connected to Ultravox LiveKit session");
      }
    } catch (err) {
      console.error("Start call error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "error", text: `Network/Backend error: ${err.message}` },
      ]);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.from}`}
            style={{
              color: msg.from === "error" ? "red" : "black",
              fontWeight: msg.from === "error" ? "bold" : "normal",
            }}
          >
            <b>
              {msg.from === "user"
                ? "You: "
                : msg.from === "bot"
                ? "Agent: "
                : msg.from === "system"
                ? "System: "
                : "Error: "}
            </b>
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
