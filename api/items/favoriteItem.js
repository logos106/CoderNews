import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default function favoriteItem(itemId, callback) {
  axios.post(apiBaseUrl + "/items/favorite-item", {
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
