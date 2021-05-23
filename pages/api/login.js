import loginUser from "../../api/users/loginUser.js"

export default async function handler(req, res) {
  console.log("REQUEST: ", JSON.parse(req.body))
  const useremail = JSON.parse(req.body).useremail;
  const password = JSON.parse(req.body).password;
  let result = await loginUser(useremail, password)
  console.log("LoginRESULT: ", result)
  res.status(200).json({ res: result })
}


