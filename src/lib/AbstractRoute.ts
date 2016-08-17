import { Promise } from "es6-promise";

import RouteRequirement, { Assertion } from "./RouteRequirement";
import RouteParser from "./RouteParser";
import RouteStringifier from "./RouteStringifier";
import GroupName from "./GroupName";
import IRouteTranslator from "./locale/IRouteTranslator";
import RouteValue from "./RouteValue";
import IRoute from "./IRoute";

/**
 * It's nice for a Rout to be standalone, if stuff passed in constructor is all we need.
 * However, there might be some stuff we want to define 'globally' once, like:
 * - translator (where to get the route translations from (confirms to interface)
 * - prefix (could also be solved via child routes
 * - popups (see below!, OR could be util function, needs 'clone' the current route and to the pattern + other configs)
 * - default param validations, so you don't have to pass them over and over again, this will be copied over on route creation
 *
 * Also, if we are going to properly implement child routes, how are we going to manage popups?
 * Could it be as simple as a last step, appending the 'popup tree' as child routes to all 'leafs' in the route tree?
 * No need for appending/copying over properties
 *
 * How to do child route matching?
 * Normal routes are exact matches (ending with $ in regexp)
 * But parent routes should be 'open ended' because they only have to match the beginning
 * - this means changing the regexp when child routes are 'updated'
 * After matching the parent route, we trim that part of the route, and pass it to the children
 * - do this recursively
 * - if no children match, the parent is also invalid, because we couldn't make an exact match
 * We could add a child route (at last position) with * pattern, that acts as a not-found/catch-all at that level
 * - currently we don't support * as a pattern, because it's not named (i.e. not a capturing group)
 * - can we add * as a pattern that expands to .*
 *
 * Parse should supply all matched parameters, also from parents
 */

abstract class AbstractRoute implements IRoute
{
	public name:string;

	protected _routes:Array<IRoute> = [];
	protected _parent:IRoute;

	protected _pattern:string;
	protected _groupNames:Array<GroupName> = [];

	protected _requirements:{[key:string]: RouteRequirement;} = {};
	protected _defaults:{[key:string]: RouteValue;} = {};
	protected _parsers:{[key:string]: RouteParser;} = {};
	protected _stringifiers:{[key:string]: RouteStringifier;} = {};

	constructor(pattern:string, name:string)
	{
		this._pattern = pattern;
		this.name = name;
	}

	public setName(name:string):void
	{
		this.name = name;
	}

	public setParent(route:IRoute):void
	{
		this._parent = route;
	}

	/**
	 * Clears the internal regexp so the next time it's needed it will be refreshed
	 */
	public abstract update():void

	/**
	 * Asserts a param by executing a regular expression or a custom check on
	 * the value. If one of the assertions fails, this route will not match when
	 * resolving a route.
	 *
	 * ```
	 * new Route('/profile/:id')
	 *     .assert(Param.ID, '^\\d+$');
	 *
	 * new Route('/profile/:id')
	 *     .assert(Param.ID, /^\d+$/i);
	 *
	 * new Route('/profile/:id')
	 *     .assert(Param.ID, (id) =>
	 *     {
	 *         return !!UserModel.getById(id);
	 *     });
	 * ```
	 *
	 * When using the same assertions for multiple routes, you can use Gaia.router.config().assert() to setup default
	 * assertions.
	 *
	 * Logs a warning when:
	 * - you forget the ^ at the beginning of your match
	 * - you forget the $ at the end of your match
	 * - you use the 'global' flag in the regular expression (this will cause each 2nd match to fail)
	 *
	 * TODO: At the moment the assertion is only ran when resolving a route, not when assembling it.
	 * TODO: So if you pass a incorrect deeplink value to Gaia.api.goto() and reload the page, the current route will fail to match.
	 *
	 * @param name
	 *
	 * @param assertion
	 * Can either be a string (that will be converted to a RegExp), a RegExp itself, or a custom function that should
	 * return a boolean.
	 *
	 * @param setDefaultAfterFail
	 * When set to true, if the assertion fails it will try to set the default value when available. If there is no
	 * default value the route will not match.
	 */
	public assert(name:string, assertion:Assertion, setDefaultAfterFail:boolean = false):this
	{
		this._requirements[name] = new RouteRequirement(name, assertion, setDefaultAfterFail);

		return this;
	}

	// TODO: should value be used before or after parse?
	// if before, values should always pass a string as default value, to make
	// parsing consistent with values from the actual route
	// if after, values can also contain 'parsed' objects

	/**
	 * Sets a default value for the param. Setting a value also makes the param optional.
	 * ```
	 * new Route('/:locale/home')
	 *     .value(Param.LOCALE, 'en_US');
	 * ```
	 *
	 * The type of the default value is always a string to match the output of a normal match.
	 * You can use parse() to convert a matched param to a different type.
	 *
	 * The default value is set after the assert() is executed, so it's your own responsibility that your code can
	 * handle a possible different type of value.
	 *
	 * @param name The name of the parameter
	 * @param value Sets the default for this parameter
	 *
 	 * @param useForAssemble
	 * When set to true, it will use this value when assembling the route and no value for this parameter is passed
	 */
	public value(name:string, value:string, useForAssemble:boolean = false):this
	{
		this._defaults[name] = new RouteValue(name, value, useForAssemble);

		this.update();

		return this;
	}

