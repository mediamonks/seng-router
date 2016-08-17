import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with optional params', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/foo/:id?"', () =>
		{
			const routes = [
				new Route('/foo/:id?'),
			];

			describe('and when url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:id?"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id?');
				});

				it('should have param "id" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', '123');
				});
			});

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:id?"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id?');
				});

				it('should have param "id" with value "undefined"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', undefined);
				});
			});
		});

		describe('when having route "/foo/:id?" and assert "id" as number', () =>
		{
			const routes = [
				new Route('/foo/:id?')
					.assert('id', /^[\d]+$/),
			];

			describe('and when url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:id?"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id?');
				});

				it('should have param "id" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', '123');
				});
			});

			describe('and when url is "/foo/abc"', () =>
			{
				const location = '/foo/abc';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/:id?"', () =>
				{
					return match.should.eventually
						.be.equal(null);
				});
			});

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:id?"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id?');
				});

				it('should have param "id" with value "undefined"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', undefined);
				});
			});
		});

		describe('when having route "/foo/:id?" and assert "id" as number and "setDefaultAfterFail"', () =>
		{
			const routes = [
				new Route('/foo/:id?')
					.assert('id', /^[\d]+$/, true),
			];

			describe('and when url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:id?"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id?');
				});

				it('should have param "id" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', '123');
				});
			});

			describe('and when url is "/foo/abc"', () =>
			{
				const location = '/foo/abc';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/:id?"', () =>
				{
					return match.should.eventually
						.be.equal(null);
				});
			});

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:id?"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id?');
				});

				it('should have param "id" with value "undefined"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', undefined);
				});
			});
		});
	});
});
