import { Component } from "react"
import { Directus, Auth } from '@directus/sdk';

export async function getServerSideProps(context) {
  const directus = new Directus('http://192.168.8.141:8055');

  const token = await directus.auth.login({
    email: 'logos106@outlook.com',
    password: 'glowglow',
  },
  {
		refresh: {
			auto: true,
		},
	});

  console.log('2', token)

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
