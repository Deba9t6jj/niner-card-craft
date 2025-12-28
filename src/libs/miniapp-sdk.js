// src/libs/miniapp-sdk.js
const sdk = {
  actions: {
    ready: async () => {
      console.log('MiniApp SDK ready() called');
      // This is the Base mini app SDK function
      // It tells the Base app to hide the loading screen
      if (typeof window !== 'undefined' && window.parent) {
        try {
          window.parent.postMessage({
            type: 'farcaster:ready',
            data: {}
          }, '*');
        } catch (error) {
          console.log('SDK ready error:', error);
        }
      }
    }
  },
  // Other SDK functions can be added here
  context: {
    getUser: async () => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined') {
          window.addEventListener('message', (event) => {
            if (event.data.type === 'farcaster:user') {
              resolve(event.data.data);
            }
          });
        }
      });
    }
  }
};

export { sdk };