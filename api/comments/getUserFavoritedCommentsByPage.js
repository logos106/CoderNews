import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default async function getUserFavoritedCommentsByPage(userId, page, req) {
  try {
    const cookie = req.headers.cookie ? req.headers.cookie : ""

    const response = await axios({
      url: `${apiCredential.baseURL}/comments/get-user-favorited-comments-by-page?userId=${userId}&page=${page}`,
      headers: req ? {cookie: cookie} : "",
      withCredentials: true
    })

    return response.data
  } catch(error) {
    return {getDataError: true}
  }
}
