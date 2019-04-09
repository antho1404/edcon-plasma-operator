const mesg = require('mesg-js').service()

let list = []

mesg.listenTask({
  add: ({ data }, { added }) => {
    list = [...list, data]
    return added({
      count: list.length
    })
  }
})
  .on('error', (error) => console.error(error))

setInterval(() => {
  const listToSend = list
  list = []
  mesg.emitEvent('newBlock', {
    list: listToSend
  })
}, process.env.INTERVAL)
