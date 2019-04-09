const MESG = require('mesg-js').application()

const UTXO_SERVICE = 'utxo'
const CONTRACT_SERVICE = 'ethereum-contract'
const AGGREGATOR_SERVICE = 'aggregator'
const PLASMA_ENCODER_SERVICE = 'plasma-encoder'

MESG.listenEvent({
  serviceID: CONTRACT_SERVICE,
  eventFilter: 'event'
})
  .on('data', async data => {
    const { type, event } = data.eventData
    if (type !== 'deposit') return
    const res = await MESG.executeTaskAndWaitResult({
      serviceID: UTXO_SERVICE,
      taskKey: 'appendUTXO',
      inputData: {
        from: event.from,
        to: event.to,
        amount: event.amount
      }
    })
    console.log(res.outputKey, res.outputData)
  })

MESG.listenEvent({
  serviceID: UTXO_SERVICE,
  eventFilter: 'utxoCreated'
})
  .on('data', async data => {
    const res = await MESG.executeTaskAndWaitResult({
      serviceID: AGGREGATOR_SERVICE,
      taskKey: 'add',
      inputData: data
    })
    console.log(res.outputKey, res.outputData)
  })

MESG.listenEvent({
  serviceID: AGGREGATOR_SERVICE,
  eventFilter: 'newBlock'
})
  .on('data', async data => {
    // Encode block information to be send to plasma smart contract
    const block = await MESG.executeTaskAndWaitResult({
      serviceID: PLASMA_ENCODER_SERVICE,
      taskKey: 'block',
      inputData: data
    })
    if (block.outputKey !== 'success') throw new Error(block)

    // Send block to plasma smart contract
    const submit = await MESG.executeTaskAndWaitResult({
      serviceID: CONTRACT_SERVICE,
      taskKey: 'submitBlock',
      inputData: {
        hash: block.hash
      }
    })

    console.log(submit.outputKey, submit.outputData)
  })
