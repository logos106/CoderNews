import { Component } from "react"
// import directus from '../components/authdirectus'
import {Directus} from '@directus/sdk'

export async function getServerSideProps(context) {
    const directus = new Directus('http://192.168.8.141:8055');
    await directus.auth.login({
        email: 'logos106@outlook.com',
        password: 'glowglow'
    }, {
		refresh: {
			auto: true,
            time: 30000,
		},
	})
    const items = await directus.items('items').readMany()
    const me = await directus.users.me.read();
    const roles = await directus.roles.readOne(me.role)
    console.log("============", roles)
    return {
      props: {
        say: "hello",
        items: items.data
      }
    }
  }

export default class extends Component {
  render() {
    const listItems = this.props.items.map((item) =><li>{item.title}</li>);
    return (
        <div>
            <h1>{this.props.say}</h1>
            <ul>{listItems}</ul>
        </div>
    )
  }
}
