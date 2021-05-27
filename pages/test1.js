import { Component } from "react"
import credential from "../utils/apiCredential.js"

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

  let users = await directus.items('users').readMany({
    filter: {
      _or: [
        {username: { _eq: 'kkk' }},
        {id: { _eq: 11 }}
      ]
    }
  });

  console.log(users)

  const data = null
  return { props: { data } }
}

export default class extends Component {
  async favorite () {
    const itemId = 123
    let res = await fetch("/api/items/favorite?id=" + itemId, {
      method: "GET"
    })

    let response = await res.json()

    console.log(response)
  }

  render () {
    return (
      <div>
        <h1> Test1 </h1>
        <button onClick={() => this.favorite()}>Test</button>

      </div>

    )
  }
}
