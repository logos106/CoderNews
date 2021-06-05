import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"
import config from "../../../utils/config"
import moment from "moment"
const xss = require("xss")
const linkifyUrls = require("linkify-urls")

export default async function handler(req, res) {
  const commentId = JSON.parse(req.body).commentId;
  const parentItemId = JSON.parse(req.body).parentItemId;

  const authResult = await authUser(req, res)

  const directus = credential.directus

  if (!authResult.userSignedIn)               return res.status(200).json({authError: true})
  if (!commentId || !parentItemId)            return res.status(200).json({submitError: true})
//   if (!authResult.showDownvote)               return res.status(200).json({textRequiredError: true})


  try {
    // Find a comment by id
    let comment = await directus.items('comments').readOne(commentId)
    let voteDoc = await directus.items("user_votes").readMany({
        filter: {
            username: { _eq: authResult.username },
            id      : { _eq: commentId },
            type    : { _eq: "comment" }
        }
    })
    voteDoc = voteDoc.data

    if (!comment || comment.by === authResult.username || comment.dead) return res.status(200).json({submitError: true})

    if (voteDoc) return res.status(200).json({submitError: true})

    await directus.items("user_votes").createOne({
        username: authResult.username,
          type: "comment",
          id: commentId,
          parent_id: parentItemId,
          upvote: false,
          downvote: true,
          date: moment().unix()
    })

    let points = comment.points - 1
    await directus.items("comments").updateOne(commentId, {
        points: points
    })

    await directus.items("directus_users").updateOne(authResult.id, {
        karma: authResult.karma-1
    })

    // await searchApi.updateCommentPointsValue(comment.id, comment.points)
    
    return res.status(200).json({ success: true })
  } catch (error) {
    //console.log(error)
    res.status(200).json({ submitError: true })
  }

}
