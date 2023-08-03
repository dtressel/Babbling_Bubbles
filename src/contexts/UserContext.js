/* 
  This is the user context to share the current user data and current user methods
  with the entire application except the footer.

  UserContext value is set in /layouts/AppLayout

  It creates an instance of the useCurrentUser hook, which creates the
  values and methods found in useCurrentUser

  Available in User Context are the following values and methods:
  { currentUser, signupUser, loginUser, logoutUser, updateUserInfo }
  where currentUser = {
    userId,
    username,
    firstName,
    lastName,
    email,
    permissions
  }
*/

import { createContext } from "react";

const UserContext = createContext();

export default UserContext;