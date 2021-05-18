import { Component } from "react"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

export default class extends Component {
  render () {
    return (
      <div className="error-wrapper">
        <HeadMetadata
          title="Unkown | Coder News"
        />
        <GoogleAnalytics />
        <span>Page not found.</span>
      </div>
    )
  }
}
