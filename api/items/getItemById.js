import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getItemById(itemId, page, user) {
  const directus = credential.directus
  const commentsPerPage = config.commentsPerPage

  try {
    // Find the item by ID
    let item = await directus.items('items').readOne(itemId)

    // Fetch the comments to the item
    let filterComments = {
      parent_id: { _eq: itemId },
      is_parent: { _eq: true }
    }
    if (!user.showDead) filterComments.dead = { _eq: false }

    let comments = await directus.items('comments').readMany({
      filter: filterComments,
      offset: (page - 1) * commentsPerPage,
      limit: page * commentsPerPage,
      meta: 'total_count'
    });

    const totalComments = comments.meta.total_count

    comments = comments.data

    if (!user.userSignedIn) {
      return {
        success: true,
        item: item,
        comments: comments,
        isMoreComments: totalComments > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
    else {
      let votes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq : user.username },
          item_id: { _eq: itemId },
          type: { _eq: 'item' }
        }
      });
      votes = votes.data

      let favs = await directus.items('user_favorites').readMany({
        filter: {
          username: { _eq : user.username },
          item_id: { _eq: itemId },
          type: { _eq: 'item' }
        }
      });
      favs = favs.data

      let hiddens = await directus.items('user_hiddens').readMany({
        filter: {
          username: { _eq : user.username },
          item_id: { _eq: itemId }
        }
      });
      hiddens = hiddens.data

      let commentVotes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq : user.username },
          parent_item_id: { _eq: itemId },
          type: { _eq: 'comment' }
        }
      });
      commentVotes = commentVotes.data

      // Set various properties of the item(article)
      item.votedOnByUser = votes.length > 0 ? true : false
      item.unvoteExpired = votes.length > 0 && (votes[0].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix())
      item.favoritedByUser = favs.length > 0 ? true : false
      item.hiddenByUser = hiddens.length > 0 ? true : false

      if (item.by === user.username) {
        const hasEditAndDeleteExpired =
          item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
          item.commentCount > 0

        item.editAndDeleteExpired = hasEditAndDeleteExpired
      }

      let cvids = commentVotes.map((cv) => cv.item_id)

      const updateComment = async function(comment) {
        // Split children
        if (!comment.children)
          comment.children = []
        else
          comment.children = comment.children.split(';')

        if (comment.by === user.username) {
          const hasEditAndDeleteExpired =
            comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            comment.children.length > 0

          comment.editAndDeleteExpired = hasEditAndDeleteExpired
        }

        if (cvids.includes(comment.id)) {
          comment.votedOnByUser = true

          for (let i = 0; i < commentVotes.length; i++) {
            if (comment.id === commentVotes[i].item_id) {
              comment.unvoteExpired = commentVotes[i].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
            }
          }
        }

        comment.children.forEach(async (child_id) => {
          const child = await directus.items('comments').readOne(child_id)
          await updateComment(child)
        })
      }

      for (let i = 0; i < comments.length; i++) {
        await updateComment(comments[i])
      }

      return {
        success: true,
        item: item,
        comments: comments,
        isMoreComments: totalComments > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
  } catch(error) {
    console.log(error)
    return { getDataError: true }
  }
}
