import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default function removeUserCookieData() {
  axios.put(`${apiCredential.baseURL}/users/remove-user-cookie-data`, {}, {withCredentials: true})
  .then(function(response) {
    return response.data
  })
  .catch(function(error) {
    return
  })
}
