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
    if (!user.userSignedIn) {  // If he is a guest
      let items = await directus.items('items').readMany({
        filter: {
          created: { _gte: startTimestamp, _lte: endTimestamp },
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
        isMore: items.length > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }
    else {
      // Get hidden * for this user
      let hiddens = await directus.items('user_hiddens').readMany({
        filter: {
          username: { _eq: user.username  },
          item_creation_date: {  _gte: startTimestamp, _lte: endTimestamp }
        }
      });
      hiddens = hiddens.data

      let filterItems = {
        created: {  _gte: startTimestamp, $lte: endTimestamp }
      }

      let hids = hiddens.map((hidden) => hidden.item_id)
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
      let votes = []
      if (iids.length > 0) {
        votes = await directus.items('user_votes').readMany({
          filter: {
            username: user.username,
            item_id: { _in: iids },
            type: "item"
          }
        })
        votes = votes.data
      }

      items.forEach((item, i) => {
        item.rank = ((page - 1) * itemsPerPage) + (i + 1)

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
      })

      return {
        success: true,
        items: items,
        isMore: totalItems > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      }
    }

  } catch (error) {
    console.log(error)
    return {getDataError: true}
  }


}
