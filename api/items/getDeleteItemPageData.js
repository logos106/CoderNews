import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

export default async function getDeleteItemPageData(itemId, req) {
  try {
    const cookie = req.headers.cookie ? req.headers.cookie : ""

    const response = await axios({
      url: `${apiCredential.baseURL}/items/get-delete-item-page-data?id=${itemId}`,
      headers: req ? {cookie: cookie} : "",
      withCredentials: true
    })

    return response.data
  } catch(error) {
    return {getDataError: true}
  }
}
