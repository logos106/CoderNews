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

    let votes = await directus.items('user_votes').readMany({
      filter: {
        username: { _eq: author },
        type: { _eq: 'comment' },
        upvote: { _eq: true }
      },
      offset: (page - 1) * commentsPerPage,
      limit: commentsPerPage,
      meta: 'total_count'
    });

    // Remember the total number of favorites selected
    const totalVotes = votes.meta.total_count

    // Filter for items
    let filterItems = {}
    let comments = []

    votes = votes.data
    let vids = votes.map((vote) => vote.item_id)
    if (vids.length > 0) {
      filterItems.id = { _in: vids }

      if (!user.showDead) filterItems.dead = { _eq: false }
      // Aggregate items
      comments = await directus.items('comments').readMany({
        filter: filterItems
      });

      comments = comments.data
      for (let i=0; i < votes.length; i++) {
        const idx = comments.findIndex(function(comment) {
          return comment.id === votes[i].item_id
        })
        let commentObj = comments[idx]
        if (commentObj) {
          commentObj.votedOnByUser = true
          commentObj.unvoteExpired = votes[i].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
        }
      }
    }
      
    return {
      success: true,
      comments: comments,
      isMore: totalVotes > (((page -1) * commentsPerPage) + commentsPerPage) ? true : false
    }
  } catch(error) {
    return {getDataError: true}
  }

}
