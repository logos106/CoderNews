import { Directus, Auth } from '@directus/sdk';
import credential from "../../utils/apiCredential.js"
import helper from "../../utils/helper.js"

export default async function editItem(id, newTitle, newText, callback) {
  try {
    // Instantiate a new Directus object
    const directus = new Directus(credential.baseURL)

    // Login to Directus
    await directus.auth.login({
      email: credential.email,
      password: credential.password,
    });

    // Find the item by ID
    const items = directus.items('items')
    const item = await items.readOne(id)

    const oldTitle = item.title

    // New title
    newTitle = newTitle.trim()
    // newTitle = xss(newTitle)

    // New text
    if (item.url == '' && newText) {
      newText = newText.trim()
      newText = newText.replace(/<[^>]+>/g, "")
      newText = newText.replace(/\*([^*]+)\*/g, "<i>$1</i>")
      // newText = linkifyUrls(newText)
      // newText = xss(newText)
    }

    // New type
    let newType = ''
    if (oldTitle !== newTitle)
      newType = helper.getItemType(newTitle, item.url, newText)

    await items.updateMany([id], {
    	title: newTitle,
      text: newText,
      type: newType
    });

    callback({ success: true })

    // searchApi.editItem(itemId, newItemTitle, newItemText, function() {
    //   callback({success: true})
    // })

  } catch(error) {
            console.log(error)
    callback({ submitError: true })
  }
}
