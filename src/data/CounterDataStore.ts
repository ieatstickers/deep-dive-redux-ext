import { Objects } from "phusion/src/Core/Objects/Objects";
import { Unsubscribe } from "redux";
import { DataStore } from "../redux/DataStore/DataStore";
import { Redux } from "../redux/Redux";

export class CounterDataStore extends DataStore
{
  public static readonly key: string = 'counter';
  
  public static reduce(state = { value: 0 }, action: { type: string, data: any })
  {
    switch (action.type) {
      case 'counter/incremented':
        return { value: state.value + 1 }
      case 'counter/decremented':
        return { value: state.value - 1 }
      case 'init_counter':
        return action.data
      default:
        return state
    }
  }
  
  public static increment()
  {
    Redux.dispatch({ type: 'counter/incremented', async: true });
  }

  public static incrementByTwo()
  {
    Redux.dispatch({ type: 'counter/incremented' }, { type: 'counter/incremented' })
  }
  
  public static decrement()
  {
    Redux.dispatch({ type: 'counter/decremented' })
  }
  
  public static decrementByTwo()
  {
    Redux.dispatch({ type: 'counter/decremented' }, { type: 'counter/decremented' })
  }
  
  public static getValue(): number
  {
    return Number(Objects.getByKeyPath('value', this.getState()));
  }
  
  public static subscribeToValue(
    subscriber: (value: number) => void,
    currentValue: number = null
  ): Unsubscribe
  {
    return this.subscribe(() => {
      const newValue = this.getValue();
      
      if (newValue !== currentValue)
      {
        currentValue = newValue;
        
        subscriber(newValue);
      }
    })
  }
}
