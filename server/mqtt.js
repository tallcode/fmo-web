import Buffer from 'node:buffer'
import mqtt from 'mqtt'

const MQTT_SERVER = 'mqtt://145.1mhz.cn:1883'
const MQTT_USERNAME = 'web'
const MQTT_PASSWORD = '1111112'

function createMqttClient(topics) {
  const client = mqtt.connect(MQTT_SERVER, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
  })

  client.on('connect', () => {
    topics.forEach((topic) => {
      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`subscribe error: ${topic}`)
          console.error(err)
        }
      })
    })
  })

  function publish(topic, message) {
    client.publish(topic, message)
  }

  function onMessage(callback) {
    client.on('message', callback)
  }

  return {
    publish,
    onMessage,
  }
}

const client = createMqttClient(['FMO/RAW'])
client.onMessage((topic, message) => {
  // eslint-disable-next-line no-console
  console.log(`${topic}: ${Buffer.Buffer.from(message).toString('hex')}`)
})
