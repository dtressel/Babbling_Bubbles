import { useState, useContext } from 'react';
import UserContext from "../../contexts/UserContext";
import useFields from '../../hooks/useFields';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import '../../sharedCSS/AuthForm.css';

const Register = () => {
  const { formData, handleFieldChange, resetFormData } = useFields({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const [alertMessages, setAlertMessages] = useState();
  const { signupUser } = useContext(UserContext);

  const handleSubmit = async evt => {
    evt.preventDefault();
    const res = await signupUser(formData);
    if (res.successful) {
      resetFormData();
      navigate("/");
    }
    else {
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
      <div className="AuthForm-innerWrapper">
        <h2>Register</h2>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            id="username"
            name="username"
            className="AuthForm-field"
            value={formData.username}
            onChange={handleFieldChange}
            required
            fullWidth
            error={false}
          />
          <TextField
            label="Email"
            variant="outlined"
            id="email"
            name="email"
            className="AuthForm-field"
            value={formData.email}
            onChange={handleFieldChange}
            required
            fullWidth
            error={false}
          />
          <TextField
            label="Password"
            variant="outlined"
            id="password"
            name="password"
            className="AuthForm-field"
            type="password"
            value={formData.password}
            onChange={handleFieldChange}
            required
            fullWidth
            error={false}
          />
          <TextField
            label="Confirm Password"
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

export default Register;