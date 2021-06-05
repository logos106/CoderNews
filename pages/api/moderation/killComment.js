import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import moment from "moment"

export default async function handler(req, res) {
  const comment_id = req.query.id

  const user = await authUser(req, res)

  try {
    const directus = credential.directus

    // Update the comment
    let comment = await directus.items('comments').readOne(comment_id)
    if (!comment)
      return res.json({ submitError: true })

    await directus.items('comments').updateMany([comment_id], {
      dead: true
    })

    // searchApi.deleteKilledComment(comment.id

    // Create a moderation log
    await directus.items('moderation_logs').createOne({
      moderator_username: user.username,
      action_type: "kill-comment",
      comment_id: comment_id,
      comment_by: comment.by,
      item_title: comment.parentItemTitle,
      item_id: comment.parentItemId,
      created: moment().unix()
    })

    return res.status(200).json({ success: true })

  } catch(error) {
    //console.log(error)
    return res.status(200).json({ submitError: true })
  }
}
