import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"
import comment from "../../components/comment.js"

export default async function getReplyPageData(commentId, user) {
  try {
    if (!user.userSignedIn) return { authError: true }

    const directus = credential.directus

    let comment = await directus.items("comments").readOne(commentId)
    if (!comment) return { notFoundError: true }

    if (!comment.children) comment.children = []
    else {
      let children = comment.children.split(";")
      comment.children = children
    }

    if (comment.by === user.username) {
      const hasEditAndDeleteExpired =
        comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() || comment.children.length > 0
      comment.editAndDeleteExpired = hasEditAndDeleteExpired
    }

    let votes = await directus.items("user_votes").readMany({
      filter: {
        username:   { _eq: user.username },
        item_id:    { _eq: commentId },
        type:       { _eq: "comment" }
      }
    })

    comment.votedOnByUser = votes.data.length > 0 ? true : false
    comment.unvoteExpired =  votes.data.length > 0 && votes.data[0].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix()

    return {success: true, comment: comment}

  } catch(error) {
    //console.log(error)
    return {getDataError: true}
  }
}
