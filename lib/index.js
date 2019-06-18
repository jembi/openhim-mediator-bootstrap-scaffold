#!/usr/bin/env node
'use strict'

const express = require('express')
const mediatorUtils = require('openhim-mediator-utils')
const pino = require('pino')

const {
    MEDIATOR_PORT,
    REGISTER_MEDIATOR,
    OPENHIM_USERNAME,
    OPENHIM_PASSWORD,
    OPENHIM_API_URL,
    OPENHIM_TRUST_SELF_SIGNED,
    LOG_LEVEL
} = require('./constants.js')
const mediatorConfig = require('../mediatorConfig.json')

const logger = pino({
  level: LOG_LEVEL,
  prettyPrint: true,
  serializers: {
    err: pino.stdSerializers.err
  }
})

function setUpApp() {
    const app = express()

    app.all('*', async (req, res) => {
        res.send('Hello World')
    })
    return app
}

function start(callback) {
    if (REGISTER_MEDIATOR) {
        mediatorUtils.registerMediator({
            username: OPENHIM_USERNAME,
            password: OPENHIM_PASSWORD,
            apiURL: OPENHIM_API_URL,
            trustSelfSigned: OPENHIM_TRUST_SELF_SIGNED
        },
        mediatorConfig,
        err => {
            if (err) {
                logger.error(err)
                process.exit(1)
            }
        })
    }
    let app = setUpApp()
    const server = app.listen(MEDIATOR_PORT, () => {callback(server)})
}

start(() => logger.info(`Listening on port ${MEDIATOR_PORT}...`))
