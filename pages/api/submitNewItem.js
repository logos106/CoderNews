import credential from "../../utils/apiCredential.js"
import authUser from "../../api/users/authUser.js"
import helper from "../../utils/helper.js"
import moment from "moment"
const xss = require("xss")
const linkifyUrls = require("linkify-urls")

export default async function handler(req, res) {
    let title = JSON.parse(req.body).title;
    let url = JSON.parse(req.body).url;
    let text = JSON.parse(req.body).text;

    const directus = credential.directus
  
    const authResult = await authUser()
    
    if (text) {
      text = text.trim()
      text = text.replace(/<[^>]+>/g, "")
      text = text.replace(/\*([^*]+)\*/g, "<i>$1</i>")
      text = linkifyUrls(text)
      text = xss(text)
    }
    console.log("title: ", title)
    console.log("url: ", url)
    console.log("text: ", text)
    if (!authResult.userSignedIn) return res.status(200).json({authError: true})
    if (!title) return res.status(200).json({titleRequiredError: true})
    if (title.length > 80) return res.status(200).json({titleTooLongError: true})
    if (url && text) return res.status(200).json({urlAndTextError: true})
    if (text.length > 5000) return res.status(200).json({textTooLongError: true})
    console.log("---------------------")
    console.log("title: ", title)
    console.log("url: ", url)
    console.log("text: ", text)
    try {
      const items = directus.items('items')

      await items.createOne({
    	by: authResult.username,
        title: title,
        type: helper.getItemType(title, url, text),
        url: url,
        domain: url ? utils.getDomainFromUrl(url) : "",
        text: text,
        created: moment().unix(),
        dead: authResult.shadowBanned ? true : false,
        score: 0,
        points: 0,
        comment_count: 0
      });
      return res.status(200).json({ success: true })
    } catch (error) {
  
      res.status(200).json({ submitError: true })
    }
  
  }
  