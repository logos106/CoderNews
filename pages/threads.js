import { Component } from "react"
import authUser from "../api/users/authUser.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import CommentsList from "../components/commentsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

import getUserCommentsByPage from "../api/comments/getUserCommentsByPage.js"

export async function getServerSideProps (context) {
  const authResult = await authUser(context.req, context.res)

  const username = context.query.id ? context.query.id : ""
  const page = context.query.page ? parseInt(context.query.page) : 1

  const result = await getUserCommentsByPage(username, page, authResult)

  return {
    props: {
      comments: result.comments,
      authUserData: authResult,
      page: page,
      userId: username,
      isMore: result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      notFoundError: typeof result.notFoundError === 'undefined' ? false : result.notFoundError,
      goToString: page > 1 ? `threads?id=${userId}&page=${page}` : `threads?id=${username}`
    }
  }
}

export default class extends Component {

  render() {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title={!this.props.getDataError && !this.props.notFoundError ? `${this.props.userId}'s Comments | Coder News` : "Coder News"}
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
          pageName={this.props.authUserData.username === this.props.userId || this.props.notFoundError || this.props.getDataError ? "threads" : null}
          label={!this.props.notFoundError && !this.props.getDataError && this.props.authUserData.username !== this.props.userId ? `${this.props.userId}'s comments` : null}
        />
        <div className="comments-list-content-container">
          {
            !this.props.getDataError && !this.props.notFoundError ?
            <CommentsList
              comments={this.props.comments}
              userSignedIn={this.props.authUserData.userSignedIn}
              currUsername={this.props.authUserData.username}
              goToString={this.props.goToString}
              showDownvote={this.props.authUserData.showDownvote}
              isMoreLink={`/threads?id=${this.props.userId}&page=${this.props.page + 1}`}
              isMore={this.props.isMore}
              isModerator={this.props.authUserData.isModerator}
            /> :
            <div className="comments-list-error-msg">
              {
                this.props.notFoundError ?
                <span>User not found.</span> :
                <span>An error occurred.</span>
              }
            </div>
          }
        </div>
        <Footer />
      </div>
    )
  }
}
