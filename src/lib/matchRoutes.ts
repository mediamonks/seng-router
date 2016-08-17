import { Promise } from "es6-promise";
import IndexRoute from "./IndexRoute";
import IRouteResult from "./IRouteResult";
import IRoute from "./IRoute";

export default function matchRoutes(routes: Array<IRoute>, location: any): Promise<IRouteResult>
{
	// TODO: This is a little bit ugly, but it works around a quirk in history
	// that strips the leading slash from pathnames when using basenames with
	// trailing slashes.
	if (location.pathname.charAt(0) !== '/')
	{
		location = Object.assign(location, {
			pathname: `/${location.pathname}`
		});
	}

	let remainingPathname = location.pathname;

	return new Promise((resolve: (result: IRouteResult) => void, reject: (error: any) => void) =>
	{
		const match = routes.find((route) =>
		{
			return route.isMatch(remainingPathname);
		});

		if (match)
		{
			remainingPathname = remainingPathname.substr(match.getMatch().length);
			const children = match.getChildren();

			// if we have more to match, try with children
			if (remainingPathname.length > 0)
			{
				if (children.length)
				{
					// call this method recursively with the child routes and remaning path
					matchRoutes(children, {pathname: remainingPathname}).then(childMatch =>
					{
						// no child match, same as no children, invalid!
						if (!childMatch)
						{
							resolve(null);
						}
						else
						{
							// merge this match with the match of the children, and resolve!
							resolve({
								routes: [match].concat(<any>childMatch.routes),
								params: Object.assign({}, match.getParams(), childMatch.params)
							});
						}
					})
				}
				else
				{
					// we have more to match, but no children
					// this should never happen, but return null anyways
					resolve(null);
				}
			}
			else if (children.length)
			{
				const indexRoute = children.find(route => route instanceof IndexRoute);

				if (indexRoute)
				{
					// merge this match with the indexroute match, and resolve!
					resolve({
						routes: [match].concat(indexRoute),
						params: match.getParams()
					});
				}
				else
				{
					// we have nothing to match, but we have children, this is okay!
					resolve({
						routes: [match],
						params: match.getParams()
					});

				}

			}
			else
			{
				// we have a match, no pathname remaining, and no children, so we are good to go
				resolve({
					routes: [match],
					params: match.getParams()
				});
			}

		}
		else
		{
			// no match, meh :(
			resolve(null);
		}
	});
}
