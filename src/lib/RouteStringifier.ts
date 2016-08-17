class RouteStringifier
{
	constructor(public name:string, public stringifier:(param:any) => string)
	{

	}
}

export default RouteStringifier;
