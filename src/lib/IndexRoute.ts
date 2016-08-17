import * as XRegExp from 'xregexp';
import RouteRequirement, { Assertion } from "./RouteRequirement";
import RouteParser from "./RouteParser";
import RouteStringifier from "./RouteStringifier";
import GroupName from "./GroupName";
import IRouteTranslator from "./locale/IRouteTranslator";
import RouteValue from "./RouteValue";
import AbstractRoute from "./AbstractRoute";

export default class IndexRoute extends AbstractRoute
{
	constructor()
	{
		super('', '_index');
	}

	public update():void
	{
	}

	public isMatch(pathname:string):any
	{
		return true;
	}

	public assemble(params?:{[param:string]: any;}):Promise<string>
	{
		return Promise.resolve('');
	}

	public getMatch():string
	{
		return '';
	}
}
