import { useState, useContext } from 'react';
import UserContext from "../../contexts/UserContext";
import useFields from '../../hooks/useFields';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import '../../sharedCSS/AuthForm.css';
import '../../sharedCSS/styledClasses.css';

const ChangePassword = () => {
  const { formData, handleFieldChange, resetFormData } = useFields({
    currPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const [alertMessages, setAlertMessages] = useState();
  const { currentUser, updateUserInfo } = useContext(UserContext);

  const handleSubmit = async evt => {
    evt.preventDefault();
    const res = await updateUserInfo(formData);
    console.log(res);
    if (res.updated) {
      resetFormData();
      navigate("/");
    }
    else {
      console.log(res);
      // Figure out what's going on here and come up with a better solution
      // passwords do not match error comes in as an error object
      if (!Array.isArray(res.messages)) {
        res.messages = [res.messages.message];
      }
      setAlertMessages(res.messages);
    }
  }

  return (
    <div className="AuthForm">
      <div className="AuthForm-innerWrapper rounded-paper">
        <h2>Update Password</h2>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            id="username"
            name="username"
            className="AuthForm-field"
            value={currentUser.username}
            disabled
            fullWidth
            error={false}
          />
          <TextField
            label="Current Password"
            variant="outlined"
            id="currPassword"
            name="currPassword"
            className="AuthForm-field"
            type="password"
            value={formData.currPassword}
            onChange={handleFieldChange}
            required
            fullWidth
            error={false}
          />
          <TextField
            label="New Password"
            variant="outlined"
            id="newPassword"
            name="newPassword"
            className="AuthForm-field"
            type="password"
            value={formData.newPassword}
            onChange={handleFieldChange}
            required
            fullWidth
            error={false}
          />
          <TextField
            label="Confirm New Password"
            variant="outlined"
            id="confirmPassword"
            name="confirmPassword"
            className="AuthForm-field"
            type="password"
            value={formData.confirmPassword}
            onChange={handleFieldChange}
            required
            fullWidth
            error={false}
          />
          <Button className="AuthForm-button" variant="contained" type="submit">Submit</Button>
        </form>
        {alertMessages && alertMessages.map((msg) => {
          return <Alert className="AuthForm-error" severity="error">{msg}</Alert>
        })}
      </div>
    </div>
  )
}

export default ChangePassword;