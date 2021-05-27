import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getUserUpvotedCommentsByPage(author, page, user) {
  const directus = credential.directus
  const commentsPerPage = config.commentsPerPage

  if (!author || !page) return { getDataError: true }

  try {
    // Find the author
    let users = await directus.items('directus_users').readMany({
      filter: {
        username: { _eq: author }
      }
    });
    users = users.data

    // If there is no such a user
    if (users.length < 1)
      return { notFoundError: true }

    let favs = await directus.items('user_favorites').readMany({
      filter: {
        username: { _eq: author },
        type: { _eq: 'comment' }
      },
      offset: (page - 1) * commentsPerPage,
      limit: commentsPerPage,
      meta: 'total_count'
    });

    // Remember the total number of favorites selected
    const totalFavs = favs.meta.total_count

    // Filter for items
    let filterItems = {}

    favs = favs.data
    let fids = favs.map((fav) => fav.id)
    if (fids.length > 0) filterItems.id = { _in: fids }

    if (!user.showDead) filterItems.dead = { _eq: false }

    // Aggregate items
    let comments = await directus.items('comments').readMany({
      filter: filterItems
    });

    comments = comments.data
    comments.forEach((comment, i) => {
      comment.rank = (page - 1) * commentsPerPage + i + 1
    })

    if (!user.signedIn) {
      return {
        success: true,
        items: comments,
        isMore: totalFavoriteItemsCount > (((page -1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
    else {
      // Votes
      let votes = []
    
      votes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq: user.username },
          id: { _in: iids },
          type: { _in: 'comment' }
        }
      })
      votes = votes.data
    
      comments.forEach((comment, i) => {
        if (comment.by === user.username) {
          const hasEditAndDeleteExpired =
            comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            (comment.children && comment.children > 0)

          comment.editAndDeleteExpired = hasEditAndDeleteExpired
        }

        const vote = votes.find(function(e) {
          return e.id === comment.id
        })

        if (vote) {
          comment.votedOnByUser = true
          comment.unvoteExpired = vote.date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
        }
      })

      return {
        success: true,
        items: comments,
        isMore: totalFavs > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }

  } catch(error) {
    return {getDataError: true}
  }

}
