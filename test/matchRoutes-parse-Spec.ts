import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with parse', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having route "/foo/:id" with param parsed to int', () =>
		{
			const routes = [
				new Route('/foo/:id')
					.parse('id', id => parseInt(id, 10))
			];

			describe('and url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should match route "/foo/:id"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id');
				});

				it('should have param "id" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', 123);
				});
			});
		});

		describe('when having route "/foo/:base64" with param parsed to object', () =>
		{
			const routes = [
				new Route('/foo/:base64')
					.parse('base64', value => JSON.parse(atob(value)))
			];

			describe('and url is "/foo/eyJpZCI6MSwic2x1ZyI6ImZvbyJ9"', () =>
			{
				// btoa(JSON.stringify({'id': 1, 'slug': 'foo'}));
				const location = '/foo/eyJpZCI6MSwic2x1ZyI6ImZvbyJ9';

				const match = matchRoutes(routes, createLocation(location));

				it('should match route "/foo/:base64"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:base64');
				});

				it('should have param "base64" with property "id" as "1"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.base64.id', 1)
				});

				it('should have param "base64" with property "slug" as "foo"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.base64.slug', 'foo');
				});
			});
		});

		describe('when having route "/foo/:id" with param parsed to int and a default value as string', () =>
		{
			const routes = [
				new Route('/foo/:id')
					.parse('id', id => parseInt(id, 10))
					.value('id', '123')
			];

			describe('and url is "/foo/123"', () =>
			{
				const location = '/foo/123';

				const match = matchRoutes(routes, createLocation(location));

				it('should match route "/foo/:id"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id');
				});

				it('should have param "id" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', 123);
				});
			});

			describe('and url is "/foo"', () =>
			{
				const location = '/foo';

				const match = matchRoutes(routes, createLocation(location));

				it('should match route "/foo/:id"', () =>
				{
					return match.should.eventually
						.have.deep.property('routes[0]._pattern', '/foo/:id');
				});

				it('should have param "id" with value "123"', () =>
				{
					return match.should.eventually
						.have.deep.property('params.id', 123);
				});
			});
		});
	});
});
