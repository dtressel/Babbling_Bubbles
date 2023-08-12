/* 
  This hook we use to create a current user and current user manipulation methods (ex. login)

  Throughout the application there should only be one instance of useCurrentUser because
  we only want to have one logged in user at a time.

  This hook is imported into AppLayout.js and the current user instance is created there.

  This hook should not be imported for use anywhere else.
*/

import { useState, useCallback } from 'react';
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

  /* 
    Unlike most later mehtods, this does not result in an API call or change anything in the database.

    Since some user information is not stored in local storage, when an API call is made to
    fetch additional user information, this method can be used to set that 
    information to currentUser to limit API calls in the future.

    Don't use this to set stats to currentUser since stats are constantly changing.
  */
  const setAdditionalInfo = useCallback((additionalInfoObj) => {
    setCurrentUser((currentUser) => ({...currentUser, ...additionalInfoObj}));
  }, []);

  /* 
    This makes an API call to singup (register) a user, adding a user to the database
    and logging on that user here on the front end.

    signupInfo is an object
      Must include: username,  email, password, confirmPassword
      May include: country
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
          userId: +userData.user.userId,
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
    This makes an API call to authenticate or login a user.
    If username/password combo is correct than use data and a token is returned.
    After successful authentication API call, user will be logged in here.

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
          userId: +userData.user.userId,
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

  /* Method to log out user on the front end. No API call. */
  const logoutUser = () => {
    ApiLink.token = null;
    setCurrentUser(null);
    localStorage.removeItem("user");
  }

  /* 
    This makes an API patch request to update the current user's info.
    This will result in an updated user in the database, and this will update
    the info stored in local storage and in currentUser.

    updateInfo is an object:
      Must include: currPassword
      May include: email, bio, country, newPassword 
  */
  const updateUserInfo = async (updateInfo) => {
    try {
      if (updateInfo.newPassword !== updateInfo.confirmPassword) {
        throw new Error('Passwords do not match!');
      }
      delete updateInfo.confirmPassword;
      const updatedUser = await ApiLink.updateUserInfo(currentUser.userId, updateInfo);
      setCurrentUser(() => (updatedUser));
      localStorage.setItem("user", JSON.stringify(
        {
          userId: +updatedUser.userId,
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
    catch(err) {
      console.log(err);
      if (updateInfo.newPassword) {
        return {updated: false, messages: err};
      }
      return {updated: false, messages: err};
    }
  }

  return { currentUser, setAdditionalInfo, signupUser, loginUser, logoutUser, updateUserInfo };
}

export default useCurrentUser;