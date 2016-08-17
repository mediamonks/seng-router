import * as XRegExp from 'xregexp';
import { Promise } from "es6-promise";

import RouteRequirement, { Assertion } from "./RouteRequirement";
import RouteParser from "./RouteParser";
import RouteStringifier from "./RouteStringifier";
import GroupName from "./GroupName";
import IRouteTranslator from "./locale/IRouteTranslator";
import RouteValue from "./RouteValue";
import AbstractRoute from "./AbstractRoute";

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

export default class Route extends AbstractRoute
{
	private _regExp:any;
	private _regExpRoute:string;
	private _regExpRouteTranslated:string;
	private _params:{[key:string]: any;} = {};

	private _translator:IRouteTranslator;

	private _spec:string;
	private _match:any; // regexp match

	constructor(pattern:string, name?:string)
	{
		super(pattern, name);
	}

	/**
	 * Clears the internal regexp so the next time it's needed it will be refreshed
	 */
	public update():void
	{
		this._regExp = null;
	}

	/**
	 * Provide a spec for assembling the route with provided parameters.
	 * This is used when the pattern is a (custom) regular expression.
	 */
	public spec(spec:string):this
	{
		this._spec = spec;

		return this;
	}

	public setTranslator(translator: IRouteTranslator):this
	{
		this._translator = translator;

		return this;
	}

	public addChildRoute(route:this):this
	{
		if (this._translator)
		{
			route.setTranslator(this._translator);
		}

		super.addChildRoute(route);

		return this;
	}

	/**
	 * TODO allow for optional groups outside of the param boundary
	 * e.g. now it's only possible to make slug optional, but bar should also be
	 * omitted when slug is optional:
	 *      /foo/:id/bar/:slug?
	 * Better would be to have a syntax like React Router
	 *      /foo/:id(/bar/:slug)
	 * If we could wrap that in a simple ()? in the regexp, we should be done
	 */
	private updateRegExp():RegExp
	{
		if (!this._regExp)
		{
			var groupNameObj:any = {};
			this._groupNames = [];

			if (this._pattern == '*')
			{
				this._regExpRoute = '.*';
				this._regExp = XRegExp(/.*/);

				return this._regExp;
			}

			var route = this._pattern
				.replace(/\(.*\)/gi,
					(substring:string) =>
				{
					return substring + '?';
				})
				.replace(/\/:(@?)([a-z][a-z0-9]+)([?*])?/gi,
					(substring:string, translated:string, groupName:string, modifier:string) =>
				{
					var replacement = '';
					groupNameObj[groupName] = {
						translated: translated == '@'
					};

					if (modifier == '*')
					{
						// actually it's non-greedy, but we do match behind the next segment
						groupNameObj[groupName].greedy = true;
						replacement = '(?:\/(?<' + groupName + '>.*?))';
					}
					else if (modifier == '?' || groupName in this._defaults)
					{
						groupNameObj[groupName].optional = true;
						replacement = '(?:\/(?<' + groupName + '>[^\/]+))?';
					}
					else
					{
						replacement = '(?:\/(?<' + groupName + '>[^\/]+))';
					}

					return replacement;
				});

			this._regExpRoute = route;

			// console.log('this._regExpRoute', this._regExpRoute);

			this._regExp = XRegExp('^' + this._regExpRoute + (this._routes.length ? '' : '\/?$'), 'i');
			var names = this._regExp.xregexp.captureNames ? this._regExp.xregexp.captureNames.concat() : [];

			// console.log('this._regExp', this._regExp.xregexp);

			// TODO
			// if (!ArrayUtils.isUnique(this._regExp.xregexp.captureNames))
			// {
			// 	console.error('Route "' + this._pattern + '" has duplicate params: ', this._regExp.xregexp.captureNames);
			// }

			for (var i = 0; i < names.length; i++)
			{
				var name = names[i];

				if (name)
				{
					this._groupNames.push({
						name: name,
						optional: groupNameObj[name] ? groupNameObj[name].optional : false,
						greedy: groupNameObj[name] ? groupNameObj[name].greedy : false,
						translated: groupNameObj[name] ? groupNameObj[name].translated : false
					});
				}
				else
				{
					if (DEBUG)
					{
						console.warn('ignoring unnamed group in route "' + this._pattern + '"');
					}
				}
			}
		}

		return this._translator ? this.updateRegExpWithTranslations() : this._regExp;
	}

	private updateRegExpWithTranslations():RegExp
	{
		// replace translation keys with actual translations
		const route = this._regExpRoute['replace'](/\/@([a-z]+)/gi, (substring:string, key:string) =>
		{
			return '/' + (this._translator ? this._translator.getValue(key) : key);
		});

		this._regExpRouteTranslated = route;

		this._regExp = XRegExp('^' + this._regExpRouteTranslated + (this._routes.length ? '' : '\/?$'), 'i');

		return this._regExp;
	}

