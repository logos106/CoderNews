import axios from "axios"

import credential from "../../utils/apiCredential.js"

export default async function getRankedItemsByPage(page, req) {
  try {
    const cookie = req.headers.cookie ? req.headers.cookie : ""

    const response = await axios({
      url: `${credential.baseURL}/items/get-ranked-items-by-page?page=${page}`,
      headers: req ? {cookie: cookie} : "",
      withCredentials: true
    })

    return response.data
  } catch(error) {
    return {getDataError: true}
  }
}
