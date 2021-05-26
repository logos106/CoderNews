import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getCommentById(commentId, page, user) {
  // Get config
  const directus = credential.directus
  const commentsPerPage = config.commentsPerPage

  // Fetch items with conditions
  try {
    let comment = await directus.items('comments').readOne(commentId)

    if (!comment) return {notFoundError: true}

    comment.pageMetadataTitle = comment.text.replace(/<[^>]+>/g, "")
    if (!comment.children) comment.children = "";
    // Get list of child comments from string
    const cids = comment.children.split(';')
    let comments = await directus.items('comments').readMany()
    comments = comments.data

    let children = []
    for (let child of comments) {
      if (cids.includes(child.id))
        children.push(child)
    }
    comment.children = children

    // Sort the children comments
    comment.children.sort(function(a, b) {
      if (a.points > b.points) return -1
      if (a.points < b.points) return 1

      if (a.created > b.created) return -1
      if (a.created < b.created) return 1
    })

    comment.children = comment.children.slice((page - 1) * commentsPerPage, page * commentsPerPage)

    if (!user.signedIn) {  // If he is a guest
      return {
        success: true,
        comment: comment,
        isMoreChildrenComments: comment.children.length > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
    else {
      let votes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq: user.username },
          id: { _eq: commentId },
          type: { _eq: 'comment' },
        }
      })
      votes = votes.data

      let favs = await directus.items('user_favorites').readMany({
        filter: {
          username: { _eq: user.username },
          id: { _eq: commentId },
          type: { _eq: 'comment' },
        }
      })
      favs = favs.data

      let votes2 = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq: user.username },
          type: { _eq: 'comment' },
          parent_item_id: { _eq: comment.parent_id }
        }
      })
      votes2 = votes2.data

      comment.votedOnByUser = votes.data.length > 0 ? true : false
      comment.unvoteExpired =  votes.data.length > 0 && votes.data[0].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix()
      comment.favoritedByUser = favs.data.length > 0 ? true : false

      if (comment.by === user.username) {
        const hasEditAndDeleteExpired =
          comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
          comment.children.length > 0

        comment.editAndDeleteExpired = hasEditAndDeleteExpired
      }

      let userCommentVotes = []
      for (let i = 0; i < votes2.length; i++) {
        userCommentVotes.push(votes2[i].id)
      }

      const updateComment = function(parentComment) {
        if (parentComment.by === user.username) {
          const hasEditAndDeleteExpired =
            parentComment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            parentComment.children.length > 0

          parentComment.editAndDeleteExpired = hasEditAndDeleteExpired
        }

        if (userCommentVotes.includes(parentComment.id)) {
          parentComment.votedOnByUser = true

          for (let i = 0; i < votes2.length; i++) {
            if (parentComment.id === votes2[i].id) {
              parentComment.unvoteExpired = votes2[i].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
            }
          }
        }

        if (parentComment.children) {
          for (let i=0; i < parentComment.children.length; i++) {
            updateComment(parentComment.children[i])
          }
        }
      }

      for (let i = 0; i < comment.children.length; i++) {
        updateComment(comment.children[i])
      }

      return {
        success: true,
        comment: comment,
        isMoreChildrenComments: comment.children.length > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
  } catch(error) {
    console.log(error)
    return { getDataError: true }
  }

}
