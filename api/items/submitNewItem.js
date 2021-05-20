import { Directus, Auth } from '@directus/sdk';
import moment from "moment"
import apiBaseUrl from "../../utils/apiCredential.js"
import helper from "../../utils/helpler.js"

export default function submitNewItem(authUser, title, url, text, callback) {
  // Instantiate a new Directus object
  const directus = new Directus(credential.baseURL)

  // Login to Directus
  await directus.auth.login({
    email: credential.email,
    password: credential.password,
  });

  // Fetch items with conditions
  try {
    const startDate = moment().unix() - (86400 * maxAgeOfRankedItemsInDays)
    const items = directus.items('items')
    await items.createOne({
    	by: authUser.username,
      title: title,
      type: helper.getItemType(title, url, text),
      url: url,
      domain: url ? utils.getDomainFromUrl(url) : "",
      text: text,
      created: moment().unix(),
      dead: authUser.shadowBanned ? true : false
    });

    return { success: true }
  } catch(error) {
    return { submitError: true }
  }
}
