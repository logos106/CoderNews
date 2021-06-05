import authUser from "../../api/users/authUser.js"
import credential from "../../utils/apiCredential.js"
import moment from "moment"

export default async function handler(req, res) {
    const currentPassword = JSON.parse(req.body).currentPassword;
    const newPassword = JSON.parse(req.body).newPassword;

    const directus = credential.directus

    const user = await authUser(req, res)

    if (!user.userSignedIn) return res.json({ authError: true })

    if (!currentPassword || !newPassword) return res.json({ submitError: true })

    try {
        // Check if any user with the eamil address
        let the_user = await directus.items('directus_users').readMany(
            {
                filter: { username: { _eq: user.username } },
            }
        )

        // If not
        if (the_user.data.length == 0) {
            return res.status(200).json({submitError: true})
        }
        the_user = the_user.data[0];

        if (newPassword.length < 8) return res.json({ newPasswordLengthError: true })

        await directus.items("directus_users").updateOne(the_user.id, {
            password: newPassword
        })

        return res.status(200).json({ success: true })
    } catch (error) {
        //console.log(error)
        res.status(200).json({ submitError: true })
    }

}
