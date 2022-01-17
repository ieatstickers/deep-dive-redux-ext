import { LocalStorage } from "phusion/src/Core/Storage/LocalStorage";
import React from "react";
import * as ReactDOM from "react-dom";
import { PopupApp } from "./component/PopupApp";
import { CounterDataStore } from "./data/CounterDataStore";
import { ListDataStore } from "./data/ListDataStore";
import { Redux } from "./redux/Redux";

// Get initial redux state from local storage
const initialState = LocalStorage.get('persisted_state') || undefined;

// Register data stores
Redux.registerDataStore(CounterDataStore.key, CounterDataStore);
Redux.registerDataStore(ListDataStore.key, ListDataStore);

// Init redux
Redux.init(initialState, false);

ReactDOM.render(
  <PopupApp/>,
  document.querySelector('#root')
);
