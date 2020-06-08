const liteflow = new (require('@liteflow/service'))()

let list = []

liteflow.listenTask({
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
  liteflow.emitEvent('newBlock', {
    list: listToSend
  })
}, process.env.INTERVAL)
