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
    if (cids[0] == '') cids.shift()

    if (cids.length > 0) {
      let children = await directus.items('comments').readMany({
        filter: { id: { _in: cids } }
      })
      children = children.data
      comment.children = children
      // Sort the children comments
      comment.children.sort(function(a, b) {
        if (a.points > b.points) return -1
        if (a.points < b.points) return 1

        if (a.created > b.created) return -1
        if (a.created < b.created) return 1
      })
    }

    comment.children = comment.children.slice((page - 1) * commentsPerPage, page * commentsPerPage)
    if (!user.userSignedIn) {  // If he is a guest
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
          item_id: { _eq: commentId },
          type: { _eq: 'comment' },
        }
      })
      votes = votes.data
      let favs = await directus.items('user_favorites').readMany({
        filter: {
          username: { _eq: user.username },
          item_id: { _eq: commentId },
          type: { _eq: 'comment' },
        }
      })
      favs = favs.data

      let commentVotes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq: user.username },
          type: { _eq: 'comment' },
          parent_item_id: { _eq: comment.parent_id }
        }
      })
      commentVotes = commentVotes.data
      
      comment.votedOnByUser = votes.length > 0 ? true : false
      comment.unvoteExpired =  votes.length > 0 && votes[0].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix()
      comment.favoritedByUser = favs.length > 0 ? true : false

      if (comment.by === user.username) {
        const hasEditAndDeleteExpired =
          comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
          (comment.children && comment.children.length > 0)

        comment.editAndDeleteExpired = hasEditAndDeleteExpired
      }

      const updateComment = async function(comment) {
        if (comment.by === user.username) {
          const hasEditAndDeleteExpired =
            comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            (comment.children && comment.children.length > 0)

          comment.editAndDeleteExpired = hasEditAndDeleteExpired
        }

        for (let i = 0; i < commentVotes.length; i++) {
          if (comment.id === commentVotes[i].item_id) {
            comment.votedOnByUser = true
            comment.unvoteExpired = commentVotes[i].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
          }
        }

        for (let cvote of commentVotes) {
          if (comment.id === cvote.item_id) {
            comment.unvoteExpired = cvote.date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
            comment.votedOnByUser = true
          }
        }

        // Iterate it for child
        let childIds = []
        if (comment.children) {
          childIds = comment.children.split(';')
          childIds.shift()

          let children = await directus.items('comments').readMany({
            filter: {
              id: {_in: childIds}
            }
          })
          children = children.data

          for (let i = 0; i < children.length; i++) {
            await updateComment(children[i])
          }

          comment.children = children
        }
      }

      for (let i = 0; i < comment.children.length; i++) {
        await updateComment(comment.children[i])
      }

      return {
        success: true,
        comment: comment,
        isMoreChildrenComments: comment.children.length > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
  } catch(error) {
    //console.log(error)
    return { getDataError: true }
  }

}
