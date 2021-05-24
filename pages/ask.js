import { Component } from "react"

import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import ItemsList from "../components/itemsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

import getRankedAskItemsByPage from "../api/items/getRankedAskItemsByPage.js"

export async function getServerSideProps(context) {
  const authResult = await authUser()

  // Fetch data from external API
  const page = 1
  const result = await getRankedItemsByPage(page, authResult)
  const page = query.page ? parseInt(query.page) : 1
  const apiResult = await getRankedAskItemsByPage(page, req)

  return {
    items: apiResult && apiResult.items,
    authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
    page: page,
    isMore: apiResult && apiResult.isMore,
    getDataError: apiResult && apiResult.getDataError,
    goToString: page > 1 ? `ask?page=${page}` : "ask"
  }
  /* // Pass data to the page via props
  return {
    props: {
      items: typeof result.items === 'undefined' ? null : result.items,
      authUserData: authResult,
      page: page,
      isMore: typeof result.isMore === 'undefined' ? false : result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      goToString: ""
    }
  } */
}

export default class extends Component {
  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Ask | Coder News"
          description="News and discussion for software engineers."
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
          pageName="ask"
        />
        <div className="items-list-content-container">
          {
            !this.props.getDataError ?
            <ItemsList
              items={this.props.items}
              goToString={this.props.goToString}
              userSignedIn={this.props.authUserData.userSignedIn}
              currUsername={this.props.authUserData.username}
              showRank={true}
              isMoreLink={`/ask?page=${this.props.page + 1}`}
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
