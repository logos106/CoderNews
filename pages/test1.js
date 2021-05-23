import { Component } from "react"
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { client, cache } from '../components/authdirectus.js'
import { gql } from '@apollo/client'

export async function getServerSideProps(context) {
  // console.log(cache)
  let res = await client.mutate({
    mutation: gql`
    mutation {
      auth_login(email: "logos106@outlook.com", password: "glowglow") {
      access_token
      refresh_token
      }
    }
    `
  })
  console.log(res)

  
  res = await client.query({
    query: gql`
      query {
        items {
          title
        }
      }
      `
  })

  console.log("RESULT: ", res)
  return { props: { data: "res" } }
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
