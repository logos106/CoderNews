import { Directus, Auth } from '@directus/sdk';
import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"

export default async function getItemById(itemId, page, authUser) {
  const commentsPerPage = config.commentsPerPage

  // Instantiate a new Directus object
  const directus = new Directus(credential.baseURL)

  try {
    // Login to Directus
    await directus.auth.login({
      email: credential.email,
      password: credential.password,
    });

    const showDeadComments = authUser.showDead ? true : false

    let commentsDbQuery = {
      parentItemId: itemId,
      isParent: true
    }

    if (!showDeadComments) commentsDbQuery.dead = false

    // Find the item by ID
    const item = await directus.items('items').readOne(id)

    // Fetch the comments to the item
    const comments = await directus.items('comments').readMany({
      filter: {
        getChildrenComments: {
          _eq : true
        },
        showDeadComments: {
          _eq: showDeadComments,
        }
      },
      skip: (page - 1) * commentsPerPage,
      take: commentsPerPage
    });

    if (!authUser.userSignedIn) {
      callback({
        success: true,
        item: item,
        comments: comments,
        isMoreComments: comments.length > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      })
    }
    else {
      const vote = await directus.items('user_votes').readOne({
        filter: {
          username: { _eq : authUser.username },
          id: { _eq: itemId },
          type: { _eq: 'item' }
        }
      });

      const fav = await directus.items('user_favorites').readOne({
        filter: {
          username: { _eq : authUser.username },
          id: { _eq: itemId },
          type: { _eq: 'item' }
        }
      });

      const hidden = await directus.items('user_hiddens').readOne({
        filter: {
          username: { _eq : authUser.username },
          id: { _eq: itemId }
        }
      });

      const commentVotes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq : authUser.username },
          parentItemId: { _eq: itemId },
          type: { _eq: 'comment' }
        }
      });

      item.votedOnByUser = vote ? true : false
      item.unvoteExpired = vote && vote.date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix()
      item.favoritedByUser = fav ? true : false
      item.hiddenByUser = hidden ? true : false

      if (item.by === authUser.username) {
        const hasEditAndDeleteExpired =
          item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
          item.commentCount > 0

        item.editAndDeleteExpired = hasEditAndDeleteExpired
      }

      let userCommentVotes = []

      for (let i = 0; i < commentVotes.length; i++) {
        userCommentVotes.push(commentVotes[i].id)
      }

      const updateComment = function(comment) {
        if (comment.by === authUser.username) {
          const hasEditAndDeleteExpired =
            comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            comment.children.length > 0

          comment.editAndDeleteExpired = hasEditAndDeleteExpired
        }

        if (userCommentVotes.includes(comment.id)) {
          comment.votedOnByUser = true

          for (let i=0; i < commentVoteDocs.length; i++) {
            if (comment.id === commentVoteDocs[i].id) {
              comment.unvoteExpired = commentVoteDocs[i].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
            }
          }
        }

        if (comment.children) {
          for (let i=0; i < comment.children.length; i++) {
            updateComment(comment.children[i])
          }
        }
      }

      for (let i=0; i < comments.length; i++) {
        updateComment(comments[i])
      }

      return {
        success: true,
        item: item,
        comments: comments,
        isMoreComments: comments.length > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
  } catch(error) {
    console.log(error)
    return { getDataError: true }
  }
}
