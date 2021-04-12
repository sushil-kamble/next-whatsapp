import { Avatar, IconButton } from '@material-ui/core';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import { auth, db } from '../firebase';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { useCollection } from 'react-firebase-hooks/firestore';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import Message from './Message';
import { useState, useRef } from 'react';
import firebase from 'firebase';
import getRecipientEmail from '../utils/getRecipientEmail';
import Timeago from 'timeago-react';

function ChatScreen({ chat, messages }) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [input, setInput] = useState('');
  const endOfMessageRef = useRef(null);
  const [messagesSnapshot] = useCollection(
    db
      .collection('chats')
      .doc(router.query.id)
      .collection('messages')
      .orderBy('timestamp', 'asc')
  );
  const [recipientSnapshot] = useCollection(
    db
      .collection('users')
      .where('email', '==', getRecipientEmail(chat.users, user))
  );

  const scollToBottom = () => {
    endOfMessageRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const showMessage = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data().timestamp?.toDate().getTime()
          }}
        />
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message key={message.id} user={message.user} message={message} />
      ));
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    // Update Last Seen
    db.collection('users').doc(user.id).set(
      {
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    // Send Message
    db.collection('chats').doc(router.query.id).collection('messages').add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      user: user.email,
      photoUrl: user.photoURL
    });

    setInput('');
    scollToBottom();
    // Scroll Bottom
  };
  const recipient = recipientSnapshot?.docs?.[0]?.data();
  const recipientEmail = getRecipientEmail(chat.users, user);
  return (
    <Container>
      <Header>
        <Avatar />
        <HeaderInformation>
          <h3>{recipientEmail}</h3>
          {recipientSnapshot ? (
            <span>
              Last Active: {'  '}
              {recipient?.lastSeen?.toDate() ? (
                <Timeago datetime={recipient?.lastSeen?.toDate()} />
              ) : (
                'Unavailable'
              )}
            </span>
          ) : (
            <span>Loading Last Active... </span>
          )}
        </HeaderInformation>
        <HeaderIcon>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
        </HeaderIcon>
      </Header>
      <MessageContainer>
        {showMessage()}
        <EndOfMessage ref={endOfMessageRef} />
      </MessageContainer>
      <InputContainer>
        <InsertEmoticonIcon />
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <button
          hidden
          disabled={!input}
          type="submit"
          onClick={sendMessage}
        ></button>
        <MicIcon />
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div``;
const Input = styled.input`
  flex: 1;
  outline: 0;
  padding: 20px;
  border-radius: 10px;
  border: none;
  margin-left: 15px;
  margin-right: 15px;
  background-color: whitesmoke;
`;

const Header = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  padding: 11px;
  height: 70px;
  top: 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid whitesmoke;
`;
const HeaderInformation = styled.div`
  margin-left: 15px;
  flex: 1;
  > h3 {
    margin-bottom: 1px;
    margin-top: 0px;
  }
`;
const HeaderIcon = styled.div``;
const MessageContainer = styled.div`
  padding: 95px 30px 30px;
  background-color: rgb(230, 222, 218);
  min-height: 90vh;
`;
const EndOfMessage = styled.div`
  margin-bottom: 60px;
`;
const InputContainer = styled.form`
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0px;
  background-color: rgb(255, 255, 255);
  z-index: 100;
`;
