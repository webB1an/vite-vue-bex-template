chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'one-tab-bex-translate')
    return
  // 接收来自newTab页面的消息
  port.onMessage.addListener(({ message }) => {
    // eslint-disable-next-line no-console
    console.log('message from newTab:', message)
  })

  // 向newTab页面发送消息
  port.postMessage({ message: 'hello from background' })
})
