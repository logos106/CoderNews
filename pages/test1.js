import { Component } from "react"
import credential from "../utils/apiCredential.js"
import { Directus, Auth } from '@directus/sdk';

export async function getServerSideProps(context) {
  const directus = credential.directus

  const token = await directus.auth.login({
    email: credential.email,
    password: credential.password,
  },
  {
		refresh: {
			auto: true,
		},
	});

  const ddd = await directus.users.me.read();

  console.log(ddd)

  const data = null
  return { props: { data } }
}

export default class extends Component {
  
  render () {
    return (
      <div>
        <h1> Test1 </h1>
        <button onClick={() => this.login()}>Test</button>

      </div>

    )
  }
}
