import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default async function getUserUpvotedItemsByPage(userId, page, req) {
  try {
    const cookie = req.headers.cookie ? req.headers.cookie : ""

    const response = await axios({
      url: `${apiCredential.baseURL}/items/get-user-upvoted-items-by-page?userId=${userId}&page=${page}`,
      headers: req ? {cookie: cookie} : "",
      withCredentials: true
    })

    return response.data
  } catch(error) {
    return {getDataError: true}
  }
}
