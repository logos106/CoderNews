import authUser from "../../api/users/authUser.js"
import credential from "../../utils/apiCredential.js"
const linkifyUrls = require("linkify-urls")
const xss = require("xss")

export default async function handler(req, res) {
    const id = JSON.parse(req.body).id
    const about = JSON.parse(req.body).about
    const email = JSON.parse(req.body).email
    const showDead = JSON.parse(req.body).showDead
    const directus = credential.directus
    try {
        await authUser(req, res)
        // let user = await directus.items("directus_users").readOne(id)
        let newAboutText = about
        newAboutText = newAboutText.trim()
        newAboutText = newAboutText.replace(/<[^>]+>/g, "")
        newAboutText = newAboutText.replace(/\*([^*]+)\*/g, "<i>$1</i>")
        newAboutText = linkifyUrls(newAboutText)
        newAboutText = xss(newAboutText)

        let oldEmail = await directus.users.me.read({
            fields: ['email'],
        });

        let updateValues = {}

        if ( email != oldEmail.email ) {
            updateValues = {
                about: newAboutText,
                email: email,
                show_dead: showDead
            }
        } else {
            updateValues = {
                about: newAboutText,
                show_dead: showDead
            }
        }

        // Email
        /* const emailApi = require("./emails/api")
        emailApi.sendChangeEmailNotificationEmail(username, oldEmail, emailAction, function() {
            callback({success: true})
        }) */

        await directus.users.me.update(updateValues);

        return res.status(200).json({ success: true })
    } catch (error) {
        //console.log(error)
        return res.status(200).json({ submitError: true })
    }
}
