class RouteParser
{
	constructor(public name:string, public parser:(param:string) => any)
	{

	}
}

export default RouteParser;
