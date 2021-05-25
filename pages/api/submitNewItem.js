import credential from "../../utils/apiCredential.js"
import authUser from "../../api/users/authUser.js"

export default async function handler(req, res) {
    const useremail = JSON.parse(req.body).useremail;
    const password = JSON.parse(req.body).password;
    const directus = credential.directus
  
    const authResult = await authUser()
  
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
  