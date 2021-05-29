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

  console.log('1', token)

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
