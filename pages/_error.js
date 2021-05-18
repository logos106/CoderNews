import { Component } from "react"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

export default class extends Component {
  render () {
    return (
      <div className="error-wrapper">
        <HeadMetadata
          title="Error | Coder News"
        />
        <GoogleAnalytics />
        <span>An error occurred.</span>
      </div>
    )
  }
}
