import { Avatar, IconButton } from '@material-ui/core';
import styled from 'styled-components';
import ChatIcon from '@material-ui/icons/Chat';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { auth, db } from '../firebase';
import Link from 'next/link';
import Chat from './Chat';
import Dialog from './Dialog';
import Circle from 'better-react-spinkit/dist/Circle';

function Sidebar() {
  const [user] = useAuthState(auth);
  const userChatRef = db
    .collection('chats')
    .where('users', 'array-contains', user.email);
  const [chatsSnapshot] = useCollection(userChatRef);

  const userLogout = () => {
    auth.signOut();
  };

  return (
    <Container>
      <Header>
        <Link href="/">
          <UserAvatar src={user?.photoURL} />
        </Link>
        <IconsContainer>
          <IconButton>
            <ChatIcon></ChatIcon>
          </IconButton>
          <IconButton>
            <MoreVertIcon></MoreVertIcon>
          </IconButton>
          <IconButton onClick={userLogout}>
            <ExitToAppIcon />
          </IconButton>
        </IconsContainer>
      </Header>
      <Search>
        <SearchIcon />
        <SearchInput placeholder="Search in chats" />
      </Search>
      <Dialog />
      {chatsSnapshot ? (
        chatsSnapshot?.docs.map((doc) => (
          <Chat key={doc.id} id={doc.id} users={doc.data().users} />
        ))
      ) : (
        <div style={{ marginLeft: '40%', width: '100%', marginTop: '100px' }}>
          <Circle color="#3CBC28" size={60} />
        </div>
      )}
    </Container>
  );
}

export default Sidebar;

const Container = styled.div`
  flex: 0.45;
  border-right: 1px solid whitesmoke;
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  --ms-overflow-style: none;
  scrollbar-width: none;
`;
const Search = styled.div`
  display: flex;
  border-radius: 2px;
  align-items: center;
  padding: 20px;
`;
const SearchInput = styled.input`
  outline-width: 0;
  border: none;
  flex: 1;
`;
const Header = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  align-items: center;
  background-color: white;
  justify-content: space-between;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;
const UserAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;
const IconsContainer = styled.div``;
