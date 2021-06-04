import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getDeleteItemPageData(itemId, user) {
  const directus = credential.directus

  try {
    let item = await directus.items('items').readOne(itemId)

    if (!item) return { notFoundError: true }

    if (item.dead
          || item.by != user.username
          || item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix()
          || item.comment_count > 0 ) {
      return { notAllowedError: true }
    }

    return { success: true, item: item }
  } catch(error) {
    return { getDataError: true }
  }
}
