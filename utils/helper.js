import { nanoid } from 'nanoid'
import url from "url"
import psl from "psl"
import validator from "validator"

export default {
  // directusBaseUrl: 'http://localhost:8055/',
  generateUniqueId: function(length) {
    return nanoid(length)
    // const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    //
    // const generator = nanoid.customAlphabet(alphabet, length)
    //
    // return generator()
  },
  getDomainFromUrl: function(paramUrl) {
    const hostname = url.parse(paramUrl).hostname
    const parsed = psl.parse(hostname)

    return parsed ? parsed.domain : null
  },
  validateEmail: function(email) {
    if (email === "") {
      return true
    } else {
      return validator.isEmail(email)
    }
  },
  isValidUrl: function(url) {
    return validator.isURL(url, {require_protocol: true})
  },
  getItemType: function(title, url, text) {
    if (url) {
      if (title.toLowerCase().startsWith("show cn")) {
        return "show"
      } else {
        return "news"
      }
    } else {
      return "ask"
    }
  },
  isValidDate: function(dateString) {
    return validator.isISO8601(dateString)
  }
}
