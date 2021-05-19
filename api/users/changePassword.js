import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default function changePassword(currentPassword, newPassword, callback) {
  axios.put(apiBaseUrl + "/users/change-password", {
    currentPassword: currentPassword,
    newPassword: newPassword
  }, {
    withCredentials: true
  })
  .then(function(response) {
    callback(response.data)
  })
  .catch(function(error) {
    callback({submitError: true})
  })
}
