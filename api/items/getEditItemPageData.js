import { Directus, Auth } from '@directus/sdk';
import moment from "moment"
import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"

export default async function getEditItemPageData(itemId, username) {
  try {
    // Instantiate a new Directus object
    const directus = credential.directus

    // Find the item by ID
    const item = await directus.items('items').readOne(itemId);

    // Check the item
    if (!item)
      return { notFoundError: true }
    else if (item.dead)
      return { notAllowedError: true }
    else if (item.by !== username)
      return { notAllowedError: true }
    // else if (item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix())
    //   return { notAllowedError: true }
    else if (item.commentCount > 0)
      return { notAllowedError: true }
    else {
      if (item.text) {
        item.textForEditing = item.text
          .replace(/<a\b[^>]*>/g,"").replace(/<\/a>/g, "")
          .replace(/<i\b[^>]*>/g,"*").replace(/<\/i>/g, "*")
      } else {
        item.textForEditing = ''
      }

      return { success: true, item: item }
    }
  } catch(error) {
    return { getDataError: true }
  }
}
