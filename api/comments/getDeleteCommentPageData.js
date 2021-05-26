import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getDeleteCommentPageData(commentId, user) {
  try {
    if (!user.userSignedIn)   return {notAllowedError: true}
    if (!commentId)           return {notFoundError: true}
    const directus = credential.directus

    let comment = await directus.items("comments").readOne(commentId)

    if (!comment.children) comment.children = []
    else {
      let children = comment.children.split(";")
      comment.children = children
    }

    if (!comment) 
      return {notFoundError: true}
    if (comment.dead 
      || comment.by != user.username 
      || comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix()
      || comment.children.length > 0)
      return {notAllowedError: true}
    
      
    return {success: true, comment: comment}
  } catch(error) {
    return {getDataError: true}
  }
}