	/**
	 * Checks if the passed url matches this route. Executes the assertions and
	 * optionally sets the default value.
	 */
	public isMatch(pathname:string):boolean
	{
		// pathless route
		if (!this._pattern)
		{
			return true;
		}

		this._match = XRegExp['exec'](pathname, this.updateRegExp());

		if (!this._match)
		{
			return false;
		}

		const params = this.resolveParams(this._match, this._translator);

		if (!params)
		{
			return false;
		}

		this._params = params;
		return true;
	}

	public assertParam(param:string, value:any):boolean
	{
		this.updateRegExp();

		return super.assertParam(param, value);
	}

	public assemble(params?:{[param:string]: any;}):Promise<string>
	{
		//if (DEBUG) console.log('[GaiaRoute] assemble: ', params);

		// first, assemble parents
		const parentPath = this._parent && this._parent.assemble(params) || Promise.resolve('');

		// TODO: move to regexp route ??
		// if (this._spec)
		// {
		// 	return this._spec['replace'](/\/\{([^}]+)\}/gi, (result, groupName) =>
		// 	{
		// 		// parts incl starting '/' that gets removed when part is optional
		//
		// 		if (params.hasOwnProperty(groupName))
		// 		{
		// 			return '/' + params[groupName];
		// 		}
		// 		else
		// 		{
		// 			if (this.getGroupName(groupName) && !this.getGroupName(groupName).optional)
		// 			{
		// 				console.error('spec: missing "' + groupName + '" from params object ' + JSON.stringify(params) + ' in route ' + this._route);
		// 			}
		// 			return '';
		// 		}
		// 	})['replace'](/\{([^}]+)\}/gi, (result, groupName) =>
		// 	{
		// 		// parts excl starting '/'
		// 		if (params.hasOwnProperty(groupName))
		// 		{
		// 			return params[groupName];
		// 		}
		// 		else
		// 		{
		// 			if (this.getGroupName(groupName) && !this.getGroupName(groupName).optional)
		// 			{
		// 				console.error('spec: missing "' + groupName + '" from params object ' + JSON.stringify(params) + ' in route ' + this._route);
		// 			}
		// 			return '';
		// 		}
		// 	});
		// }

		return new Promise((resolve: (result: any) => void, reject: (error: any) => void) =>
		{
			try
			{
				// find al parameter to replace them with actual values
				let result = !this._pattern ? '' : this._pattern
					.replace(/\/:(@?)([a-z][a-z0-9]+)([\?\*])?/gi, (substring:string, translated:string, groupName:string, modifier:string) =>
					{
						var value:any;

						// get the value from the params for this parameter
						const paramsValue = params && params.hasOwnProperty(groupName) && params[groupName];

						// so assert check on the provided params value
						if (!this.assertParam(groupName, paramsValue))
						{
							// if we allow the assert to switch to the default value, and the default value allows using it in assemble phase, use ut
							if (groupName in this._defaults && this._defaults[groupName].useForAssemble && groupName in this._requirements && this._requirements[groupName].setDefaultAfterFail)
							{
								value = this._defaults[groupName].value;
							}
							else
							{
								console.error(`route: failed assertion for param "${groupName}" with value "${paramsValue}" in route ${this._pattern}`);
								return '';
							}
						}

						// if previous step didn't do anything
						if (!value)
						{
							if (this.getGroupName(groupName).optional)
							{
								// if a property is provided in the params object
								if (params && params.hasOwnProperty(groupName))
								{
									value = params[groupName];
								}
								// if we have a default value for this property
								else if (groupName in this._defaults && this._defaults[groupName].useForAssemble)
								{
									value = this._defaults[groupName].value;
								}
								// we don't have any value for this groupName
								else
								{
									return '';
								}
							}
							else
							{
								if (params && params.hasOwnProperty(groupName))
								{
									value = params[groupName];
								}
								else
								{
									console.error(`route: missing "${groupName}" from params object ${JSON.stringify(params)} in route ${this._pattern}`);
									return '';
								}
							}
						}

						// turn the passed value into a string
						if (groupName in this._stringifiers)
						{
							value = this._stringifiers[groupName].stringifier.call(null, value);
						}

						// translate the parameter
						if (this._translator && this.getGroupName(groupName).translated)
						{
							value = this._translator.getValue(value);
						}

						return '/' + value;

					});

				if (this._translator && result)
				{
					// translate the route segments
					result = result
						.replace(/\/@([a-z]+)/gi, (substring:string, key:string) =>
						{
							return '/' + (this._translator ? this._translator.getValue(key) : key);
						});
				}

				parentPath.then(parent =>
				{
					resolve(parent + result);
				})
			}
			catch (error)
			{
				console.error(error.message);
				reject(error);
			}
		});
	}

	public getMatch():string
	{
		return this._match && this._match[0] || '';
	}

	public getParams():any
	{
		return this._params;
	}

	public getGroupNames():Array<GroupName>
	{
		this.updateRegExp();

		return super.getGroupNames();
	}

	public getGroupName(name:string):GroupName
	{
		this.updateRegExp();

		return super.getGroupName(name);
	}
}
