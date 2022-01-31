import { AnyAction } from "redux";
import { CounterDataStore } from "./data/CounterDataStore";
import { ListDataStore } from "./data/ListDataStore";
import { Redux } from "./redux/Redux";
import { LocalStorage } from "phusion/src/Core/Storage/LocalStorage";
declare const chrome;

/**
 * Redux
 */

// Get initial redux state from local storage
const initialState = LocalStorage.get('persisted_state') || undefined;

// Register data stores
Redux.registerDataStore(CounterDataStore.key, CounterDataStore);
Redux.registerDataStore(ListDataStore.key, ListDataStore);

// Init redux
Redux.init(initialState, false);

// When redux state changes
Redux.subscribe(() => {
  // Store latest state in local storage
  LocalStorage.set('persisted_state', Redux.getState());
  
  console.log('3. Redux state updated. Sending updated state to read only instances:', Redux.getState());
  
  // When redux state changes in background context, send it out to all other contexts that are listening
  chrome.runtime.sendMessage({
    channel: 'redux:updated',
    data: Redux.getState()
  })
})

// When we receive a redux:dispatch message, dispatch it in this context
chrome.runtime.onMessage.addListener((message) => {
  if (message.channel === 'redux:dispatch')
  {
    console.log('2. Dispatch request received:', message.data);
    Redux.dispatch(...message.data);
  }
})

/**
 * Redux Async Queue
 */

// Get queue from local storage (should usually be empty but will contain any actions that didn't get a chance to dispatch before browser was last closed)
const initialQueue = LocalStorage.get('redux:dispatch_queue');

if (initialQueue)
{
  Redux.setDispatchQueue(initialQueue);
}

// Setup interval
setInterval(() => {
  
  // Get the full dispatch queue
  const queue = Redux.getDispatchQueue();
  
  // Clear the queue on the Redux class
  Redux.clearDispatchQueue();
  
  // Remove async flag from all actions so when we dispatch them this time, they get dispatched on the spot and aren't added to the queue again
  const actionsToDispatch: Array<AnyAction> = queue.map((action) => {
    action.async = false;
    return action;
  });
  
  // Dispatch actions
  Redux.dispatch(...actionsToDispatch);
}, 30000);
