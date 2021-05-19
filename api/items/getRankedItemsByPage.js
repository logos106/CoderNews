import { Directus, Auth } from '@directus/sdk';
import moment from "moment"

import credential from "../../utils/apiCredential.js"
import config from "../../utils/config.js"

export default async function getRankedItemsByPage(page, signedIn) {
  // Get config
  const maxAgeOfRankedItemsInDays = config.maxAgeOfRankedItemsInDays
  const itemsPerPage = config.itemsPerPage
  const commentsPerPage = config.commentsPerPage

  // Instantiate a new Directus object
  const directus = new Directus(credential.baseURL)

  // Login to Directus
  await directus.auth.login({
    email: credential.email,
    password: credential.password,
  },
  {
  	refresh: {
  		auto: true,   // Refresh token automatically
  	},
  });

  try {
    const startDate = moment().unix() - (86400 * maxAgeOfRankedItemsInDays)
    const items = directus.items('items')
    const result = await items.readMany({
    	// search: 'Directus',
    	filter: {
    		created: {
    			_gte: startDate,
    		},
        dead: {
          _eq: false
        }
    	},
    });

    return {
      success: true,
      items: result.data,
      isMore: false, //totalItemCount > (((page - 1) * itemsPerPage) + itemsPerPage) ? true : false
      getDataError: false
    }
  } catch(error) {
    return {getDataError: true}
  }


}
