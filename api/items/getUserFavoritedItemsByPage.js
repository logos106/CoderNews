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
    const totalFavs = items.meta.total_count

    // Filter for items
    let filterItems = {}

    favs = favs.data
    let fids = favs.map((fav) => fav.id)
    if (fids.length > 0) filterItems.id = { _in: fids }

    if (!user.showDead) filterItems.dead = { _eq: false }

    // Aggregate items
    let items = await directus.items('items').readMany({
      filter: filterItems
    });

    items = items.data
    items.forEach((item, i) => {
      item.rank = (page - 1) * itemsPerPage + i + 1
    })

    if (!user.signedIn) {
      return {
        success: true,
        items: items,
        isMore: totalFavoriteItemsCount > (((page -1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }
    else {
      // Votes
      const votes = await directus.items('user_votes').readMany({
        filter: {
          username: { _eq: user.username },
          id: { _in: iids },
          type: { _in: 'item' }
        }
      })

      items.forEach((item, i) => {
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
        isMore: totalFavs > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }

  } catch(error) {
    return {getDataError: true}
  }


}
