import axios from "axios"

import apiBaseUrl from "../../utils/apiBaseUrl.js"

export default async function getShadowBannedUsersByPage(page, req) {
  try {
    const cookie = req.headers.cookie ? req.headers.cookie : ""

    const response = await axios({
      url: `${apiBaseUrl}/moderation/get-shadow-banned-users-by-page?page=${page}`,
      headers: req ? {cookie: cookie} : "",
      withCredentials: true
    })

    return response.data
  } catch(error) {
    return {getDataError: true}
  }
}
