import React, { useEffect, useRef, useState } from "react";
import "./ChatBotApp.css";
import OpenAI from "openai";

const ChatBotApp = ({
  onGoBack,
  chats,
  setChats,
  activeChat,
  setActiveChat,
  onNewChat,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState(chats[0]?.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  //rerender when activeChat or chats are updated
  useEffect(() => {
    const activeChatObj = chats.find((chat) => chat.id === activeChat);
    setMessages(activeChatObj ? activeChatObj.messages : []);
  }, [activeChat, chats]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (inputValue.trim === "") return;

    const newMessage = {
      type: "prompt",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    console.log("active chat check", activeChat, !activeChat);

    if (!activeChat) {
      onNewChat(inputValue);
      setInputValue("");
    } else {
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInputValue("");

      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });
      setChats(updatedChats);
      setIsTyping(true)

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        store: true,
        messages: [{ role: "user", content: inputValue }],
        max_tokens: 500,
      });

      const chatResponse = response.choices[0].message.content.trim();
      const newResponse = {
        type: "response",
        text: chatResponse,
        timestamp: new Date().toLocaleDateString(),
      };

      console.log("response",newResponse)

      const updatedMessagesWithResponses = [ ...updatedMessages, newResponse ];
      setMessages(updatedMessagesWithResponses);
      setIsTyping(false);

      const updatedChatsWithResponse = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessagesWithResponses };
        }
        return chat;
      });
      setChats(updatedChatsWithResponse);
    }
  };

  const handleKeyDown = (e) => {
    //   console.log("here", e.key)
    if (e.key === "Enter") {
      e.preventDefault;
      sendMessage();
    }
  };

  const handleSelectChat = (id) => {
    setActiveChat(id);
  };

  const handleDeleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id != id);
    setChats(updatedChats);
    if (id === activeChat) {
      const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
      setActiveChat(newActiveChat);
    }
  };

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages])
  

  return (
    <div className="chat-app">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2> Chat List</h2>

          <i
            className="bx bx-edit-alt new-chat"
            onClick={() => onNewChat()}></i>
        </div>

        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-list-item ${
              chat.id === activeChat ? "active" : ""
            }`}
            onClick={() => handleSelectChat(chat.id)}>
            <h4>{chat.displayId}</h4>
            <i
              className="bx bx-x circle"
              onClick={(e) => {
                e.stopPropagation;
                handleDeleteChat(chat.id);
              }}></i>
          </div>
        ))}
      </div>
      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat with AI</h3>
          <i className="bx bx-arrow-back arrow" onClick={onGoBack}></i>
        </div>

        <div className="chat">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.type === "prompt" ? "prompt" : "response"}>
              {msg.text} <span>{msg.timestamp}</span>
            </div>
          ))}

        {isTyping && <div className="typing">Typing...<i class="fa-regular fa-clock"></i> </div>}
            <div ref={chatEndRef}></div>
        </div>
        <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
          <i className="fa-solid fa-face-smile emoji"></i>
          <input
            type="text"
            className="msg-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <i className="fa-solid fa-paper-plane" onClick={sendMessage}></i>
        </form>
      </div>
    </div>
  );
};

export default ChatBotApp;
