import { ServerResponse } from "http";
import { AppRequest } from "../types/http";

export type RouteHandler = (
  req: AppRequest,
  res: ServerResponse,
) => void | Promise<void>;

export const routes: Map<string, Map<string, RouteHandler>> = new Map();

export function addRoute(
  method: string,
  routePath: string,
  handler: RouteHandler,
) {
  const normalizedMethod = method.toUpperCase();

  if (!routes.has(normalizedMethod)) {
    routes.set(normalizedMethod, new Map());
  }

  routes.get(normalizedMethod)!.set(routePath, handler);
}

export function normalizePath(pathname: string) {
  if (!pathname) return "/";
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "");
  }
  return pathname;
}

export function findDynamicRoute(method: string, pathname: string) {
  const methodMap = routes.get(method.toUpperCase());

  if (!methodMap) return null;

  const urlParts = normalizePath(pathname).split("/");

  for (const [routePath, handler] of methodMap.entries()) {
    if (!routePath.includes(":")) continue;

    const routeParts = normalizePath(routePath).split("/");

    if (routeParts.length !== urlParts.length) continue;

    const params: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i]!;
      const urlPart = urlParts[i]!;

      if (routePart.startsWith(":")) {
        params[routePart.slice(1)] = decodeURIComponent(urlPart);
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
