import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with assert', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/bar/:id" with param asserted as digit', () =>
		{
			describe('and assert uses a regular expression', () =>
			{
				const routes = [
					new Route('/bar/:id')
						.assert('id', /^[\d]+$/)
				];

				describe('and url is "/bar/123"', () =>
				{
					const location = '/bar/123';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/bar/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/bar/:id');
					});

					it('should have param "id" with value "123"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.id', '123');
					});
				});

				describe('and url is "/bar/abc"', () =>
				{
					const location = '/bar/abc';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match route "/bar/:id"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});
			});

			describe('and assert uses a string', () =>
			{
				const routes = [
					new Route('/bar/:id')
						.assert('id', '^[\\d]+$')
				];

				describe('and url is "/bar/123"', () =>
				{
					const location = '/bar/123';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/bar/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/bar/:id');
					});
				});

				describe('and url is "/bar/abc"', () =>
				{
					const location = '/bar/abc';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match route "/bar/:id"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});
			});

			describe('and assert uses a function', () =>
			{
				const routes = [
					new Route('/bar/:id')
						.assert('id', (value:string) => parseInt(value, 10).toString() == value)
				];

				describe('and url is "/bar/123"', () =>
				{
					const location = '/bar/123';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/bar/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/bar/:id');
					});
				});

				describe('and url is "/bar/abc"', () =>
				{
					const location = '/bar/abc';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match route "/bar/:id"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});
			});
		});

		describe('when having route "/bar/:id" with param asserted as digit and with setDefaultAfterFail', () =>
		{
			describe('and assert uses a regular expression', () =>
			{
				const routes = [
					new Route('/bar/:id')
						.assert('id', /^[\d]+$/, true)
				];

				describe('and url is "/bar/123"', () =>
				{
					const location = '/bar/123';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/bar/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/bar/:id');
					});

					it('should have param "id" with value "123"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.id', '123');
					});
				});

				describe('and url is "/bar/abc"', () =>
				{
					const location = '/bar/abc';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match route "/bar/:id"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});
			});
		});
	});
});
