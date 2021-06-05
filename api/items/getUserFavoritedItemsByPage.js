import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getUserFavoritedItemsByPage(author, page, user) {
  const directus = credential.directus
  const itemsPerPage = config.itemsPerPage

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

    let favs = await directus.items('user_favorites').readMany({
      filter: {
        username: { _eq: author },
        type: { _eq: 'item' }
      },
      offset: (page - 1) * itemsPerPage,
      limit: itemsPerPage,
      meta: 'total_count'
    });

    // Remember the total number of favorites selected
    const totalFavs = favs.meta.total_count

    // Filter for items
    let filterItems = {}
    let items = []

    favs = favs.data
    let fids = favs.map((fav) => fav.item_id)
    if (fids.length > 0) {
      filterItems.id = { _in: fids }

      if (!user.showDead) filterItems.dead = { _eq: false }

      // Aggregate items
      items = await directus.items('items').readMany({
        filter: filterItems,
        sort: ['-created'],
      });

      items = items.data
      for (let i = 0; i < items.length; i++) {
        items[i].rank = (page - 1) * itemsPerPage + i + 1
      }
    }
    if (!user.userSignedIn) {
      return {
        success: true,
        items: items,
        isMore: totalFavs > (((page -1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }
    else {
      // Votes
      let iids = items.map((item) => item.id)
      let votes = []
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

      for (let item of items) {
        if (item.by === user.username) {
          const hasEditAndDeleteExpired =
            item.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            item.commentCount > 0

          item.editAndDeleteExpired = hasEditAndDeleteExpired
        }

        const idx = votes.findIndex(function(e) {
          return e.item_id === item.id
        })
        let vote = votes[idx]
        if (vote) {
          item.votedOnByUser = true
          item.unvoteExpired = vote.date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix() ? true : false
        }
      }

      return {
        success: true,
        items: items,
        isMore: totalFavs > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }

  } catch(error) {
    //console.log(error)
    return {getDataError: true}
  }
}
