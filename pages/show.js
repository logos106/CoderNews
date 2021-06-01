import { Component } from "react"

import "../styles/pages/show.module.css"

import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import ItemsList from "../components/itemsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import authUser from "../api/users/authUser.js"

import getRankedShowItemsByPage from "../api/items/getRankedShowItemsByPage.js"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  // Fetch data from external API
  const page = context.query.page? parseInt(context.query.page) : 1
  const result = await getRankedShowItemsByPage(page, authResult)

  // Pass data to the page via props
  return {
    props: {
      items: typeof result.items === 'undefined' ? null : result.items,
      authUserData: authResult,
      page: page,
      isMore: typeof result.isMore === 'undefined' ? false : result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      goToString: page > 1 ? `show?page=${page}` : "show"
    }
  }
}

export default class extends Component {

  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Show | Coder News"
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
          pageName="show"
        />
        <div className="items-list-content-container">
          {
            !this.props.getDataError ?
            <>
              <div className="show-items-top-text">
                <span>Please read the <a href="/showguidelines">rules</a>. You can also browse the <a href="/shownew">newest</a> Show submissions.</span>
              </div>
              <ItemsList
                items={this.props.items}
                goToString={this.props.goToString}
                userSignedIn={this.props.authUserData.userSignedIn}
                currUsername={this.props.authUserData.username}
                showHideOption={true}
                showRank={true}
                isMoreLink={`/show?page=${this.props.page + 1}`}
                isMore={this.props.isMore}
                isModerator={this.props.authUserData.isModerator}
              />
            </> :
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
