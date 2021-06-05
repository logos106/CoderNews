import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import helper from "../../../utils/helper.js"

export default async function handler(req, res) {
  const id = JSON.parse(req.body).id;
  let newTitle = JSON.parse(req.body).title;
  let newText = JSON.parse(req.body).text;

  const user = await authUser(req, res)

  try {
    const directus = credential.directus

    // Find the item by ID
    const item = await directus.items('items').readOne(id)

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

    await directus.items('items').updateMany([id], {
    	title: newTitle,
      text: newText,
      type: newType
    });

    return res.status(200).json({ success: true })

    // searchApi.editItem(itemId, newItemTitle, newItemText, function() {
    //   callback({success: true})
    // })

  } catch(error) {
    //console.log(error)
    return res.status(200).json({ submitError: true })
  }
}
