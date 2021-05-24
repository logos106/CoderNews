import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import helper from "../../utils/helper.js"
import moment from "moment"

export default async function getRankedItemsByDay(day, page, user) {
  const directus = credential.directus
  const isValidDate = helper.isValidDate(day)
  const itemsPerPage = config.itemsPerPage
  const commentsPerPage = config.commentsPerPage

  if (!isValidDate)
    return { invalidDateError: true }

  const startTimestamp = moment(day).startOf("day").unix()
  const endTimestamp = moment(day).endOf("day").unix()

  try {
    if (!user.signedIn) {  // If he is a guest
      let items = await directus.items('items').readMany({
        filter: {
          created: { _gte: startTimestamp, _lte: endTimestamp },
          dead: { _eq: false }
        },
      });

      const start = (page - 1) * itemsPerPage
      const end = page * itemsPerPage
      items = items.data.slice(start, end)

      // Set items' rank
      for (let [i, item] of items.entries()) {
        item.rank = (page - 1) * itemsPerPage + i + 1
      }

      return {
        success: true,
        items: items,
        isMore: items.length > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }
    else {
      // Get hidden * for this user
      const hiddens = await directus.items('user_hiddens').readMany({
        filter: {
          username: { _eq: user.username  },
          item_creation_date: {  _gte: startTimestamp, _lte: endTimestamp }
        }
      });

      let itemsDbQuery = {
        created: { _gte: startTimestamp, $lte: endTimestamp }
      }

      let hiddenIds = []
      for (let hidden of hiddens.data) {
        hiddenIds.push(hidden.id)
      }
      if (hiddenIds.length > 0) itemsDbQuery.id = { _nin: hiddenIds }

      if (!user.showDead) itemsDbQuery.dead = { _eq: false }

      // Get items
      let items = await directus.items('items').readMany({
        filter: itemsDbQuery
      })

      const start = (page - 1) * itemsPerPage
      const end = page * itemsPerPage
      items = items.data.slice(start, end)

      let itemIds = []
      for (let item of items.data) {
        itemIds.push(item.id)
      }

      // Votes
      const votes = await directus.items('user_votes').readMany({
        filter: {
          username: user.username,
          id: { _in: itemIds },
          type: "item"
        }
      })

      for (let [i, item] of items.entries()) {
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
        items: items,
        isMore: items.length > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }

  } catch (error) {
    console.log(error)
    return {getDataError: true}
  }


}
