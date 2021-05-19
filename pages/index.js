import { Component } from "react"
import Cookies from "cookies"

import HeadMetadata from "../components/headMetadata.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import ItemsList from "../components/itemsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import getRankedItemsByPage from "../api/items/getRankedItemsByPage.js"

export async function getServerSideProps(context) {
  // Get user data from cookie
  const cookies = new Cookies(context.req, context.res)

  let username = cookies.get('username')
  let signedIn = true
  if (typeof username === 'undefined') {
    username = ''
    signedIn = false
  }
  let karma = cookies.get('karma')
  if (typeof karma === 'undefined')
    karma = 0

  const userData = {userSignedIn: signedIn, karma: 0, username: username}

  // Fetch data from external API
  const page = 1
  const result = await getRankedItemsByPage(page, signedIn)

  // Pass data to the page via props
  return {
    props: {
      items: typeof result.items === 'undefined' ? null : result.items,
      authUserData: userData,
      page: page,
      isMore: typeof result.isMore === 'undefined' ? false : result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      goToString: ""
    }
  }
}

export default class extends Component {
  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Coder News"
          description="News and discussion for software engineers."
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData.userSignedIn}
          username={this.props.authUserData.username}
          karma={this.props.authUserData.karma}
          goto={this.props.goToString}
        />
        <div className="items-list-content-container">
          {
            !this.props.getDataError ?
            <ItemsList
              items={this.props.items}
              goToString={this.props.goToString}
              userSignedIn={this.props.authUserData.userSignedIn}
              currUsername={this.props.authUserData.username}
              showHideOption={true}
              showRank={true}
              isMoreLink={"/news?page=2"}
              isMore={this.props.isMore}
              isModerator={this.props.authUserData.isModerator}
            /> :
            <div className="items-list-error-msg">
              <span>An error occurred.</span>
            </div>
          }
        </div>
        <Footer />
      </div>
    )
  }
}
