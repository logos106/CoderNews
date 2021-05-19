import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default async function getDeleteCommentPageData(commentId, req) {
  try {
    const cookie = req.headers.cookie ? req.headers.cookie : ""

    const response = await axios({
      url: `${apiCredential.baseURL}/comments/get-delete-comment-page-data?id=${commentId}`,
      headers: req ? {cookie: cookie} : "",
      withCredentials: true
    })

    return response.data
  } catch(error) {
    return {getDataError: true}
  }
}
