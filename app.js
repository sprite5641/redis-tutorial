const express = require('express')
const axios = require('axios')
const redis = require('redis')
const {
    promisify
} = require('util')
const client = redis.createClient()
client.on('error', (err) => {
    console.error('redis error ->', err)
})
const getAsync = promisify(client.get).bind(client)
const app = express()
const BASE_URL = 'https://api.github.com/users'
app.get('/', async (req, res) => {
    const username = req.query.username || 'devahoy'

    const cached = await getAsync(username)
    if (cached) {
        return res.json(JSON.parse(cached))
    }
    const url = `${BASE_URL}/${username}`
    const response = await axios.get(url)

    client.setex(username, 60, JSON.stringify(response.data))
    return res.json(response.data)


})
app.listen(9000, () => {
    console.log('app running')
})