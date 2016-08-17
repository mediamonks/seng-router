interface IRouteTranslator
{
	getValue(key:string):string;
	getKey(value:string):string;
	updateLocale(params:{[key:string]: any;}, done:() => void):void;
}

export default IRouteTranslator;
