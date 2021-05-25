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

  let users = await directus.items('users').readMany(
    {
      offset: 1,
      limit: 3,
      filter: {
        
        password: {
          _eq: 'darkhorse'
        },
        username: {
          _eq: "kkk"
        }
      },
      meta: "total_count"
    }
  );

  console.log("limited: ", users)

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
