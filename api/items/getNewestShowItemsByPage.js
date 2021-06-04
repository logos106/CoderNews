import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getNewestShowItemsByPage(page, user) {
  const directus = credential.directus

  const maxAgeOfRankedItemsInDays = config.maxAgeOfRankedItemsInDays
  const itemsPerPage = config.itemsPerPage
  const commentsPerPage = config.commentsPerPage
  const startDate = moment().unix() - (86400 * maxAgeOfRankedItemsInDays)

  try {
    if (!user.userSignedIn) {
      // Get the newest items
      let items = await directus.items('items').readMany({
        filter: {
          type: { _eq: 'show' },
          dead: { _eq: false }
        },
        sort: ['-created'],
        offset: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
        meta: 'total_count'
      });

      // Rememeber total count of the items
      const totalItems = items.meta.total_count

      // Numbering the items in this page
      items = items.data
      for (let i = 0; i < items.length; i++) {
        items[i].rank = (page - 1) * itemsPerPage + i + 1
      }
      return {
        success: true,
        items: items,
        isMore: totalItems > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }
    else {
      // Get hidden * for this user
      let hiddens = await directus.items('user_hiddens').readMany({
        filter: {
          username: { _eq: user.username }
        }
      });
      hiddens = hiddens.data

      // Prepare filter for items
      let filterItems = { type: {_eq: 'show'}}

      let hids = hiddens.map((hidden) => hidden.item_id)
      if (hids.length > 0) filterItems.id = { _nin: hids }
      if (!user.showDead) filterItems.dead = { _eq: false }

      // Get items with this filter
      let items = await directus.items('items').readMany({
        filter: filterItems,
        offset: (page - 1) * itemsPerPage,
        sort: ['-created'],
        limit: itemsPerPage,
        meta: 'total_count'
      })

      // Rememeber total count of the items
      const totalItems = items.length

      items = items.data
      let iids = items.map((item) => item.id)

      // Get votes with those items' id
      let votes = []
      if (iids.length > 0) {
        votes = await directus.items('user_votes').readMany({
          filter: {
            username: { _eq: user.username },
            item_id: { _in: iids },
            type: { _eq: 'item' }
          }
        })
        votes = votes.data
      }

      for (let i = 0; i < items.length; i++) {
        items[i].rank = (page - 1) * itemsPerPage + i + 1
      }

      // Add some properties for to each item
      for (let item of items) {
        if (item.by === user.username) {
          const hasEditAndDeleteExpired =
            item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            item.commentCount > 0

          item.editAndDeleteExpired = hasEditAndDeleteExpired
        }

        const vote = votes.find(function(e) {
          return e.item_id === item.id
        })

        if (vote) {
          item.votedOnByUser = true
          item.unvoteExpired = vote.date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
        }
      }

      return {
        success: true,
        items: items,
        isMore: totalItems > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }
  } catch (error) {
    return {getDataError: true}
  }
}
