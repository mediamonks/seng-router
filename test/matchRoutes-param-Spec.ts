import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with params', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/foo/:id"', () =>
		{
			const routes = [
				new Route('/foo/:id'),
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
		});

		describe('when having route "/foo/:123abc"', () =>
		{
			// 123abc is not a valid parameter name
			const routes = [
				new Route('/foo/:123abc'),
			];

			describe('and when url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should not match "/foo/:123abc"', () =>
				{
					return match.should.eventually
						.equal(null);
				});
			});
		});

		describe('when having route "/foo/:abc123"', () =>
		{
			// abc123 is a valid parameter name
			const routes = [
				new Route('/foo/:abc123'),
			];

			describe('and when url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should match "/foo/:abc123"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:abc123');
				});

				it('should have param "abc123" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.abc123', '123');
				});
			});
		});
	});
});
