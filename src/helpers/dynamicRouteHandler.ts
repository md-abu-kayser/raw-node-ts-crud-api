import { routes, RouteHandler, Params } from "./RouteHandler";

function normalizePath(input: string): string {
  const cleaned = input.replace(/\?.*$/, "").replace(/\/+$/, "");
  return cleaned || "/";
}

function splitPath(input: string): string[] {
  return normalizePath(input)
    .split("/")
    .filter((part): part is string => part.length > 0);
}

function findDynamicRoute(
  method: string,
  url: string,
): { handler: RouteHandler; params: Params } | null {
  const methodMap = routes.get(method.toUpperCase());
  if (!methodMap) return null;

  const urlParts = splitPath(url);

  for (const [routePath, handler] of methodMap.entries()) {
    const routeParts = splitPath(routePath);

    if (routeParts.length !== urlParts.length) continue;

    const params: Params = {};
    let matched = true;

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const urlPart = urlParts[i];

      if (!routePart || !urlPart) {
        matched = false;
        break;
      }

      if (routePart.startsWith(":")) {
        params[routePart.slice(1)] = urlPart;
      } else if (routePart !== urlPart) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { handler, params };
    }
  }

  return null;
}

export default findDynamicRoute;
