import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with multi', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/" as first', () =>
		{
			const routes = [
				new Route('/'),
				new Route('/foo'),
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

				it('should match "/foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo')
				});
			})
		});

		describe('when having route "/" as last', () =>
		{
			const routes = [
				new Route('/foo'),
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

				it('should match "/foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo')
				});
			})
		});
	});
});
