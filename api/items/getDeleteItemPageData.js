import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getDeleteItemPageData(itemId, user) {
  // Get config
  const directus = credential.directus

  try {
    let item = await directus.items('items').readOne(itemId)
    console.log("item: ", item)
    if (!item) return {notFoundError: true}
    else if (
      item.dead 
      || item.by != user.username
      || item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix()
      || item.comment_count > 0 ) {
        console.log(item.dead)
        console.log(item.by, user.username)
        console.log(item.created + (3600 * config.hrsUntilEditAndDeleteExpires), moment().unix())
        console.log(item.comment_count, 0)
        return {notAllowedError: true}
      }
    else return {success: true, item: item}
  } catch(error) {
    return {getDataError: true}
  }
}
