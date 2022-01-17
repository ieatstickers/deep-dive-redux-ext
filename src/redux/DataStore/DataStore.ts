import {Unsubscribe} from "redux";
import {Redux} from "../Redux";
import {Objects} from "phusion/src/Core/Objects/Objects";
import {DataStoreError} from "./DataStoreError";
import {HttpResponse} from "phusion/src/Core/Http/HttpResponse";

export abstract class DataStore
{
	public static readonly key: string = null;

	public static reduce(state: Object, action: Object)
	{
		switch (action)
		{
			default:
				return state;
		}
	}
	
	public static initState(state: Object)
  {
    Redux.dispatch({
      type: 'init_' + this.key,
      data: state
    })
  }
 
	public static subscribe(listener: (state: any) => void): Unsubscribe
	{
		return Redux.subscribe(() => {
			return listener(Redux.getState()[this.key]);
		});
	}
	
	public static getState(): any
  {
    return Redux.getState()[this.key];
  }
 
	public static validate(): boolean
	{
		if (typeof this.key !== 'string')
		{
			throw new Error('Invalid DataStore: ' + this.name + '. Must have property called "key" of type "string"');
		}

		if (typeof this['reduce'] !== 'function')
		{
			throw new Error('Invalid DataStore: ' + this.name + '. Must implement "reduce" method: reduce(state = {}, action)"');
		}

		return true;
	}

	public static createError(httpResponse: HttpResponse)
	{
		let errorMessage = Objects.getByKeyPath('data:error:message', httpResponse);
		let errorInfo = Objects.getByKeyPath('data:error:info', httpResponse);

		let error = new DataStoreError();

		if (!errorMessage)
		{
			errorMessage = 'Oops! Something went wrong. Please try again.';
		}
		error.message = errorMessage;
		error.info = errorInfo;

		return error;
	}
}
