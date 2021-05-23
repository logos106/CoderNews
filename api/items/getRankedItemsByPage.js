import { Directus, Auth } from '@directus/sdk';
import moment from "moment"

import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"

export default async function getRankedItemsByPage(page, user) {
  // Get config
  const maxAgeOfRankedItemsInDays = config.maxAgeOfRankedItemsInDays
  const itemsPerPage = config.itemsPerPage
  const commentsPerPage = config.commentsPerPage

  const directus = credential.directus

  // Fetch items with conditions
  try {
    const startDate = moment().unix() - (86400 * maxAgeOfRankedItemsInDays)
    const items = directus.items('items')

    if (!user.signedIn) {  // If he is a guest
      const result = await items.readMany({
        filter: {
          created: {
            _gte: startDate,
          },
          dead: {
            _eq: false
          }
        },
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage
      });

      // Set items' rank
      for (let [i, item] of result.data.entries()) {
        item.rank = (page - 1) * itemsPerPage + i + 1
      }

      return {
        success: true,
        items: result.data,
        isMore: result.data.length > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false,
        getDataError: false
      }
    }
    else {
      // Get hidden * for this user
      const hiddens = await user_hiddens.readMany({
        filter: {
          username: {
            _eq: user.username
          },
          itemCreationDate: {
            _gte: startDate,
          }
        }
      });

      let hiddenIds = []
      for (let hidden of hiddens.data) {
        hiddenIds.push(hidden.id)
      }

      let itemsDbQuery = {
        created: {
          _gte: startDate
        },
        id: {
          _nin: hiddenIds
        }
      }

      if (!user.showDead) itemsDbQuery.dead = {_eq: false}

      // Get items
      const items = await directus.items.readMany({
        filter: iteemsDbQuery,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage
      })

      let itemIds = []
      for (let hidden of items.data) {
        itemIds.push(item.id)
      }

      // Votes
      const votes = await directus.user_votes.readMany({
        filter: {
          username: user.username,
          date: { _gte: startDate },
          id: { _in: itemIds },
          type: "item"
        }
      })

      for (let item of items) {
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
