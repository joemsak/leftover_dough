/* eslint no-console: 0 */
import Vue from 'vue'
import Vue2Filters from 'vue2-filters'

Vue.use(Vue2Filters)

import Api from 'utils/api'

import App from '../app.vue'
import router from 'routes'
import store from 'store'

function initApp (el) {
  new Vue({
    el,
    store,
    router,
    render: h => h(App),
  })
}

let refreshJWTIntervalId

window.addEventListener('focus', autoRefreshJWT)

function autoRefreshJWT () {
  if (!refreshJWTIntervalId) {
    const expireStr = window.localStorage.getItem('jwtExpiresAt')

    const expiry = parseInt(expireStr) - 120 // minus 2 minutes
    const now = Math.floor(new Date().getTime() / 1000)

    const milliseconds = (expiry - now) * 1000

    console.log(milliseconds)
    if (milliseconds > 0)
      refreshJWTIntervalId = setInterval(refreshJWT, milliseconds)
  }
}

window.addEventListener('blur', () => {
  clearInterval(refreshJWTIntervalId)
  refreshJWTIntervalId = 0
})

function refreshJWT () {
  const refreshToken = window.localStorage.getItem('refreshToken')
  Api.post('/access_token_refreshes', { token: refreshToken })
    .then(json => setJWT(json))
}

function setJWT (json) {
  window.localStorage.setItem('jwt', json.jwt)
  window.localStorage.setItem('jwtExpiresAt', json.expiresAt)
  window.localStorage.setItem('refreshToken', json.refreshToken)
  clearInterval(refreshJWTIntervalId)
  autoRefreshJWT()
}

document.addEventListener('DOMContentLoaded', () => {
  const el = document.body.querySelector("#leftoverdough-app")
  const search = window.location.search
  const jwt = window.localStorage.getItem('jwt')

  if (window.location.pathname.match(/signin|signup/)) {
    return false

  } else if (window.location.pathname.match(/logout/)) {
    window.localStorage.removeItem('jwt')
    window.location.href = '/signin'
    return false

  } else if (search && search.match(/magicLinkToken=/)) {
    const token = search.match(/magicLinkToken=(\w+)/)[1]

    Api.post('/access_tokens', { token })
      .then(json => {
        setJWT(json)
        window.history.replaceState(null, null, window.location.pathname)
        initApp(el)
        return false
      })

  } else if (search && search.match(/emailConfirmationToken=/)) {
    const token = search.match(/emailConfirmationToken=(\w+)/)[1]

    Api.post('/email_confirmations', { token })
      .then(json => {
        setJWT(json)
        window.history.replaceState(null, null, window.location.pathname)
        initApp(el)
        return false
      })

  } else if (el && jwt) {
    initApp(el)
    return false

  } else {
    window.location.href = '/signin'

  }
})