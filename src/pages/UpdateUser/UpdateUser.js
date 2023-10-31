import countryList from '../../helpers/countryList';
import ApiLink from '../../helpers/ApiLink';
import { useState, useContext, useEffect } from 'react';
import UserContext from "../../contexts/UserContext";
import useFields from '../../hooks/useFields';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import '../../sharedCSS/AuthForm.css';
import '../../sharedCSS/styledClasses.css';

const UpdateUser = () => {
  const navigate = useNavigate();

  const [alertMessages, setAlertMessages] = useState();

  const { currentUser, setAdditionalInfo, updateUserInfo } = useContext(UserContext);

  const { formData, handleFieldChange, setFields, resetFormData } = useFields({
    country: currentUser.country,
    email: currentUser.email || '',
    bio: currentUser.bio || '',
    currPassword: ''
  }, {bio: 300});

  useEffect(() => {
    const getData = async () => {
      if (!currentUser.bio) {
        let data = await ApiLink.getUser(currentUser.userId);
        setAdditionalInfo({ bio: data.bio, email: data.email });
        setFields({ bio: data.bio, email: data.email });
      }
    }
    getData();
  }, [currentUser.userId, currentUser.bio, setAdditionalInfo]);

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
        <h2>Update User Info</h2>
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
          <FormControl className="AuthForm-field">
            <InputLabel id="country-label">Country</InputLabel>
            <Select
              labelId="country-label"
              id="country-select"
              name="country"
              value={formData.country}
              label="Country"
              onChange={handleFieldChange}
              fullWidth
            >
              <MenuItem value=''></MenuItem>
              {countryList.map((country) => <MenuItem value={country} key={country}>{country}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Email"
            variant="outlined"
            id="email"
            name="email"
            className="AuthForm-field"
            value={formData.email}
            onChange={handleFieldChange}
            fullWidth
            error={false}
          />
          <TextField
            label="Bio"
            variant="outlined"
            id="bio"
            name="bio"
            className="AuthForm-field"
            value={formData.bio}
            onChange={handleFieldChange}
            fullWidth
            multiline
            minRows={3}
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
          <Button className="AuthForm-button" variant="contained" type="submit">Submit</Button>
        </form>
        {alertMessages && alertMessages.map((msg) => {
          return <Alert className="AuthForm-error" severity="error">{msg}</Alert>
        })}
      </div>
    </div>
  )
}

export default UpdateUser;