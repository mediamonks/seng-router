import {expect} from 'chai';
import * as sinon from 'sinon';
import Router from '../src/lib/Router';
import matchRoutes from '../src/lib/matchRoutes';
import {mockExample} from './ExampleMock';
import { createMemoryHistory, Location } from 'history'
import Route from "../src/lib/Route";
import Translator from "./Translator";

type CreateLocation = (path: string | Location, action?:string, key?:string) => Location

describe('Router', () =>
{
	describe('when listening with fake history', () =>
	{
		const history = createMemoryHistory();
		const router = new Router(history);

		let FooRoute, BarRoute;

		router.addRoute(
			FooRoute = new Route('/foo', 'foo')
				.addChildren([
					BarRoute = new Route('/bar', 'bar')
				])
		);



		it('should push to "/foo"', (done) =>
		{
			let count = 2;

			const unlisten = router.listen((err, nextState) =>
			{
				// break out of error-swallowing-promise
				setTimeout(() =>
				{
					--count;

					if (count == 1)
					{
						expect(err).to.be.null;
						expect(nextState).to.be.null;
					}
					else if (count == 0)
					{
						expect(err).to.be.null;
						nextState.should.have.deep.property('routes[0]', FooRoute);
						unlisten();
						done();
					}
				}, 0);
			});

			history.push({
				pathname: '/foo'
			});
		});

		it('should push to "/foo/bar"', (done) =>
		{
			let count = 2;

			const unlisten = router.listen((err, nextState) =>
			{
				// break out of error-swallowing-promise
				setTimeout(() =>
				{
					--count;

					if (count == 1)
					{
						expect(err).to.be.null;
					}
					else if (count == 0)
					{
						expect(err).to.be.null;
						nextState.should.have.deep.property('routes[0]', FooRoute);
						nextState.should.have.deep.property('routes[1]', BarRoute);

						unlisten();
						done();
					}

				}, 0);
			});

			history.push({
				pathname: '/foo/bar'
			});
		});
	});
});
