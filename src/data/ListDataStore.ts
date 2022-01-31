import { Arrays } from "phusion/src/Core/Arrays/Arrays";
import { Objects } from "phusion/src/Core/Objects/Objects";
import { Unsubscribe } from "redux";
import { DataStore } from "../redux/DataStore/DataStore";
import { Redux } from "../redux/Redux";

export class ListDataStore extends DataStore
{
  public static readonly key: string = 'list';
  
  public static reduce(state = { list: [] }, action: {
    type: string,
    data: any
  })
  {
    switch (action.type)
    {
      case 'list/add': {
        const newList = state.list.concat([action.data]);
        return {
          ...state,
          list: newList
        };
      }
      case 'list/remove': {
        const list = Arrays.clone(state.list);
        list.splice(state.list.length - 1, 1);
        
        return {
          ...state,
          list: list
        }
      }
      case 'init_list':
        return action.data;
      default:
        return state;
    }
  }
  
  public static getList(): Array<string>
  {
    return Objects.getByKeyPath('list', this.getState()) || [];
  }
  
  public static subscribeToList(subscriber: (list: Array<string>) => void, currentValue: Array<string> = null): Unsubscribe
  {
    return this.subscribe(() => {
      const newValue = this.getList();
      
      if (JSON.stringify(newValue) !== JSON.stringify(currentValue))
      {
        currentValue = newValue;
      
        subscriber(newValue);
      }
    })
  }
  
  public static addToList(listItem: string)
  {
    Redux.dispatch({ type: 'list/add', data: listItem, async: true})
  }
  
  public static removeLastItem()
  {
    Redux.dispatch({ type: 'list/remove'})
  }
}
