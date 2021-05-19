import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default function hideItem(itemId, callback) {
  axios.post(apiBaseUrl + "/items/hide-item", {
    id: itemId
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
