import { Component } from "react"
// import directus from '../components/authdirectus'
import {Directus} from '@directus/sdk'

export async function getServerSideProps(context) {
    const directus = new Directus("http://192.168.8.141:8055")
    const items = await directus.items('items').readMany()
    
    return {
      props: {
        say: "hello2",
        items: items.data
      }
    }
  }

export default class extends Component {
  render() {
    const listItems = this.props.items.map((item) =><li>{items.totil}</li>);
    return(
        <div>
            <h1>{this.props.say}</h1>
            <ul>{listItems}</ul>
        </div>
    )
  }
}
