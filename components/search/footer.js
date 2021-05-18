import { Component } from "react"

import styles from "../../styles/components/search/footer.module.css"

export default class extends Component {
  render() {
    return (
      <div className="search-footer">
        <ul>
          <li>
            <a href="/search/about">About</a>
          </li>
          <li>•</li>
          <li>
            <a href="/search/settings">Settings</a>
          </li>
          <li>•</li>
          <li>
            <a href="/">Coder News</a>
          </li>
        </ul>
      </div>
    )
  }
}
