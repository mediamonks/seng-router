import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with simple', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/"', () =>
		{
			const routes = [
				new Route('/'),
			];

			describe('and url is "/"', () =>
			{
				const location = '/';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/')
				});
			});

			describe('and url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/"', () =>
				{
					return match.should.eventually
						.equal(null);
				});
			})
		});

		describe('when having route "/foo"', () =>
		{
			const routes = [
				new Route('/foo'),
			];

			describe('and url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo')
				});
			});

			describe('and url is "/"', () =>
			{
				const location = '/';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo"', () =>
				{
					return match.should.eventually
						.equal(null);
				});
			})
		});


		describe('when having route "/foo/bar"', () =>
		{
			const routes = [
				new Route('/foo/bar'),
			];

			describe('and url is "/foo/bar"', () =>
			{
				const location = '/foo/bar';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/bar"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/bar')
				});
			});

			describe('and url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/bar"', () =>
				{
					return match.should.eventually
						.equal(null);
				});
			});

			describe('and url is "/bar"', () =>
			{
				const location = '/bar';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/bar"', () =>
				{
					return match.should.eventually
						.equal(null);
				});
			})
		});
	});
});
