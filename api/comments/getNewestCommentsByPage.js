import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getNewestCommentsByPage(page, user) {
  const directus = credential.directus
  const commentsPerPage = config.commentsPerPage

  let filterComments = {}
  if (!user.showDead) filterComments.dead = { _eq: false }

  try {
    let comments = await directus.items('comments').readMany({
      filter: filterComments,
      offset: (page - 1) * commentsPerPage,
      sort: ['-created'],
      limit: commentsPerPage,
      sort: ['-created'],
      meta: 'total_count'
    });
    // Remember the total number of selected comments
    const totalComments = comments.meta.total_count

    comments = comments.data

    if (!user.userSignedIn) {  // If he is a guest
      return {
        success: true,
        comments: comments,
        isMore: totalComments > (((page -1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
    else {

      let arrayOfCommentIds = []
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].by !== user.username) arrayOfCommentIds.push(comments[i].id)

        if (comments[i].by === user.username) {
          const hasEditAndDeleteExpired =
          comments[i].created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
          (comments[i].children && comments[i].children.length > 0)

          comments[i].editAndDeleteExpired = hasEditAndDeleteExpired
        }
      }

      // Get votes
      let filterVotes = {
        username: { _eq: user.username },
        type: { _eq: 'type' }
      }

      if (arrayOfCommentIds.length > 0) {
        let votes = await directus.items('user_votes').readMany({
          filter: {
            item_id: { _in: arrayOfCommentIds }
          }
        })

        votes = votes.data
        for (let i = 0; i < votes.length; i++) {
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
        isMore: totalComments > (((page -1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }

  } catch (error) {
    //console.log(error)
    return {getDataError: true}
  }


}
