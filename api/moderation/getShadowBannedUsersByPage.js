import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function getShadowBannedUsersByPage(page, user) {
  const directus = credential.directus
  const shadowBannedUsersPerPage = config.shadowBannedUsersPerPage

  try {
    // Get banned users
    const users = await directus.items('directus_users').readMany({
      filter: {
        shadow_banned: { _eq: true }
      },
      offset: (page - 1) * shadowBannedUsersPerPage,
      limit: shadowBannedUsersPerPage,
      meta: 'total_count'
    });

    const totalUsers = users.meta.total_count

    users = users.data

    return {
      success: true,
      users: users,
      isMore: totalUsers > (((page - 1) * shadowBannedUsersPerPage) + shadowBannedUsersPerPage) ? true : false
    }

  } catch(error) {
    //console.log(error)
    return {getDataError: true}
  }

}
