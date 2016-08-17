import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";
import IndexRoute from "../src/lib/IndexRoute";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with children', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/foo" with child "/bar"', () =>
		{
			const routes = [
				new Route('/foo')
					.addChildren([
						new Route('/bar')
					]),
			];

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo');
				});
			});

			describe('and when url is "/foo/bar"', () =>
			{
				const location = '/foo/bar';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo');
				});

				it('should match child "/bar"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[1]._pattern', '/bar');
				});
			});
		});

		describe('when having route "/foo" with child "/bar" with child "baz"', () =>
		{
			const routes = [
				new Route('/foo')
					.addChildren([
						new Route('/bar')
							.addChildren([
								new Route('/baz')
							])
					]),
			];

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo');
				});
			});

			describe('and when url is "/foo/bar"', () =>
			{
				const location = '/foo/bar';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo');
				});

				it('should match child "/bar"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[1]._pattern', '/bar');
				});
			});

			describe('and when url is "/foo/bar/baz"', () =>
			{
				const location = '/foo/bar/baz';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo');
				});

				it('should match child "/bar"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[1]._pattern', '/bar');
				});


				it('should match child child "/baz"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[2]._pattern', '/baz');
				});
			});

			describe('and when url is "/foo/bar/qux"', () =>
			{
				const location = '/foo/bar/qux';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/bar/qux"', () =>
				{
					return match.should.eventually
						.be.equal(null);
				});
			});
		});

		describe('when having route "/foo" with child "/bar" with child "baz", and all have params', () =>
		{
			const routes = [
				new Route('/foo/:foo')
					.addChildren([
						new Route('/bar/:bar')
							.addChildren([
								new Route('/baz/:baz')
							])
					]),
			];

			describe('and when url is "/foo/123/bar/456/baz/789"', () =>
			{
				const location = '/foo/123/bar/456/baz/789';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:foo');
				});

				it('should have param "foo" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.foo', '123');
				});

				it('should match child "/bar/:bar"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[1]._pattern', '/bar/:bar');
				});

				it('should have child param "bar" with value "456"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.bar', '456');
				});

				it('should match child child "/baz/:baz"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[2]._pattern', '/baz/:baz');
				});

				it('should have child child param "baz" with value "789"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.baz', '789');
				});
			});
		});

		describe('when having a catch-all route on 3 levels', () =>
		{
			const routes = [
				new Route('/foo/:foo')
					.addChildren([
						new Route('/bar/:bar')
							.addChildren([
								new Route('/baz/:baz'),
								new Route('*', 'not-found-2')
							]),
						new Route('*', 'not-found-1')
					]),
				new Route('*', 'not-found-0')
			];

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "not-found-0"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0].name', 'not-found-0');
				});
			});

			describe('and when url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should match child child "/foo/:foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:foo');
				});

				it('should have child child param "foo" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.foo', '123');
				});

				it('should not match "not-found-1"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes.length', 1);
				});
			});

			describe('and when url is "/foo/123/foo"', () =>
			{
				const location = '/foo/123/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match child child "/foo/:foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:foo');
				});

				it('should have child child param "foo" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.foo', '123');
				});

				it('should match "not-found-1"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[1].name', 'not-found-1');
				});
			});
		});

		describe('when having a catch-all route on 3 levels', () =>
		{
			const routes = [
				new Route('/foo', 'foo')
					.addChildren([
						new IndexRoute(),
						new Route('/bar'),
					]),
				new IndexRoute(),
			];

			describe('and when url is "/"', () =>
			{
				const location = '/';

				const match = matchRoutes(routes, createLocation(location));

				it('should match indexRoute', () =>
				{
					return match.should.eventually
						.equal(null);
				});
			});

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0].name', 'foo');
				});

				it('should match indexRoute', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[1].name', '_index');
				});
			});
		});

		describe.only('pathless routes for index', () =>
		{
			let homeRoute, aboutRoute;

			const routes = [
				new Route(null, 'index')
					.addChildren([
						homeRoute = new Route('/', 'home'),
						aboutRoute = new Route('/about', 'about'),
					])
			];

			describe('and when url is "/"', () =>
			{
				const location = '/';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "index"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0].name', 'index');
				});

				it('should match "home"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[1].name', 'home');
				});
			});

			describe('and when url is "/about"', () =>
			{
				const location = '/about';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "index"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0].name', 'index');
				});

				it('should match "home"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[1].name', 'about');
				});
			});

			describe('trying to assemble "home"', () =>
			{
				const pathname = homeRoute.assemble({});

				it('should match "index"', () =>
				{
					return pathname.should.eventually
						.equal('/')
				});
			});

			describe('trying to assemble "about"', () =>
			{
				const pathname = aboutRoute.assemble({})
					.catch(e =>
					{
						console.log(e);
					});

				it('should match "about"', () =>
				{
					return pathname.should.eventually
						.equal('/about')
				});
			});
		});

		// TODO: match RedirectRoute
	});
});
