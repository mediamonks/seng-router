import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";
import Translator from "./Translator";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('matchRoutes', () =>
{
	describe('with translate', () =>
	{
		const createLocation = <CreateLocation>(createMemoryHistory().createLocation);

		describe('when having no translator set', () =>
		{
			describe('and having route "/@info"', () =>
			{
				const routes = [
					new Route('/@info')
				];

				describe('and url is "/info"', () =>
				{
					const location = '/info';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match route "/@info"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});

				describe('and url is "/informatie"', () =>
				{
					const location = '/informatie';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match route "/@info"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});

				describe('and url is "/@info"', () =>
				{
					const location = '/@info';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/@info"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/@info');
					});
				});
			});
		});

		describe('when having a translator set', () =>
		{
			describe('and having route "/@info"', () =>
			{
				const routes = [
					new Route('/@info')
						.setTranslator(new Translator({
							'info': 'informatie'
						})),
				];

				describe('and url is "/info"', () =>
				{
					const location = '/info';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match route "/@info"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});

				describe('and url is "/informatie"', () =>
				{
					const location = '/informatie';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/@info"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/@info');
					});
				});

				describe('and url is "/@info"', () =>
				{
					const location = '/@info';

					const match = matchRoutes(routes, createLocation(location));

					it('should not match route "/@info"', () =>
					{
						return match.should.eventually
							.equal(null);
					});
				});
			});

			describe('and having route "/@info/:@foo" with "foobar" and "fubar" as valid values', () =>
			{
				const routes = [
					new Route('/@info/:@foo')
						.setTranslator(new Translator({
							'info': 'informatie',
							'fo': 'foobar',
							'fu': 'fubar',
						})),
				];

				describe('and url is "/informatie/foobar"', () =>
				{
					const location = '/informatie/foobar';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/@info/:@foo"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/@info/:@foo');
					});

					it('should have param "foo" with value "fo"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.foo', 'fo');
					});
				});

				describe('and url is "/informatie/fubar"', () =>
				{
					const location = '/informatie/fubar';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/@info/:@foo"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/@info/:@foo');
					});

					it('should have param "foo" with value "fu"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.foo', 'fu');
					});
				});


				describe('and url is "/informatie/bar"', () =>
				{
					const location = '/informatie/bar';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/@info/:@foo"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/@info/:@foo');
					});

					it('should have param "foo" with value "undefined"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.foo', undefined);
					});
				});
			});

			describe('and having route "/@info" with route "/:@foo" as child route', () =>
			{
				const translator = new Translator({
					'info': 'informatie',
					'fo': 'foobar',
					'fu': 'fubar',
				});

				const routes = [
					new Route('/@info')
						.setTranslator(translator)
						.addChildren([
							new Route('/:@foo')
						]),
				];

				describe('and url is "/informatie/foobar"', () =>
				{
					const location = '/informatie/foobar';

					const match = matchRoutes(routes, createLocation(location));

					it('should match route "/@info"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[0]._pattern', '/@info');
					});

					it('should match child route "/:@foo"', () =>
					{
						return match.should.eventually
							.have.deep.property('routes[1]._pattern', '/:@foo');
					});

					it('should have param "foo" with value "fo"', () =>
					{
						return match.should.eventually
							.have.deep.property('params.foo', 'fo');
					});
				});

			});
		});

	});
});
