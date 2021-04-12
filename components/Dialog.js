import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as EmailValidator from 'email-validator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useState } from 'react';

export default function FormDialog() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [user] = useAuthState(auth);
  const userChatRef = db
    .collection('chats')
    .where('users', 'array-contains', user.email);
  const [chatsSnapshot] = useCollection(userChatRef);
  const chatAlreadyExists = (recipientEmail) =>
    chatsSnapshot?.docs.find(
      (chat) =>
        !!(
          chat.data().users.find((user) => user === recipientEmail)?.length > 0
        )
    );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setFeedback(null);
    setOpen(false);
  };

  const createChat = () => {
    if (!input) return null;
    if (
      EmailValidator.validate(input) &&
      !chatAlreadyExists(input) &&
      input !== user.email
    ) {
      db.collection('chats').add({
        users: [user.email, input]
      });
      handleClose();
    } else {
      setFeedback('Please check your email address.');
    }
  };

  return (
    <div>
      <Button
        onClick={handleClickOpen}
        style={{ width: '100%', marginBottom: '20px' }}
      >
        Create New Chat
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create New Chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Provide the email address of of the user you want to chat with.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            onChange={(e) => setInput(e.target.value)}
            label="Email Address"
            type="email"
            fullWidth
          />
          <h4 style={{ color: 'red' }}>{feedback ? feedback : ''}</h4>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={createChat} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
