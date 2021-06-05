import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getBannedUsersByPage(page, user) {
  const directus = credential.directus
  const bannedUsersPerPage = config.bannedUsersPerPage

  try {
      // Get banned users
      const users = await directus.items('directus_users').readMany({
        filter: {
          banned: { _eq: true }
        },
        offset: (page - 1) * bannedUsersPerPage,
        limit: bannedUsersPerPage,
        meta: 'total_count'
      });

      const totalUsers = users.meta.total_count

      users = users.data

      return {
        success: true,
        items: items,
        isMore: totalUsers > (((page - 1) * bannedUsersPerPage) + bannedUsersPerPage) ? true : false
      }
  } catch(error) {
    //console.log(error)
    return {getDataError: true}
  }

}
