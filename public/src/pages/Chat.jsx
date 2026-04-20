import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();

  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  // ✅ CHECK USER (fixed async issue)
  useEffect(() => {
    const checkUser = async () => {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      } else {
        setCurrentUser(
          JSON.parse(
            localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
          )
        );
      }
    };
    checkUser();
  }, [navigate]);

  // ✅ SOCKET CONNECTION
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  // ✅ FETCH CONTACTS (fixed async issue)
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(
            `${allUsersRoute}/${currentUser._id}`
          );
          setContacts(data.data);
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate]);

  // ✅ CHANGE CHAT
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY);
    navigate("/login");
  };

  return (
    <Container>
      {/* 🔝 TOP BAR WITH LOGOUT */}
      <div className="top-bar">
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} />

        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
      </div>
    </Container>
  );
}

// ✅ STYLES
const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #131324;

  .top-bar {
    width: 85vw;
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .top-bar button {
    padding: 6px 14px;
    background-color: #ff4d4f;
    border: none;
    color: white;
    border-radius: 6px;
    cursor: pointer;
  }

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    margin-top: 10px;

    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;