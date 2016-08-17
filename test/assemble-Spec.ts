import {expect} from 'chai';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";
import Translator from "./Translator";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('assemble', () =>
{
	describe('with simple', () =>
	{
		describe('when having route "/foo"', () =>
		{
			const route = new Route('/foo');

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble to "/foo"', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});
		});
	});

	describe('with param', () =>
	{
		describe('when having route "/foo/:id"', () =>
		{
			const route = new Route('/foo/:id');

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble without parameter', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});

			describe('and param "id" as "123"', () =>
			{
				const params = {id: 123};

				const result = route.assemble(params);

				it('should assemble to "/foo/123"', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});
		});

		describe('when having route "/foo/:id/:slug"', () =>
		{
			const route = new Route('/foo/:id/:slug');

			describe('and param "id" as "123" and "slug" as "abc"', () =>
			{
				const params = {id: 123, slug: 'abc'};

				const result = route.assemble(params);

				it('should assemble to "/foo/123/abc"', () =>
				{
					return result.should.eventually
						.equal('/foo/123/abc')
				});
			});
		});
	});

	describe('with value', () =>
	{
		describe('when having route "/foo/:id" and param "id" as a default value not for assemble', () =>
		{
			const route = new Route('/foo/:id')
				.value('id', '123');

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble to "/foo" not using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});

			describe('and param "id" as "456"', () =>
			{
				const params = {id: 456};

				const result = route.assemble(params);

				it('should assemble to "/foo/456"', () =>
				{
					return result.should.eventually
						.equal('/foo/456')
				});
			});
		});

		describe('when having route "/foo/:id" and param "id" as a default value for assemble', () =>
		{
			const route = new Route('/foo/:id')
				.value('id', '123', true);

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble to "/foo/123" using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});

			describe('and param "id" as "456"', () =>
			{
				const params = {id: 456};

				const result = route.assemble(params);

				it('should assemble to "/foo/456"', () =>
				{
					return result.should.eventually
						.equal('/foo/456')
				});
			});
		});
	});

	describe('with assert', () =>
	{
		describe('when having route "/foo/:id" and param "id" asserted as digit', () =>
		{
			const route = new Route('/foo/:id')
				.assert('id', /^[\d]+$/);

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble to "/foo" not using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});

			describe('and param "id" as "123"', () =>
			{
				const params = {id: 123};

				const result = route.assemble(params);

				it('should assemble to "/foo/123"', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});

			describe('and param "id" as "abc"', () =>
			{
				const params = {id: 'abc'};

				const result = route.assemble(params);

				it('should not assemble', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});
		});

		describe('when having route "/foo/:id" and param "id" asserted as digit and default value', () =>
		{
			const route = new Route('/foo/:id')
				.assert('id', /^[\d]+$/)
				.value('id', '123');

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble to "/foo" not using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});

			describe('and param "id" as "123"', () =>
			{
				const params = {id: 123};

				const result = route.assemble(params);

				it('should assemble to "/foo/123"', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});

			describe('and param "id" as "abc"', () =>
			{
				const params = {id: 'abc'};

				const result = route.assemble(params);

				it('should not assemble', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});
		});

		describe('when having route "/foo/:id" and param "id" asserted as digit and defaultAfterFail and default value', () =>
		{
			const route = new Route('/foo/:id')
				.assert('id', /^[\d]+$/, true)
				.value('id', '123');

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble to "/foo" not using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});

			describe('and param "id" as "123"', () =>
			{
				const params = {id: 123};

				const result = route.assemble(params);

				it('should assemble to "/foo/123"', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});

			describe('and param "id" as "abc"', () =>
			{
				const params = {id: 'abc'};

				const result = route.assemble(params);

				it('should assemble to "/foo" not using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});
		});

		describe('when having route "/foo/:id" and param "id" asserted as digit and defaultAfterFail and default value for assemble', () =>
		{
			const route = new Route('/foo/:id')
				.assert('id', /^[\d]+$/, true)
				.value('id', '123', true);

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble to "/foo/123" using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});

			describe('and param "id" as "123"', () =>
			{
				const params = {id: 123};

				const result = route.assemble(params);

				it('should assemble to "/foo/123"', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});

			describe('and param "id" as "abc"', () =>
			{
				const params = {id: 'abc'};

				const result = route.assemble(params);

				it('should assemble to "/foo" using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});
		});

		describe('when having route "/foo/:id" and param "id" asserted as digit and default value for assemble', () =>
		{
			const route = new Route('/foo/:id')
				.assert('id', /^[\d]+$/)
				.value('id', '123', true);

			describe('and no params', () =>
			{
				const params = null;

				const result = route.assemble(params);

				it('should assemble to "/foo" not using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});

			describe('and param "id" as "123"', () =>
			{
				const params = {id: 123};

				const result = route.assemble(params);

				it('should assemble to "/foo/123"', () =>
				{
					return result.should.eventually
						.equal('/foo/123')
				});
			});

			describe('and param "id" as "abc"', () =>
			{
				const params = {id: 'abc'};

				const result = route.assemble(params);

				it('should assemble to "/foo" not using the default value', () =>
				{
					return result.should.eventually
						.equal('/foo')
				});
			});
		});
	});

	describe('with stringify', () =>
	{
		describe('when having route "/foo/:base64" with param stringified from object', () =>
		{
			const route = new Route('/foo/:base64')
					.stringify('base64', value => btoa(JSON.stringify(value)));

			describe('and param "base64" as "{id: 1, slug: "foo"}"', () =>
			{
				const params = {base64: {id: 1, slug: "foo"}};

				const result = route.assemble(params);

				// btoa(JSON.stringify({'id': 1, 'slug': 'foo'}))
				it('should assemble to "/foo/eyJpZCI6MSwic2x1ZyI6ImZvbyJ9"', () =>
				{
					return result.should.eventually
						.equal('/foo/eyJpZCI6MSwic2x1ZyI6ImZvbyJ9')
				});
			});
		});
	});

	describe('with translate', () =>
	{
		describe('when having no translator set', () =>
		{
			describe('and having route "/@info"', () =>
			{
				const route = new Route('/@info');

				describe('and no params', () =>
				{
					const params = null;

					const result = route.assemble(params);

					it('should assemble to "/@info', () =>
					{
						return result.should.eventually
							.equal('/@info')
					});
				});
			});
		});

		describe('when having a translator set', () =>
		{
			describe('and having route "/@info"', () =>
			{
				const route = new Route('/@info')
					.setTranslator(new Translator({
						'info': 'informatie'
					}));

				describe('and no params', () =>
				{
					const params = null;

					const result = route.assemble(params);

					it('should assemble to "/informatie', () =>
					{
						return result.should.eventually
							.equal('/informatie')
					});
				});
			});

			describe('and having route "/@info/:@foo" with "foobar" and "fubar" as valid values', () =>
			{
				const route = new Route('/@info/:@foo')
					.setTranslator(new Translator({
						'info': 'informatie',
						'fo': 'foobar',
						'fu': 'fubar',
					}));

				describe('and no params', () =>
				{
					const params = null;

					const result = route.assemble(params);

					it('should assemble to "/informatie', () =>
					{
						return result.should.eventually
							.equal('/informatie')
					});
				});

				describe('and param "foo" as "fo"', () =>
				{
					const params = {foo: 'fo'};

					const result = route.assemble(params);

					it('should assemble to "/informatie/foobar', () =>
					{
						return result.should.eventually
							.equal('/informatie/foobar')
					});
				});
			});
		});
	});

	describe('with children', () =>
	{
		// TODO assemble a route with children
		// - how do we pass this route? only the child route? And look up its parent?
		// - then pass the params to all the parents, assemble them separately, and concat them together?

		const route = new Route('/baz/:baz');
		const parents = new Route('/foo/:foo')
			.addChildren([
				new Route('/bar/:bar')
					.addChildren([
						route
					])
			]);

		const params = {foo: 123, bar: 'abc', baz: '4d5'};

		const result = route.assemble(params);

		it('should assemble to "/foo/123/bar/abc/baz/4d5', () =>
		{
			return result.should.eventually
				.equal('/foo/123/bar/abc/baz/4d5')
		});
	});
});
