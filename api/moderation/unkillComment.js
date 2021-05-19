import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default function unkillComment(commentId, callback) {
  axios.put(apiBaseUrl + "/moderation/unkill-comment", {
    id: commentId
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
