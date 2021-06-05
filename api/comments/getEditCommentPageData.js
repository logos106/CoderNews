import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getEditCommentPageData(commentId, user) {
  try {
    const directus = credential.directus
    if (!user.userSignedIn)
      return {notAllowedError: true}
    else if (!commentId)
      return {notFoundError: true}

    let comment = await directus.items('comments').readOne(commentId)

    if (!comment)
      return {notFoundError: true}
    else if (
      comment.dead
      || comment.by != user.username
      || comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix()
      || (comment.children && comment.children.length > 0)
    )
      return {notAllowedError: true}

    comment.textForEditing = comment.text
    .replace(/<a\b[^>]*>/g, "").replace(/<\/a>/g, "")
    .replace(/<i\b[^>]*>/g,"*").replace(/<\/i>/g, "*")

    return {success: true, comment: comment}
  } catch(error) {
    //console.log(error)
    return {getDataError: true}
  }
}
