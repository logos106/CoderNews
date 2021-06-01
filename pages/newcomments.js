import { Component } from "react"
import authUser from "../api/users/authUser.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import CommentsList from "../components/commentsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import getNewestCommentsByPage from "../api/comments/getNewestCommentsByPage.js"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  const page = context.query.page ? parseInt(context.query.page) : 1
  const result = await getNewestCommentsByPage(page, authResult)

  return {
    props: {
      authUserData: authResult,
      comments: typeof result.comments === 'undefined' ? null : result.comments,
      page: page,
      isMore: typeof result.isMore === 'undefined' ? false : result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      goToString: page > 1 ? `newcomments?page=${page}` : `newcomments`
    }
  }
}

export default class extends Component {
  render() {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="New Comments | Coder News"
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
          pageName="newcomments"
        />
        <div className="comments-list-content-container">
          {
            !this.props.getDataError ?
            <CommentsList
              comments={this.props.comments}
              userSignedIn={this.props.authUserData.userSignedIn}
              currUsername={this.props.authUserData.username}
              goToString={this.props.goToString}
              showDownvote={this.props.authUserData.showDownvote}
              isMore={this.props.isMore}
              isMoreLink={`/newcomments?page=${this.props.page + 1}`}
              isModerator={this.props.authUserData.isModerator}
            /> :
            <div className="comments-list-error-msg">
              <span>An error occurred.</span>
            </div>
          }
        </div>
        <Footer />
      </div>
    )
  }
}
