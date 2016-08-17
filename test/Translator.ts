import IRouteTranslator from "../src/lib/locale/IRouteTranslator";

export default class Translator implements IRouteTranslator
{
	private _keys:any = {};
	private _values:any = {};
	private _locale:string;

	constructor(map:{[key:string]: string;})
	{
		this._keys = map;

		for (var i in this._keys)
		{
			if (this._keys.hasOwnProperty(i))
			{
				this._values[this._keys[i]] = i;
			}
		}
	}

	getValue(key:string):string
	{
		return this._keys[key];
	}

	getKey(value:string):string
	{
		return this._values[value];
	}


	updateLocale(params: {}, done: ()=>void): void
	{
		// TODO: support multiple locales in this Mock
		this._locale = params['locale'];

		done();
	}
}
