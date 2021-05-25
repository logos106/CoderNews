import axios from "axios"

import apiBaseUrl from "../../utils/apiCredential.js"

import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getUserCommentsByPage(username, page, user) {
  const directus = credential.directus
  
  const maxAgeOfRankedItemsInDays = config.maxAgeOfRankedItemsInDays
  const itemsPerPage = config.itemsPerPage
  const commentsPerPage = config.commentsPerPage
  const startDate = moment().unix() - (86400 * maxAgeOfRankedItemsInDays)

  try {
    if (!username || !page) return {getDataError: true}
    const users = await directus.items('directus_users').readMany({
      filter: {
        username: {
          _eq: username
        }
      }
    })

    if (users.data.length == 0) return {notFoundError: true}

    let commentsDbQuery = {
      offset: (page-1) * commentsPerPage,
      limit: commentsPerPage,
      filter: {
        by: {
          _eq: username
        }
      },
      meta: "total_count"
    }

    if (!user.showDead) {
      commentsDbQuery = {
        offset: (page-1) * commentsPerPage,
        limit: commentsPerPage,
        filter: {
          by: {
            _eq: username
          },
          dead: {
            _eq: false
          }
        },
        meta: "total_count"
      }
    }

    let filtered_comments = await directus.items('comments').readMany(commentsDbQuery)
    let totalCommentsCount = filtered_comments.meta.total_count
    let comments = filtered_comments.data

    if (!user.signedIn) {
      return {
        success: true,
        comments: comments,
        isMore: totalCommentsCount > (((page -1) * commentsPerPage) + commentsPerPage) ? true : false
      }
    } else {
      let arrayOfCommentIds = []

      for (let i=0; i < comments.length; i++) {
        if (comments[i].by !== user.username) arrayOfCommentIds.push(comments[i].id)

        if (comments[i].by === user.username) {
          const hasEditAndDeleteExpired =
            comments[i].created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix() ||
            comments[i].children.length > 0

          comments[i].editAndDeleteExpired = hasEditAndDeleteExpired
        }
      }
    }

  } catch(error) {
    return {getDataError: true}
  }
}
