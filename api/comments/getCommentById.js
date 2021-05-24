import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getCommentById(page, user) {
  // Get config
  const directus = credential.directus
  const commentsPerPage = config.commentsPerPage

  // Fetch items with conditions
  try {
    let comment = await directus.items('comments').readOne(commentId)
    comment = comment.data

    comment.pageMetadataTitle = comment.text.replace(/<[^>]+>/g, "")

    // Get list of child comments from string
    const cids = comment.children.split(';')
    let comments = await directus.items('comments').readMany()
    comments = comment.data

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
      callback({
        success: true,
      })
      return {
        success: true,
        comment: comment,
        isMoreChildrenComments: comment.children.length > (((page - 1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    }
    else {
      UserVoteModel.findOne({username: authUser.username, id: commentId, type: "comment"}).lean(),
      UserFavoriteModel.findOne({username: authUser.username, id: commentId, type: "comment"}).lean(),
      UserVoteModel.find({username: authUser.username, type: "comment", parentItemId: comment.parentItemId}).lean()

      let vote = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq: user.username },
          id: { _eq: commentId },
          type: { _eq: 'comment' },
        },
        take: 1
      })

      const vote = await directus.items('user_favorites').readMany({
        filter: {
          username: { _eq: user.username },
          id: { _eq: commentId },
          type: { _eq: 'comment' },
        },
        take: 1
      })

      const votes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq: user.username },
          id: { _eq: commentId },
          type: { _eq: 'comment' },
        },
        take: 1
      })



      // Get hidden * for this user
      const hiddens = await directus.items('user_hiddens').readMany({
        filter: {
          username: {
            _eq: user.username
          },
          item_creation_date: {
            _gte: startDate,
          }
        }
      });

      let itemsDbQuery = {
        created: { _gte: startDate }
      }

      let hiddenIds = []
      for (let hidden of hiddens.data) {
        hiddenIds.push(hidden.id)
      }
      if (hiddenIds.length > 0) itemsDbQuery.id = { _nin: hiddenIds }

      if (!user.showDead) itemsDbQuery.dead = { _eq: false }

      // Get items
      const items = await directus.items('items').readMany({
        filter: itemsDbQuery,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage
      })

      let itemIds = []
      for (let item of items.data) {
        itemIds.push(item.id)
      }

      // Votes
      const votes = await directus.items('user_votes').readMany({
        filter: {
          username: user.username,
          date: { _gte: startDate },
          id: { _in: itemIds },
          type: "item"
        }
      })

      for (let [i, item] of items.data.entries()) {
        item.rank = ((page - 1) * itemsPerPage) + (i + 1)

        if (item.by === user.username) {
          const hasEditAndDeleteExpired =
            item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            item.commentCount > 0

          item.editAndDeleteExpired = hasEditAndDeleteExpired
        }

        const vote = votes.data.find(function(e) {
          return e.id === item.id
        })

        if (vote) {
          item.votedOnByUser = true
          item.unvoteExpired = vote.date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
        }
      }

      return {
        success: true,
        items: items.data,
        isMore: items.data.length > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }

  } catch(error) {
    return {getDataError: true}
  }


}
