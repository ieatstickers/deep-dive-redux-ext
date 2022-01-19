
import {
  combineReducers,
  createStore,
  Action,
  Store,
  Unsubscribe,
  AnyAction
} from 'redux';
import initSubscriber from 'redux-subscriber';

import { reduxBatch }  from '@manaflair/redux-batch';

declare const chrome;

export class Redux
{
  public static readonly CLEAR_ALL_DATA = 'clear_all_data';
  protected static dataStores: Object = {};
  protected static subscriber: any;
  protected static store: Store;
  protected static readOnly: boolean = false;
  protected static onDispatchListeners = {};
  
  public static init(initialState?: Object, readOnly: boolean = true)
  {
    this.readOnly = readOnly;
    // Create Redux store
    this.createStore(initialState);
    this.setupListeners()
  }
  
  private static setupListeners()
  {
    if (this.readOnly)
    {
      // When background sends updated state, update this instance of redux
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.channel === 'redux:updated')
        {
          console.log('4. Updated state received from background', message.data)
          for (const key in this.dataStores)
          {
            this.dataStores[key].initState(message.data[key]);
          }
        }
      })
    }
  }
  
  public static registerDataStore(key: string, dataStore: any)
  {
    this.dataStores[key] = dataStore;
  }
  
  public static createStore(initialState?: any)
  {
    let reducers = {};
    
    for (let key in this.dataStores)
      if (this.dataStores.hasOwnProperty(key))
      {
        let dataStore = this.dataStores[key];
        reducers[dataStore.key] = dataStore.reduce;
      }
    
    let reducerCount = Object.keys(reducers).length;
    
    if (!reducerCount)
    {
      throw new Error('Cannot create Redux store - no reducers added. Use Redux.registerDataStore()');
    }
    
    let appReducer = combineReducers(reducers);
    
    let rootReducer = (state, action: { type: string, value: any }) => {
      
      if (action.type == Redux.CLEAR_ALL_DATA)
      {
        state = undefined;
      }
      
      return appReducer(state, action)
    }
    
    this.store = createStore(rootReducer, initialState, reduxBatch);
  }
  
  public static dispatch(...actions: Array<AnyAction>): Action<any>
  {
    const actionsByType = actions.reduce(
      (result, action, key, actions) => {
        
        // Read only instance can only dispatch actions whose type starts with 'init_'
        // All other actions must be sent to the write instance to be dispatched
        if (this.readOnly && action.type.indexOf('init_') === 0)
        {
          result.init.push(action);
        }
        else
        {
          result.other.push(action);
        }
        
        return result;
      },
      {
        init: [],
        other: []
      }
    );
    
    // If this is a read only instance and there are actions other than init ones
    if (this.readOnly && actionsByType.other.length)
    {
      // Send them to the background script
      console.log('1. Sending dispatch request to background', actionsByType.other);
    
      chrome.runtime.sendMessage({
        channel: 'redux:dispatch',
        data: actionsByType.other
      })
    }
  
    if (!this.store)
    {
      throw new Error('Cannot dispatch Redux action - Redux store has not been created. Use Redux.createStore()');
    }
    
    const actionsToDispatch = this.readOnly ? actionsByType.init : actionsByType.other;
    
    if (!actionsToDispatch.length)
    {
      return;
    }
    
    // Dispatch action
    // @ts-ignore
    const dispatchResponse = this.store.dispatch(actionsToDispatch);
    
    // Get all dispatch listeners
    const dispatchListeners = this.onDispatchListeners;
    
    // For each listener
    for (let key in dispatchListeners)
      if (dispatchListeners.hasOwnProperty(key))
      {
        // Call listener
        dispatchListeners[key](actions);
      }
    
    // Return dispatch response
    return dispatchResponse;
  }
  
  
  public static getState(): any
  {
    if (!this.store)
    {
      throw new Error('Cannot getUser Redux state - Redux store has not been created. Use Redux.createStore()');
    }
    
    return this.store.getState();
  }
  
  public static subscribe(listener: () => void): Unsubscribe
  {
    if (!this.store)
    {
      throw new Error('Cannot subscribe to Redux store - store has not been created. Use Redux.createStore()');
    }
    
    return this.store.subscribe(listener);
  }
  
  public static subscribeByKeyPath(keyPath: string, listener: (state: any) => void): Unsubscribe
  {
    if (!this.store)
    {
      throw new Error('Cannot subscribe to Redux store - store has not been created. Use Redux.createStore()');
    }
    
    if (!this.subscriber)
    {
      this.subscriber = {subscribe: initSubscriber(this.store)};
    }
    
    // store is THE redux store
    return this.subscriber.subscribe(keyPath, listener);
  }
  
}
