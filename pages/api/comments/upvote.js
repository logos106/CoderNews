import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"
import moment from "moment"
import config from "../../../utils/config"

export default async function handler(req, res) {
  const commentId = JSON.parse(req.body).commentId
  const parentItemId = JSON.parse(req.body).parentItemId

  if (!commentId || !parentItemId)
    return res.json({ submitError: true })

  const user = await authUser(req, res)

  if (!user.userSignedIn)
    return res.json({ authError: true })

  try {
    const directus = credential.directus
    let comment = await directus.items("comments").readOne(commentId)

    let voteDoc = await directus.items("user_votes").readMany({
      filter: {
        username: { _eq: user.username },
        item_id: { _eq: commentId },
        type: { _eq: "comment" }
      }
    })

    voteDoc = voteDoc.data
    if (!comment || comment.by === user.username || comment.dead) return res.json({submitError: true})
    else if (voteDoc.length > 0) return res.json({submitError: true})

    let result = await directus.items("user_votes").createOne({
        username: user.username,
        type: "comment",
        item_id: commentId,
        parent_item_id: parentItemId,
        upvote: true,
        downvote: false,
        date: moment().unix()
    })

    let points = comment.points + 1

    await directus.items("comments").updateOne(comment.id, {
        points: points
    })

    let author = await directus.items("directus_users").readMany({
        filter: {
            username: { _eq: comment.by }
        }
    })
    if (author.data.length == 0) return res.json({ submitError: true })
    author = author.data[0]

    await directus.items("direcuts_users").updateOne(author.id, {
        karma: author.karma + 1
    })
    // await searchApi.updateCommentPointsValue(comment.id, comment.points)
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(200).json({ submitError: true })
  }

}
