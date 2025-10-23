import process from 'node:process'
import got from 'got'
import 'dotenv/config'

const client = got.extend({
  prefixUrl: `${process.env.EMQX_API}/api/v5`,
  username: process.env.EMQX_API_KEY,
  password: process.env.EMQX_API_SECRET,
  responseType: 'json',
})

export async function clients() {
  const result = await client.get('clients', {
    searchParams: {
      conn_state: 'connected',
    },
  })
  return result.body.data
    .map(client => client.clientid)
    .filter(clientid => clientid.startsWith('FMO-'))
    .map(clientid => clientid.split('-')[1])
    .filter(clientid => !!clientid)
}

export async function count() {
  const result = await client.get('sessions_count')
  const count = Number.parseInt(result.body)
  return Number.isNaN(count) ? 0 : count
}
