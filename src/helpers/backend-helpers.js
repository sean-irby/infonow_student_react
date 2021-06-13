import { post, del, get, put, postForm } from "./api_helper"
import * as  url from "./url_helper"

// Gets the logged in user data from local session
export const getLoggedInUser = () => {
  const user = getAuthentication()
  return user ? user.user : null;
}

export const getAuthentication = () => {
  const user = localStorage.getItem("authUser")
  return user ? JSON.parse(user) : null;
}

//is user is logged in
export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null
}


// Chats
export const getChatContactsRequest   =  id => get(url.GET_CHATS_CONTACTS(id))

// Student Actions
export const postStudentLogin         = data => post(url.POST_STUDENT_LOGIN, data);

export const getStudentAllMeetings = userId => get(url.GET_ALL_MEETINGS(userId));