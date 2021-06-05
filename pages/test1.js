import { Component } from "react"
import { Directus, Auth } from '@directus/sdk';
import Cookies from 'cookies'

export async function getServerSideProps(context) {
  const directus = new Directus('http://192.168.8.141:8055');

  await directus.auth.login({
    email: 'logos106@outlook.com',
    password: 'glowglow',
  },
  {
		refresh: {
			auto: true,
		},
	});

  let items = await directus.items('items').readMany({
    filter: {
      id: { _between: [37, 39 ] }
    }
  })

  console.log(items.data)

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
