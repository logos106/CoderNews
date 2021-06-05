import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import moment from "moment"

export default async function handler(req, res) {
  const item_id = req.query.id

  const user = await authUser(req, res)

  try {
    const directus = credential.directus

    // Update the item
    let item = await directus.items('items').readOne(item_id)
    if (!item)
      return res.json({ submitError: true })

    await directus.items('items').updateMany([item_id], {
      dead: true,
      score: 0
    })

    // searchApi.deleteItem(item.id, function() {

    // Create a moderation log
    await directus.items('moderation_logs').createOne({
      moderatorUsername: user.username,
      action_type: "kill-item",
      item_id: item_id,
      item_title: item.title,
      item_by: item.by,
      created: moment().unix()
    })

    return res.status(200).json({ success: true })

  } catch(error) {
    //console.log(error)
    return res.status(200).json({ submitError: true })
  }
}
