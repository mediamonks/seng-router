export type Assertion = string|RegExp|((value:string) => boolean)

class RouteRequirement
{
	constructor(public name:string, public assertion:Assertion, public setDefaultAfterFail:boolean = false)
	{
		let check:string = '';

		// convert regexp to string to analyze it
		if (typeof this.assertion !== 'function')
		{
			check = (<RegExp>this.assertion).source || this.assertion.toString();
		}

		if (check)
		{
			if (check.charAt(0) != '^')
			{
				console.warn('Missing ^ at the beginning, this might be unintentional.', name, this.assertion);
			}
			if (check.charAt(check.length - 1) != '$')
			{
				console.warn('Missing $ at the end, this might be unintentional.', name, this.assertion);
			}
		}

		if (this.assertion && (<RegExp>this.assertion).global)
		{
			console.warn('Using the global flag will fail on consecutive matches.', name, this.assertion)
		}
	}

	public assert(value:string):boolean
	{
		const assertion = this.assertion;

		if (typeof assertion === 'string')
		{
			// FIXME: escape regexp?
			return new RegExp(<string>assertion, 'i').test(value);
		}
		else if (typeof assertion === 'function')
		{
			return (<((value:string) => boolean)>assertion).call(null, value);
		}
		else
		{
			return (<RegExp>assertion).test(value);
		}
	}
}

export default RouteRequirement;
