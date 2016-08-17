import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";
import Translator from "./Translator";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('todo', () =>
{
	const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

	describe('when having route "*"', () =>
	{
		const routes = [
			new Route('*')
		];

		describe('and url is "/foo"', () =>
		{
			const location = '/foo';

			const match = matchRoutes(routes, createLocation(location));

			it('should match route "/foo"', () =>
			{
				return match.should.eventually
					.have.deep.property('routes[0]._pattern', '*');
			});
		});
	});

	describe('when having route "/foo(/bar/:id)"', () =>
	{
		// TODO: how should we assemble this route back?
		//
		// /foo(/bar)
		// /foo(/bar/:id)
		// /foo(/:id)
		// /foo(/slug-:id)  // colons are harder to match in the middle of a string, do we want to support this, or let them use regular expressions for this?
		//					// or switch syntax? /foo(/slug-{id}) or /foo(/slug-{:id}) (where the {} are just for extra clarity?)
		//                  // other router uses <id> for parameters, so you can add additional syntax in there
		//                  // <id:int>, <slug:maxlength(2)> ... But we don't need that as we have them configured separately
		//
		// the used :id parameter is not even needed here, could be just optional route segments
		// I think it's just either with or without the optional part
		// - maybe an option in the assemble method? Or an option into the route?
		// When we have a parameter in the optional part like above, we could do some more?
		// - only add the optional part when the parameter in there is provided (kinda making the parameter optional, but including the surrounding segments

		const route = new Route('/foo(/bar/:id)');
		const routes = [
			route,
		];

		describe('and url is "/foo"', () =>
		{
			const location = '/foo';

			const match = matchRoutes(routes, createLocation(location));

			it('should match route "/foo"', () =>
			{
				return match.should.eventually
					.have.deep.property('routes[0]._pattern', '/foo(/bar/:id)');
			});
		});

		describe('and url is "/foo/bar"', () =>
		{
			const location = '/foo/bar';

			const match = matchRoutes(routes, createLocation(location));

			it('should not match route', () =>
			{
				return match.should.eventually
					.equal(null);
			});
		});

		describe('and url is "/foo/bar/123"', () =>
		{
			const location = '/foo/bar/123';

			const match = matchRoutes(routes, createLocation(location));

			it('should match route "/foo/bar/123"', () =>
			{
				return match.should.eventually
					.have.deep.property('routes[0]._pattern', '/foo(/bar/:id)');
			});
		});
	});

	describe('router', () =>
	{
		const router = new Router(createMemoryHistory());

		const tree = new Route('/foo/:foo', 'parent')
			.addChildren([
				new Route('/bar/:bar', 'middle')
					.addChildren([
						new Route('/baz/:baz', 'child')
					])
			]);

		router.addRoute(new Route('/foo', 'foo'));
		router.addRoute(tree);


		it('should find single route', () =>
		{
			const result = router.getRouteByName('foo');
			return result.should
				.have.deep.property('name', 'foo');
		});

		it('should find parent route', () =>
		{
			const result = router.getRouteByName('parent');
			return result.should
				.have.deep.property('name', 'parent');
		});

		it('should find middle route', () =>
		{
			const result = router.getRouteByName('middle');
			return result.should
				.have.deep.property('name', 'middle');
		});

		it('should find child route', () =>
		{
			const result = router.getRouteByName('child');
			return result.should
				.have.deep.property('name', 'child');
		});
	});
});
