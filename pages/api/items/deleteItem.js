import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import config from "../../../utils/config.js"
import moment from "moment"

export default async function handler(req, res) {
  const itemId = JSON.parse(req.body).itemId

  const directus = credential.directus

  const authResult = await authUser(req, res)

  if (!authResult.userSignedIn) return res.status(200).json({notAllowedError: true})
  else if (!itemId) return res.status(200).json({submitError: true})

  try {
    let item = await directus.items('items').readOne(itemId)

    if (!item) return res.status(200).json({notFoundError: true})
    else if (
        item.dead
        || item.by != authResult.username
        || item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix()
        || item.comment_count > 0 ) {
            return res.status(200).json({notAllowedError: true})
        }
    else {
        await directus.items('items').deleteOne(itemId)
        return res.status(200).json({ success: true })
    }
  } catch (error) {
      //console.log(error)
    res.status(200).json({ submitError: true })
  }

}
