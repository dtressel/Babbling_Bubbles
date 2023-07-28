import { useState, useEffect } from 'react';
import ApiLink from '../helpers/ApiLink';

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  console.log(currentUser);

  useEffect(() => {
    const getUserInfo = async () => {
      const user = await ApiLink.getUser(currentUser.userId);
      setCurrentUser(user);
    }
    if (currentUser && !currentUser.email) {
      getUserInfo();
    } 
  }, [currentUser]);

  if (currentUser === undefined) {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      savedUser.applications = [];
      const { token, ...rest } = savedUser;
      setCurrentUser(rest);
      ApiLink.token = token;
    }
  }

  const signupUser = async (signupInfo) => {
    try {
      const newToken = await ApiLink.signupUser(signupInfo);
      ApiLink.token = newToken;
      const user = await ApiLink.getUser(signupInfo.username);
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify({ username: user.username, firstName: user.firstName, token: newToken }));
      return { successful: true };
    }
    catch(err) {
      return { successful: false, messages: err };
    }
  }

  const loginUser = async (loginInfo) => {
    try {
      const newToken = await ApiLink.loginUser(loginInfo);
      ApiLink.token = newToken;
      const user = await ApiLink.getUser(loginInfo.username);
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify({ username: user.username, firstName: user.firstName, token: newToken }));
      return { successful: true };
    }
    catch(err) {
      return { successful: false, messages: err };
    }
  }

  const logoutUser = () => {
    ApiLink.token = null;
    setCurrentUser(null);
    localStorage.removeItem("user");
  }

  const validatePassword = async (password) => {
    try {
      await ApiLink.loginUser({ username: currentUser.username, password: password });
      return true;
    }
    catch {
      return false;
    }
  }

  const updateUser = async (updateInfo) => {
    try {
      const updatedUser = await ApiLink.updateUser(currentUser.username, updateInfo);
      setCurrentUser(() => ({ ...updatedUser, applications: currentUser.applications }));
      localStorage.setItem("user", JSON.stringify({ username: updatedUser.username, firstName: updateInfo.firstName, token: ApiLink.token }));
      return {updated: true, message: "User profile successfully updated!"}
    }
    catch {
      return {updated: false, message: "Server error. User profile not updated. Please try again later!"}
    }
  }

  const addApplication = async (jobId) => {
    try {
      await ApiLink.applyJob(currentUser.username, jobId);
      setCurrentUser(() => ({...currentUser, applications: [...currentUser.applications, jobId]}));
      return true;
    }
    catch {
      return false;
    }
  }

  return [currentUser, signupUser, loginUser, logoutUser, validatePassword, updateUser, addApplication];
}

export default useCurrentUser;