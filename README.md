# Openhim Bootstrap Mediator

A mediator scaffolding to be used for tutorials

## Getting Started

> This mediator requires an accessible OpenHIM core instance before it can successfully start up.

Environment variables:

* OPENHIM_TRUST_SELF_SIGNED
* LOG_LEVEL
* MEDIATOR_PORT
* MEDIATOR_HEARTBEAT
* OPENHIM_API_URL
* OPENHIM_USERNAME
* OPENHIM_PASSWORD
* OPENHIM_TRUST_SELF_SIGNED

### Docker

From the project directory run:

```sh
docker build -t scaffold .

docker run --network {network-name} -p 3000:3000 --name scaffold scaffold
```

The network flag is optional. If connecting to a specific docker network find the network name by running:

```sh
docker network ls
```

Environmental variables can be included using the `-e` flag. For example:

```sh
docker run --network {network-name} -p 3000:3000 --name scaffold -e OPENHIM_TRUST_SELF_SIGNED=true scaffold
```

### NPM

From the project directory run:

```sh
npm install
npm start
```

Environment variable can be included as follows:

```sh
OPENHIM_TRUST_SELF_SIGNED=true OPENHIM_PASSWORD=password npm start
```
