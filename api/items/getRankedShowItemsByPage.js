import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getRankedShowItemsByPage(page, user) {
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
          type: { _eq: "show" },
          created: { _gte: startDate },
          dead: { _eq: false }
        },
        offset: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
        meta: 'total_count'
      });

      const totalItems = items.length

      items = items.data
      items.forEach((item, i) => {
        item.rank = (page - 1) * itemsPerPage + i + 1
      })

      return {
        success: true,
        items: items,
        isMore: totalItems > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false,
        getDataError: false
      }
    } else {
      // Get hidden * for this user
      const hiddens = await directus.items('user_hiddens').readMany({
        filter: {
          username: { _eq: user.username },
          item_creation_date: { _gte: startDate }
        }
      });

      let filterItems = {
        type: { _eq: "show" },
        created: { _gte: startDate }
      }

      let hids = hiddens.map((hidden) => hidden.id)
      if (hids.length > 0) filterItems.id = { _nin: hids }

      if (!user.showDead) filterItems.dead = { _eq: false }

      // Get items
      let items = await directus.items('items').readMany({
        filter: filterItems,
        offset: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
        meta: 'total_count'
      })

      const totalItems = items.meta.total_count

      items = items.data

      let iids = items.map((item) => item.id)

      // Votes
      const votes = await directus.items('user_votes').readMany({
        filter: {
          username: user.username,
          date: { _gte: startDate },
          id: { _in: itemIds },
          type: "item"
        }
      })

      items.forEach((item, i) => {
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
      })

      return {
        success: true,
        items: items,
        isMore: totalItems > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }
  } catch(error) {
    return {getDataError: true}
  }
}
