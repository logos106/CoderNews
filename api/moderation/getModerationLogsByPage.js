import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"

export default async function getModerationLogsByPage(category, page, user) {
  const directus = credential.directus
  const moderationLogsPerPage = config.bannedUsersPerPage

  let filterLog, categoryString

  if (category === "users") {
    categoryString = "users"
    filterLog = {
      _or: [
        { actionType: { _eq: "add-user-shadow-ban" } },
        { actionType: { _eq: "remove-user-shadow-ban" } },
        { actionType: { _eq: "add-user-ban" } },
        { actionType: { _eq: "remove-user-ban" } }
      ]
    }
  } else if (category === "items") {
    categoryString = "items"
    filterLog = {
      $or: [
        {actionType: { _eq: "kill_item" } },
        {actionType: { _eq: "unkill_item" } }
      ]
    }
  } else if (category === "comments") {
    categoryString = "comments"
    filterLog = {
      $or: [
        {actionType: { _eq: "kill_comment" } },
        {actionType: { _eq: "unkill_comment" } }
      ]
    }
  } else {
    categoryString = "all"
    filterLog = {}
  }
  try {
      // Get banned users
      const logs = await directus.items('moderation_logs').readMany({
        filter: filterLog,
        offset: (page - 1) * moderationLogsPerPage,
        limit: moderationLogsPerPage,
        meta: 'total_count'
      });

      const totalLogs = logs.meta.total_count

      logs = logs.data

      return {
        success: true,
        logs: logs,
        categoryString: categoryString,
        isMore: totalLogs > (((page - 1) * moderationLogsPerPage) + moderationLogsPerPage) ? true : false
      }

  } catch(error) {
    //console.log(error)
    return {getDataError: true}
  }

}
