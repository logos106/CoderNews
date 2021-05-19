import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default function addUserBan(username, callback) {
  axios.put(apiBaseUrl + "/moderation/add-user-ban", {
    username: username
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
