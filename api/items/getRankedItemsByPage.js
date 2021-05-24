import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getRankedItemsByPage(page, user) {
  // Get config
  const directus = credential.directus

  const maxAgeOfRankedItemsInDays = config.maxAgeOfRankedItemsInDays
  const itemsPerPage = config.itemsPerPage
  const commentsPerPage = config.commentsPerPage
  const startDate = moment().unix() - (86400 * maxAgeOfRankedItemsInDays)

  // Fetch items with conditions
  try {
    if (!user.signedIn) {  // If he is a guest
      let items = await directus.items('items').readMany({
        filter: {
          created: {
            _gte: startDate
          },
          dead: {
            _eq: false
          }
        }
      });

      const totalItems = items.length

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
        isMore: totalItems > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false,
        getDataError: false
      }
    }
    else {
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
      let items = await directus.items('items').readMany({
        filter: itemsDbQuery,
      })

      const start = (page - 1) * itemsPerPage
      const end = page * itemsPerPage
      items = items.data.slice(start, end)

      let itemIds = []
      for (let item of items) {
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

  } catch(error) {
    return {getDataError: true}
  }


}