	/**
	 * Parses the parameter value from the URL to something you can use in your
	 * application, so that you don't have to repeat this in the places you use
	 * this value.
	 *
	 * ```
	 * // base64 encode and decode your data in the url
	 * new Route('/step1/:data')
	 *     .parse(Param.DATA, btoa);
	 *     .stringify(Param.DATA, atob);
	 *
	 * // parse/stringify the userid from/to an actual User
	 * new Route('/profile/:userId')
	 *     .parse(Param.USER_ID, (userId) =>
	 *     {
     *         return UserModel.getById(userId);
     *     })
	 *     .stringify(Param.USER_ID, (userId) =>
	 *     {
     *         return typeof userId === 'object' ? userId.id : userId;
	 *     });
	 * ```
	 *
	 * @param name
	 * The name of the parameter
	 * @param parser
	 * The function that will be called to parse the value from the URL to a
	 * usable value in your application. Use the {stringify} method to configure
	 * the code to put that value back in the url.
	 */

	public parse(name:string, parser:(param:string) => any):this
	{
		this._parsers[name] = new RouteParser(name, parser);

		return this;
	}

	/**
	 * Stringifies the value passed in goto() to a string that can be used in
	 * the URL, so that you don't have to repeat this in the places you provide
	 * this value.
	 *
	 * ```
	 * // base64 encode and decode your data in the url
	 * new Route('/step1/:data')
	 *     .parse(Param.DATA, btoa);
	 *     .stringify(Param.DATA, atob);
	 *
	 * // parse/stringify the userid from/to an actual User
	 * new Route('/profile/:userId')
	 *     .parse(Param.USER_ID, (userId) =>
	 *     {
     *         return UserModel.getById(userId);
     *     })
	 *     .stringify(Param.USER_ID, (userId) =>
	 *     {
     *         return typeof userId === 'object' ? userId.id : userId;
	 *     });
	 * ```
	 *
	 * @param name The name of the parameter
	 * @param stringifier The function that will be called to stingify the value
	 *                    passed to goto() to a usable value in the url. Use the
	 *                    {parse} method to configure the code to convert the
	 *                    url value back.
	 */
	public stringify(name:string, stringifier:(param:any) => string):this
	{
		this._stringifiers[name] = new RouteStringifier(name, stringifier);

		return this;
	}

	public addChildren(routes:Array<IRoute>):this
	{
		routes.forEach(route =>
			this.addChildRoute(route)
		);

		return this;
	}

	public addChildRoute(route:IRoute):this
	{
		// TODO:
		// - set configured params / asserts / stringifiers / parsers / values

		this._routes.push(route);
		route.setParent(this);

		this.update();

		return this;
	}

	public assertParam(param:string, value:any):boolean
	{
		var success = !(param in this._requirements) || (param in this._requirements && this._requirements[param].assert(value));

		if (DEBUG)
		{
			if (!success)
			{
				if (param in this._requirements)
				{
					console.info('assertion failed for param "' + param + '" failed on requirement "' + this._requirements[param].assertion.toString() + '" - value: ' + value);
				}
			}
		}

		return success;
	}

	protected resolveParams(matches:{[key:string]: string;}, translator?:IRouteTranslator):{[key:string]: string;}
	{
		const params = <any>{};

		for (let i = 0; i < this._groupNames.length; i++)
		{
			let groupName = this._groupNames[i].name;
			let groupMatch = matches[groupName];


			// assert value
			if (groupMatch)
			{
				// get key from translation
				groupMatch = translator && this._groupNames[i].translated ? translator.getKey(groupMatch) : groupMatch;

				if (!this.assertParam(groupName, groupMatch))
				{
					// if failed, set to default if we have one
					if (groupName in this._defaults && groupName in this._requirements && this._requirements[groupName].setDefaultAfterFail)
					{
						groupMatch = this._defaults[groupName].value;
					}
					else
					{
						return null;
					}
				}
			}
			// check default
			else if (groupName in this._defaults)
			{
				groupMatch = this._defaults[groupName].value;
			}

			// parse value
			if (groupMatch)
			{
				if (groupName in this._parsers)
				{
					groupMatch = this._parsers[groupName].parser.call(null, groupMatch);
				}
			}

			params[groupName] = groupMatch;
		}

		return params;
	}

	/**
	 * Checks if the passed url matches this route. Executes the assertions and
	 * optionally sets the default value.
	 */
	public abstract isMatch(pathname:string):any

	public abstract assemble(params?:{[param:string]: any;}):Promise<string>

	public abstract getMatch():string

	public getPattern():string
	{
		return this._pattern;
	}

	public getParams():any
	{
		return {};
	}

	public getChildren():Array<IRoute>
	{
		return this._routes;
	}

	public getRouteByName(name:string):IRoute
	{
		if (this.name == name)
		{
			return this;
		}

		const match = this._routes
			.map(route => route.getRouteByName(name))
			.find(route => !!route)

		return match || null;
	}

	public getGroupNames():Array<GroupName>
	{
		return this._groupNames;
	}

	public getGroupName(name:string):GroupName
	{
		for (var i = 0; i < this._groupNames.length; i++)
		{
			var group = this._groupNames[i];
			if (group.name == name) return group;
		}

		return null;
	}
}

export default AbstractRoute;
