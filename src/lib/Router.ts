import { History, Location } from 'history'
import { Promise } from "es6-promise";

import IRouteTranslator from "./locale/IRouteTranslator";
import matchRoutes from "./matchRoutes";
import Route from "./Route";
import IRouteResult from "./IRouteResult";
import IRoute from "./IRoute";

// TODO: what to do here?
// should we dispatch an event that Gaia can react to?
// How gets gaia the correct information it needs?
// - the components to 'render' (index file, with refs to C, VM and T)
// - how does gaia work with the nested structure?
// - can we for new, threat the nested routes as nested branches? And use them in the normal flow?
// now we do this in the router, we can strip out a lot of stuff in Gaia itself?
// - loading the sitemap, no all info is moved to the router
//      [-] need to find a way to manage page titles, defined in the routes, modified in components themselves?
//       - referring to C/VM/T is now done fia 1 file, that is referenced in code, passed to a route
//       - scaffolding to folders is not relevant anymore
//       - scaffolding should be rethought altogether
//       - 'type' (was popup or none?) can be removed?
//       ? 'data' can be added to the route for general placeholder, or we could extend routes add typed properties
//       - 'assets' was never used
//       - 'landing' can be accomplished by a '*' / IndexRoute on that level
//      [-] 'container' should be kept to support current Gaia behavior
//       - 'defaultChild' was never used, just use a redirect route
//       - 'partials' will now be handled by webpack if you import them in your component and they should be available
//
// Gaia.api.goto will be changed to history.pushState, or maybe we should wrap that ?
// if we allow for navigation to flow trough the router, we could assemble links better, and provide checks for valid urls
// do we change the knockout.gaia (for goto, gotoPopup, closePopup) to a router binding?
//
// How should assemble work?
// - routes could be passed a user-provided assemble method, for custom stuff?
// - regexp routes could be separated from normal routes, requiring a regexp and spec as constructor parameters
// - if we support some assembling, should we also support 'named' routes? Now we pass a pattern that is tied to a route, so a name shouldn't be that different
// - this could all be an abstraction that the router gives us, but you could still pass an assembled route directly to history.push()
// - old router was doing a lookup for branch and deeplink to find a single match, this is not needed anymore
// - current route assemble method:
//      - finds all parameters by using the same regexp as the resolve
//          - this might not work for newly introduced syntax ( *, () )
//      - translates passed values for translatable segments from keys to values
//      - checks for default values to use if none is passed
//      - warns if required parameter is not supplied
//      - does NOT execute asserts on the parameters
//      - stringifies the values
// [-] custom provided functions probably don't do all this stuff, should be documented on how to do this, or add helper functions to work with parameters
//
// How to handle route access?
// [-] need to add hook, and add flag for landing or not
//  - hook should do a new pushState/goto OR 'resolve' the hook
//
// How should redirectRoute work?
//  - When do we execute the redirect?
//  - In the router after we've done the route matching?
// [-] If the last result is a redirectRoute, do a pushState and dispatch no 'resolve' event?

export default class Router
{
	private _routes:Array<IRoute> = [];
	private _translator:IRouteTranslator;
	private _unlisten:Function;
	private _history:History;
	private _listener:(err:any, routeResult:IRouteResult) => void;
	private _state:IRouteResult = null;

	constructor(history:History)
	{
		this._history = history;
	}

	public listen(listener:(err:any, routeResult:IRouteResult) => void):Function
	{
		this._listener = listener;

		const unlisten = this._history.listen((location:Location) =>
		{
			this.finishMatch(location);
		});

		this.finishMatch(this._history['getCurrentLocation']());

		return unlisten;
	}

	private finishMatch(location:Location):void
	{
		this.match(location)
			.then(routeResult =>
			{
				this._state = routeResult;
				this._listener(null, routeResult);
			});
	}

	public addRoutes(routes:Array<IRoute>):void
	{
		routes.forEach(route => this.addRoute(route));
	}

	public addRoute(route:IRoute):void
	{
		// TODO: make nicer
		if (this._translator && 'setTranslator' in route)
		{
			route['setTranslator'](this._translator);
		}

		// TODO:
		// - set configured params / asserts / stringifiers / parsers / values

		this._routes.push(route);
	}

	// TODO: add methods to configure default stuff (params / asserts / stringifiers / parsers / values)
	// TODO: add added stuff to already added routes, but check if there is not already something added to the route (maybe introduce override flag?)

	public setTranslator(translator:IRouteTranslator):this
	{
		this._translator = translator;

		this._routes.forEach(route =>
			route instanceof Route && route.setTranslator(this._translator)
		);

		return this;
	}

	public match(location:Location):Promise<IRouteResult>
	{
		// TODO: feed returned redirect back into history
		return matchRoutes(this._routes, location);
	}

	/**
	 * Recursively finds a route
	 * @param name
	 */
	public getRouteByName(name:string):IRoute
	{
		const match = this._routes
			.map(route => route.getRouteByName(name))
			.find(route => !!route)

		return match || null;
	}

	public getRoutes():Array<IRoute>
	{
		return this._routes;
	}

	public assemble(name:string, params?:{[param:string]: any;}):Promise<string>
	{
		return this.getRouteByName(name).assemble(params);
	}

	public navigateTo(name:string, params?:{[param:string]: any;}):void
	{
		this.assemble(name, params).then(pathname =>
		{
			this._history.push({pathname});
		});
	}

	public getParams():{[param:string]: any;}
	{
		return this._state && this._state.params || {};
	}

	public getCurrentRoutes():Array<IRoute>
	{
		return this._state && this._state.routes || [];
	}
}
