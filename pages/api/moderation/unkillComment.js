import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import moment from "moment"

export default async function handler(req, res) {
  const comment_id = req.query.id

  const user = await authUser(req, res)

  try {
    const directus = credential.directus

    // Update the comment
    let comments = await directus.items('comments').readOne(comment_id)
    if (!comment)
      return res.json({ submitError: true })

    await directus.items('comments').updateMany([comment_id], {
        dead: false
    })

    // searchApi.addNewItem(item, function() {

    // Create a moderation log
    await directus.items('moderation_logs').createOne({
      moderator_username: user.username,
      action_type: "unkill-comment",
      comment_id: comment_id,
      comment_by: comment.by,
      item_title: comment.parentItemTitle,
      item_id: comments.parentItemId,
      created: moment().unix()
    })

    return res.status(200).json({ success: true })

  } catch(error) {
    //console.log(error)
    return res.status(200).json({ submitError: true })
  }
}
