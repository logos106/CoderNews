import { Component } from "react"
import credential from "../utils/apiCredential.js"
import { Directus, Auth } from '@directus/sdk';
import dd from './test3.js'

export async function getServerSideProps(context) {
  const directus = dd.d

  // const items = await directus.items('items').readMany()
  // items.data.map((item) => console.log(item.title))

  await directus.users.createOne({
  	email: 'logos115@outlook.com',
    password: 'glowglow',
    status: 'active',
    role: '878081e0-a827-4ad2-aca6-322189a93d6b'
  });
  const res = await directus.roles.readMany()
  console.log(res)

  const data = null
  return { props: { data } }
}

export default class extends Component {
  // componentDidMount() {
  //   const directus = new Directus(credential.baseURL);
  //   // const directus = dd.d
  //   // directus.auth.login({
  //   //   email: credential.email,
  //   //   password: credential.password,
  //   //   mode: 'cookie'
  //   // },
  //   // {
  //   //   refresh: {
  //   //     auto: true,   // Refresh token automatically
  //   //   },
  //   // });
  //
  //   directus.items('directus_users').readMany()
  //     .then((d) => console.log(d))
  // }

  render () {
    return (
      <h1> Test2 </h1>
    )
  }
}
