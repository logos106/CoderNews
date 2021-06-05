import { Component } from "react"
import authUser from "../api/users/authUser.js"
import HeadMetadata from "../components/headMetadata.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import ItemsList from "../components/itemsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import getRankedItemsByPage from "../api/items/getRankedItemsByPage.js"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  // Fetch data from external API
  const page = context.query.page? parseInt(context.query.page) : 1
  const result = await getRankedItemsByPage(page, authResult)

  // Pass data to the page via props
  return {
    props: {
      items: typeof result.items === 'undefined' ? null : result.items,
      authUserData: authResult,
      page: page,
      isMore: typeof result.isMore === 'undefined' ? false : result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      goToString: ""
    }
  }
}

export default class extends Component {
  render () {
    // console.log(this.props.items)
    // return (
    //   <div></div>
    // )
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
