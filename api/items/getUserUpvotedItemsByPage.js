import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getUserHiddenItemsByPage(page, user) {
  const directus = credential.directus
  const itemsPerPage = config.itemsPerPage

  try {
    // Get hidden
    let upvotes = await directus.items('user_votes').readMany({
      filter: {
        username: { _eq: user.username },
        upvote: { _eq: true },
        type: { _eq: 'item' }
      },
      offset: (page - 1) * itemsPerPage,
      limit: itemsPerPage,
      meta: 'total_count'
    });

    // Remember the total number of favorites selected
    const totalVotes = upvotes.meta.total_count

    // Filter for items
    let filterItems = {}
    let items = []

    upvotes = upvotes.data
    let vids = upvotes.map((upvote) => upvote.item_id)

    if (vids.length > 0) {
      filterItems.id = { _in: vids }
      if (!user.showDead) filterItems.dead = { _eq: false }

      // Aggregate items
      items = await directus.items('items').readMany({
        filter: filterItems,
        sort: ['-created'],
      });

      items = items.data
      for (let i = 0; i < items.length; i++) {
        items[i].votedOnByUser = true
        items[i].rank = (page - 1) * itemsPerPage + i + 1
        items[i].unvoteExpired = upvotes[i].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
      }
    }

    return {
      success: true,
      items: items,
      isMore: totalVotes > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
    }

  } catch(error) {
    //console.log(error)
    return { getDataError: true }
  }


}
