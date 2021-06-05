import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"
import config from "../../../utils/config"
import moment from "moment"
const xss = require("xss")
const linkifyUrls = require("linkify-urls")

export default async function handler(req, res) {
  let commentId = JSON.parse(req.body).id;
  let newCommentText = JSON.parse(req.body).newCommentText;

  const authResult = await authUser(req, res)

  const directus = credential.directus

  if (!authResult.userSignedIn)               return res.status(200).json({authError: true})
  if (!commentId)                             return res.status(200).json({submitError: true})
  if (!newCommentText)                        return res.status(200).json({textRequiredError: true})
  if (newCommentText.length > 5000)           return res.status(200).json({textTooLongError: true})


  try {
    // Find a comment by id
    let comment = await directus.items('comments').readOne(commentId)
    
    if (!comment.children) comment.children = [];
    else {
        var children = comment.children.split(";");
        comment.children = children
    }

    if (!comment) return res.status(200).json({ notFoundError: true})
    else if (comment.dead) {
      return res.status(200).json({ notAllowedError: true })
    } else if (comment.by !== authResult.username) {
      return res.status(200).json({ notAllowedError: true })
    } else if (comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix()) {
      return res.status(200).json({ notAllowedError: true })
    } else if (comment.children.length > 0) {
      return res.status(200).json({ notAllowedError: true })
    }
    
    newCommentText = newCommentText.trim()
    newCommentText = newCommentText.replace(/<[^>]+>/g, "")
    newCommentText = newCommentText.replace(/\*([^*]+)\*/g, "<i>$1</i>")
    newCommentText = linkifyUrls(newCommentText)
    newCommentText = xss(newCommentText)

    // comment.text = newCommentText

    await directus.items("comments").updateOne(commentId, {
        text: newCommentText
    })
    return res.status(200).json({ success: true })
  } catch (error) {
    //console.log(error)
    res.status(200).json({ submitError: true })
  }

}
