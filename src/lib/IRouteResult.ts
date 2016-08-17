import IRoute from "./IRoute";

interface IRouteResult
{
	routes: Array<IRoute>;
	params: {[param:string]: any;};
}

export default IRouteResult;
