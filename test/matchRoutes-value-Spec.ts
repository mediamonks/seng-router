import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with value', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/foo/:id" with param having a default value', () =>
		{
			const routes = [
				new Route('/foo/:id')
					.value('id', '456'),
			];

			describe('and when url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:id"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id');
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

				it('should match "/foo/:id"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id');
				});

				it('should have param "id" with default value "456"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', '456');
				});
			});
		});

		describe('when having route "/foo/:id" with param having a default value', () =>
		{
			describe('and asserted as digit', () =>
			{
				const routes = [
					new Route('/foo/:id')
						.assert('id', /^[\d]+$/)
						.value('id', '456'),
				];

				describe('and when url is "/foo/123"', () =>
				{
					const location = '/foo/123';

					const match = matchRoutes(routes, createLocation(location));

					it('should match "/foo/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/foo/:id');
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

					it('should match "/foo/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/foo/:id');
					});

					it('should have param "id" with default value "456"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.id', '456');
					});
				});

				describe('and when url is "/foo/abc"', () =>
				{
					const location = '/foo/abc';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match "/foo/:id"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});
			});

			describe('and asserted as digit with setDefaultAfterFail', () =>
			{
				const routes = [
					new Route('/foo/:id')
						.assert('id', /^[\d]+$/, true)
						.value('id', '456'),
				];

				describe('and when url is "/foo/123"', () =>
				{
					const location = '/foo/123';

					const match = matchRoutes(routes, createLocation(location));

					it('should match "/foo/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/foo/:id');
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

					it('should match "/foo/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/foo/:id');
					});

					it('should have param "id" with default value "456"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.id', '456');
					});
				});

				describe('and when url is "/foo/abc"', () =>
				{
					const location = '/foo/abc';

					const match = matchRoutes(routes, createLocation(location));

					it('should match "/foo/:id"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/foo/:id');
					});

					it('should have param "id" with default value "456"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.id', '456');
					});
				});
			});
		});
	});
});
