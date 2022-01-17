
import * as React from "react";
import { CounterDataStore } from "../data/CounterDataStore";
import { ListDataStore } from "../data/ListDataStore";

export interface PopupAppProps {}

export interface PopupAppState
{
  counterValue: number,
  list: Array<string>
}

export class PopupApp extends React.Component<PopupAppProps, PopupAppState>
{
  public constructor(props: PopupAppProps, state: PopupAppState)
  {
    super(props, state);
    
    this.state = {
      counterValue: CounterDataStore.getValue(),
      list: ListDataStore.getList()
    }
  }
  
  
  public componentDidMount() {
    
    CounterDataStore.subscribeToValue((value) => {
      this.setState({
        counterValue: value
      })
    }, this.state.counterValue)
    
    ListDataStore.subscribeToList((list) => {
      this.setState({
        list: list
      })
    }, this.state.list)
  }
  
  public render()
  {
    return <div>
      <div>
        Counter Value: {this.state.counterValue}
      </div>
      <div>
        List:
        <ul>
          {
            this.state.list.map((item, key) => {
              return <li key={key}>{item}</li>
            })
          }
        </ul>
      </div>
      <div>
        <button onClick={this.increment.bind(this)}>Increment</button>
        <button onClick={this.decrement.bind(this)}>Decrement</button>
      </div>
      <div>
        <button onClick={this.addToList.bind(this)}>Add to list</button>
        <button onClick={this.removeFromList.bind(this)}>Remove from list</button>
      </div>
    </div>
  }
  
  private increment()
  {
    CounterDataStore.increment();
  }
  
  private decrement()
  {
    CounterDataStore.decrement()
  }
  
  private addToList()
  {
    ListDataStore.addToList("a new string");
  }
  
  private removeFromList()
  {
    ListDataStore.removeLastItem();
  }
}
