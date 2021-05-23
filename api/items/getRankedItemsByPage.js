import { Directus, Auth } from '@directus/sdk';
import moment from "moment"

import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"

export default async function getRankedItemsByPage(page, signedIn) {
  // Get config
  const maxAgeOfRankedItemsInDays = config.maxAgeOfRankedItemsInDays
  const itemsPerPage = config.itemsPerPage
  const commentsPerPage = config.commentsPerPage

  const directus = credential.directus

  // Fetch items with conditions
  try {
    const startDate = moment().unix() - (86400 * maxAgeOfRankedItemsInDays)
    const items = directus.items('items')

    if (!signedIn) {  // If he is a guest
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

      return {
        success: true,
        items: result.data,
        isMore: false, //totalItemCount > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
        getDataError: false
      }
    }

  } catch(error) {
    return {getDataError: true}
  }


}
