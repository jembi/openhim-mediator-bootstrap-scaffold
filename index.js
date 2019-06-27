'use strict'

const express = require('express')
// The OpenHIM Mediator Utils is an essential package for quick mediator setup.
// It handles the OpenHIM authentication, mediator registration, and mediator heartbeat.
const mediatorUtils = require('openhim-mediator-utils')
// Pino is purely used for more readable logging.
const pino = require('pino')

// The constants file gets its content from environmental variable or their default values.
const {
  MEDIATOR_PORT,
  MEDIATOR_HEARTBEAT,
  OPENHIM_USERNAME,
  OPENHIM_PASSWORD,
  OPENHIM_API_URL,
  OPENHIM_TRUST_SELF_SIGNED,
  LOG_LEVEL
} = require('./constants.js')
// The mediatorConfig file contains some basic configuration settings about the mediator
// as well as details about the default channel setup.
const mediatorConfig = require('./mediatorConfig.json')

const logger = pino({
  level: LOG_LEVEL,
  prettyPrint: true,
  serializers: {
    err: pino.stdSerializers.err
  }
})

function setUpApp() {
  const app = express()

  // Any request regardless of request type or url path to the mediator port will be caught here
  // and trigger the Hello World response.
  app.all('*', async (req, res) => {
    res.send('Hello World')
  })
  return app
}

// The config details here are used to authenticate and register the mediator with the OpenHIM instance
const openHimConfig = {
  username: OPENHIM_USERNAME,
  password: OPENHIM_PASSWORD,
  apiURL: OPENHIM_API_URL,
  trustSelfSigned: OPENHIM_TRUST_SELF_SIGNED
}

function start(callback) {
  // Enabling self-signed certificates is required for working in the development environment.
  // Valid SSL can be setup for a production system.
  if (OPENHIM_TRUST_SELF_SIGNED) {
    logger.warn('Disabled TLS Authentication!!')
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }

  // The purpose of registering the mediator is to allow easy communication between the mediator and the OpenHIM.
  // The details received by the OpenHIM will allow quick channel setup which will allow tracking of requests from
  // the client through any number of mediators involved and all the responses along the way(if the mediators are
  // properly configured). Moreover, if the request fails for any reason all the details are recorded and it can
  // be replayed at a later date to prevent data loss.
  mediatorUtils.registerMediator(openHimConfig, mediatorConfig, err => {
    if (err) {
      logger.error('Failed to register mediator. Check your Config...')
      logger.error(err)
      process.exit(1)
    }
    openHimConfig.urn = mediatorConfig.urn
    // Fetching config from the OpenHIM is a useful feature as mediator details can be updated from the OpenHIM console
    // without having to ssh onto the server or restart the service. This reduces dev requirements and service downtime.
    mediatorUtils.fetchConfig(openHimConfig, (err, newConfig) => {
      if (err) {
        logger.error('Failed to fetch initial config')
        logger.error(err)
        process.exit(1)
      }

      logger.info(`Received new config: ${JSON.stringify(newConfig)}`)

      logger.info('Successfully registered mediator!')

      let app = setUpApp()
      const server = app.listen(MEDIATOR_PORT, () => {
        if (MEDIATOR_HEARTBEAT) {
          // The mediator heartbeat is a post request sent from the mediator to the OpenHIM core on a set interval that
          // lets the core know that the mediator is up and running. This can be useful for first line support and
          // diagnosing issues.
          mediatorUtils.activateHeartbeat(openHimConfig)
        }
        callback(server)
      })
    })
  })
}

start(() => logger.info(`Listening on port ${MEDIATOR_PORT}...`))
