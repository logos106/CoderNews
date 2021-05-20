import { Directus, Auth } from '@directus/sdk';
import moment from "moment"
import credential from "../../utils/apiCredential.js"
import helper from "../../utils/helper.js"

export default async function submitNewItem(authUser, title, url, text, callback) {
  // Instantiate a new Directus object
  const directus = new Directus(credential.baseURL)

  // Login to Directus
  await directus.auth.login({
    email: credential.email,
    password: credential.password,
  });

  // Fetch items with conditions
  try {
    const items = directus.items('items')
    await items.createOne({
    	by: authUser.username,
      title: title,
      type: helper.getItemType(title, url, text),
      url: url,
      domain: url ? utils.getDomainFromUrl(url) : "",
      text: text,
      created: moment().unix(),
      dead: authUser.shadowBanned ? true : false,
      score: 1,
      points: 2,
      comment_count: 3
    });

    callback({ success: true })
  } catch(error) {
    callback ({ submitError: true })
  }
}
