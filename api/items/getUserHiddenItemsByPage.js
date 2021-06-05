import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"
import hidden from "../../pages/hidden.js"

export default async function getUserHiddenItemsByPage(page, user) {
  const directus = credential.directus
  const itemsPerPage = config.itemsPerPage
  try {
    // Get hidden
    let hiddens = await directus.items('user_hiddens').readMany({
      filter: {
        username: { _eq: user.username }
      },
      offset: (page - 1) * itemsPerPage,
      limit: itemsPerPage,
      meta: 'total_count'
    });
    // Remember the total number of favorites selected
    const totalHiddens = hiddens.meta.total_count
    if (totalHiddens < 1)
      return { success: true, items: [], isMore: false }

    // Filter for items
    let filterItems = {}

    hiddens = hiddens.data

    let hids = hiddens.map((hidden) => hidden.item_id)
    if (hids.length > 0) filterItems.id = { _in: hids }

    if (!user.showDead) filterItems.dead = { _eq: false }

    // Aggregate items
    let items = await directus.items('items').readMany({
      filter: filterItems,
      sort: ['-created'],
    });

    items = items.data
    for (let i = 0; i < items.length; i++) {
      items[i].rank = (page - 1) * itemsPerPage + i + 1
    }

    // Votes
    let votes = []
    let iids = items.map((item) => item.id)
    if (iids.length > 0) {
      votes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq: user.username },
          item_id: { _in: iids },
          type: { _in: 'item' }
        }
      })
      votes = votes.data
    }

    for (let i = 0; i < items.length; i++) {
      items[i].rank = (page - 1) * itemsPerPage + i + 1
    }

    for (let item of items) {
      item.hiddenByUser = true

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
      isMore: totalHiddens > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
    }


  } catch(error) {
    //console.log(error)
    return { getDataError: true }
  }


}
