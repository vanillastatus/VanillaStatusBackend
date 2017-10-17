'use strict'
const endpoint = require('serverless-endpoint')
const Redis = require('./redis')

function status (req, res) {
  const server = new Redis()
  const realmdata = new Redis({ prefix: 'realmdata' })
  const data = {
    servers: {},
    autoqueue: {}
  }

  return server.getAll()
    .then((response) => {
      if (response) {
        // Fix string boolean. This should be moved redis util
        Object.keys(response).forEach(key => {
          const server = response[key]
          if (server) {
            server.status = server.status === 'true'
            server.isFetching = server.isFetching === 'true'

            data.servers[key] = server
          }
        })

      }

      return realmdata.getAll()
    })
    .then((response) => {
      if (response) {
        data.realmdata = {
          available: true,
          servers: response
        }
      }
    })
    .then(() => {
      return res.send(200, data)
    })
    .catch(e => {
      console.error(e)
      return res.send(500, e)
    })
}

module.exports.status = endpoint(status)
