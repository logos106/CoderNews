import axios from "axios"

import apiBaseUrl from "../../utils/apiBaseUrl.js"

export default function loginUser(username, password, callback) {
  callback({
      success: true,
      // username: username,
      // authToken: authTokenString,
      // authTokenExpirationTimestamp: authTokenExpirationTimestamp
  })
  // axios.put(`${apiBaseUrl}/users/login`, {
  // axios.post(`${apiBaseUrl}/auth/login`, {
  //   username: username,
  //   password: password
  // }, {
  //   withCredentials: true
  // })
  // .then(function(response) {
  //   console.log(response.data)
  //   response.data.success = true
  //   callback(response.data)
  // })
  // .catch(function(error) {
  //   callback({submitError: true})
  // })
}
