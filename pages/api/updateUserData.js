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
        await authUser()
        // let user = await directus.items("directus_users").readOne(id)
        let newAboutText = about
        newAboutText = newAboutText.trim()
        newAboutText = newAboutText.replace(/<[^>]+>/g, "")
        newAboutText = newAboutText.replace(/\*([^*]+)\*/g, "<i>$1</i>")
        newAboutText = linkifyUrls(newAboutText)
        newAboutText = xss(newAboutText)
        console.log("About updated: ", newAboutText, id)
        let oldEmail = await directus.users.me.read({
            fields: ['email'],
        });

        let updateValues = {}

        if ( email != oldEmail.email ) 
            updateValues = {
                about: newAboutText,
                email: email,
                show_dead: showDead
            }
        else
            updateValues = {
                about: newAboutText,
                show_dead: showDead
            }
        console.log("updateValues", updateValues, email, oldEmail.email, (email == oldEmail.email))
        await directus.users.me.update(updateValues);
        console.log("Success Saved!")
        return res.status(200).json({ success: true })
    } catch (error) {
        console.log("Error: ", error)
        return res.status(200).json({ submitError: true })
    }
}