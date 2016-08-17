import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with splat params', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/foo/:data*"', () =>
		{
			const routes = [
				new Route('/foo/:data*'),
			];

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/:data*"', () =>
				{
					return match.should.eventually
						.be.equal(null);
				});
			});

			describe('and when url is "/foo/abc"', () =>
			{
				const location = '/foo/abc';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:data*"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:data*');
				});

				it('should have param "data" with value "abc"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.data', 'abc');
				});
			});

			describe('and when url is "/foo/abc/def"', () =>
			{
				const location = '/foo/abc/def';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:data*"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:data*');
				});

				it('should have param "data" with value "abc/def"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.data', 'abc/def');
				});
			});
		});

		describe('when having route "/foo/:data*/end"', () =>
		{
			const routes = [
				new Route('/foo/:data*/end'),
			];

			describe('and when url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/:data*"', () =>
				{
					return match.should.eventually
						.be.equal(null);
				});
			});

			describe('and when url is "/foo/abc"', () =>
			{
				const location = '/foo/abc';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/:data*"', () =>
				{
					return match.should.eventually
						.be.equal(null);
				});
			});

			describe('and when url is "/foo/abc/end"', () =>
			{
				const location = '/foo/abc/end';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:data*/end"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:data*/end');
				});

				it('should have param "data" with value "abc"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.data', 'abc');
				});
			});

			describe('and when url is "/foo/abc/def/end"', () =>
			{
				const location = '/foo/abc/def/end';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:data*/end"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:data*/end');
				});

				it('should have param "data" with value "abc/def"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.data', 'abc/def');
				});
			});
		});
	});
});
