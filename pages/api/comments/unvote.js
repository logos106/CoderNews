import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"
import moment from "moment"
import config from "../../../utils/config"

export default async function handler(req, res) {
  const commentId = JSON.parse(req.body).commentId
  if (!commentId)
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
    else if (voteDoc.length == 0 || voteDoc[0].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix()) return res.json({submitError: true})
    
    voteDoc = voteDoc[0]
    
    await directus.items("user_votes").deleteOne(voteDoc.id)

    let points = voteDoc.upvote ? comment.points - 1 : comment.points + 1

    await directus.items("comments").updateOne(comment.id, {
        points: points
    })

    let u = await directus.items("directus_users").readMany({
        filter: {
            username: { _eq: comment.by }
        }
    })
    if (u.data.length == 0) return res.json({ submitError: true })
    u = u.data[0]
    
    await directus.items("direcuts_users").updateOne(u.id, {
        karma: u.karma + (voteDoc.upvote ? -1 : 1)
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(200).json({ submitError: true })
  }

}
