const liteflow = new (require('@liteflow/service'))()

liteflow.listenTask({
  taskX: require('./tasks/taskX')
})
  .on('error', (error) => console.error(error))

liteflow.emitEvent('started', { x: true })
  .catch((error) => console.error(error))
