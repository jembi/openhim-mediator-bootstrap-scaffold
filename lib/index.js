#!/usr/bin/env node
'use strict'

const express = require('express')
const mediatorUtils = require('openhim-mediator-utils')

const {
    MEDIATOR_PORT,
    REGISTER_MEDIATOR,
    OPENHIM_USERNAME,
    OPENHIM_PASSWORD,
    OPENHIM_API_URL,
    OPENHIM_TRUST_SELF_SIGNED
} = require('./constants.js')
const mediatorConfig = require('../mediatorConfig.json')

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
                console.error(err)
                process.exit(1)
            }
        })
    }
    let app = setUpApp()
    const server = app.listen(MEDIATOR_PORT, () => {callback(server)})
}

start(() => console.log(`Listening on port ${MEDIATOR_PORT}...`))
