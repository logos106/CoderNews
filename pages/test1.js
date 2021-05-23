import { Component } from "react"
import credential from "../utils/apiCredential.js"
import { Directus, Auth } from '@directus/sdk';
// import dd from './test3.js'

export async function getServerSideProps(context) {
  const directus = new Directus(credential.baseURL);
  const token = await directus.auth.login({
    // email: 'ujin518@outlook.com', //credential.email,
    email: credential.email,
    password: credential.password,
  },
  {
  	refresh: {
  		auto: true,   // Refresh token automatically
  	},
  });

  const ddd = await directus.users.me.read();

  console.log(token)

  const data = null
  return { props: { data } }
}

export default class extends Component {
  async login () {
    const res = await fetch("/api/login")

    res.json().then((dd) => console.log(dd));
  }

  render () {
    return (
      <div>
        <h1> Test1 </h1>
        <button onClick={() => this.login()}>Test</button>

      </div>

    )
  }
}
