import { Promise } from "es6-promise";

import {Assertion} from "./RouteRequirement";
import GroupName from "./GroupName";

interface IRoute
{
	name:string;

	setName(name:string):void;
	setParent(route:IRoute):void;

	update():void;

	assert(name:string, assertion:Assertion, setDefaultAfterFail:boolean):this;
	value(name:string, value:string, useForAssemble:boolean):this;
	parse(name:string, parser:(param:string) => any):this;
	stringify(name:string, stringifier:(param:any) => string):this;

	addChildren(routes:Array<IRoute>):this
	addChildRoute(route:IRoute):this

	assertParam(param:string, value:any):boolean;

	isMatch(pathname:string):boolean;
	assemble(params?:{[param:string]: any;}):Promise<string>
	getMatch():string;
	getPattern():string
	getParams():any

	getChildren():Array<IRoute>;
	getRouteByName(name:string):IRoute;

	getGroupNames():Array<GroupName>;
	getGroupName(name:string):GroupName;

}

export default IRoute;
