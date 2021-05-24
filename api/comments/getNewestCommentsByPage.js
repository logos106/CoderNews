import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import helper from "../../utils/helper.js"
import moment from "moment"

export default async function getNewestCommentsByPage(page, user) {
  const directus = credential.directus
  const commentsPerPage = config.commentsPerPage

  let filterComments = {}
  if (!user.showDead) filterComments.dead = { _eq: false }

  try {
    let comments = await directus.items('comments').readMany({
      filter: filterComments
    });

    // Remember the total number of selected comments
    const totalComments = comments.data.length

    // Get the pags as many as number for one page
    const start = (page - 1) * commentsPerPage
    const end = page * commentsPerPage
    comments = comments.data.slice(start, end)

    if (!user.signedIn) {  // If he is a guest
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
            comments[i].children.length > 0

          comments[i].editAndDeleteExpired = hasEditAndDeleteExpired
        }
      }

      // Get votes
      let filterVotes = {
        username: { _eq: user.username },
        type: { _eq: 'type' }
      }

      if (arrayOfCommentIds.length > 0)
        filterVotes.id = { _in: arrayOfCommentIds };

      let votes = directus.items('user_votes').readMany({
        filter: filterVotes
      })
      votes = votes.data

      for (let i = 0; i < votes.length; i++) {
        const commentObj = comments.find(function(comment) {
          return comment.id === votes[i].id
        })

        if (commentObj) {
          commentObj.votedOnByUser = true
          commentObj.unvoteExpired = votes[i].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
        }
      }

      return {
        success: true,
        comments: comments,
        isMore: totalComments > (((page -1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }

  } catch (error) {
    console.log(error)
    return {getDataError: true}
  }


}
