import { useState, useEffect } from 'react';
import ApiLink from '../helpers/ApiLink';

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(undefined);

  if (currentUser === undefined) {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      const { token, ...rest } = savedUser;
      setCurrentUser(rest);
      ApiLink.token = token;
    }
  }

  console.log(currentUser);

  /* 
    signupInfo is an object
      Must include: username,  email, password, confirmPassword
      May include: firstName, lastName, country
  */
  const signupUser = async (signupInfo) => {
    try {
      if (signupInfo.password !== signupInfo.confirmPassword) {
        throw new Error('Passwords do not match!');
      }
      delete signupInfo.confirmPassword;
      const userData = await ApiLink.signupUser(signupInfo);
      ApiLink.token = userData.token;
      setCurrentUser(userData.user);
      localStorage.setItem("user", JSON.stringify(
        {
          userId: userData.user.userId,
          username: userData.user.username,
          permissions: userData.user.permissions,
          country: userData.user.country,
          token: userData.token
        }
      ));
      return { successful: true };
    }
    catch(err) {
      return { successful: false, messages: err };
    }
  }

  /* 
    loginInfo is an object
      Must include: username, password
  */
  const loginUser = async (loginInfo) => {
    try {
      const userData = await ApiLink.loginUser(loginInfo);
      ApiLink.token = userData.token;
      setCurrentUser(userData.user);
      localStorage.setItem("user", JSON.stringify(
        {
          userId: userData.user.userId,
          username: userData.user.username,
          permissions: userData.user.permissions,
          country: userData.user.country,
          token: userData.token
        }
      ));
      return { successful: true };
    }
    catch(err) {
      return { successful: false, messages: err };
    }
  }

  /* Method to log out user */
  const logoutUser = () => {
    ApiLink.token = null;
    setCurrentUser(null);
    localStorage.removeItem("user");
  }

  /* 
    updateInfo is an object:
      Must include: currPassword
      May include: email, firstName, lastName, country, newPassword 
  */
  const updateUserInfo = async (updateInfo) => {
    try {
      const updatedUser = await ApiLink.updateUserInfo(currentUser.id, updateInfo);
      setCurrentUser(() => (updatedUser));
      localStorage.setItem("user", JSON.stringify(
        {
          userId: updatedUser.userId,
          username: updatedUser.username,
          permissions: updatedUser.permissions,
          country: updatedUser.country,
          token: ApiLink.token
        }
      ));
      if (updateInfo.newPassword) {
        return {updated: true, message: "Password successfully updated!"};
      }
      return {updated: true, message: "User profile successfully updated!"};
    }
    catch {
      if (updateInfo.newPassword) {
        return {updated: true, message: "Server error. Password no updated. Please try again later!"};
      }
      return {updated: false, message: "Server error. User profile not updated. Please try again later!"};
    }
  }

  return { currentUser, signupUser, loginUser, logoutUser, updateUserInfo };
}

export default useCurrentUser;