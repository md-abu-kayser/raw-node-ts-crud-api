import { IncomingMessage, ServerResponse } from "http";

export type Params = Record<string, string>;

export type RequestWithParams = IncomingMessage & {
  params?: Params;
};

export type RouteHandler = (
  req: RequestWithParams,
  res: ServerResponse,
) => void | Promise<void>;

export const routes: Map<string, Map<string, RouteHandler>> = new Map();

export function registerRoute(
  method: string,
  path: string,
  handler: RouteHandler,
) {
  const upperMethod = method.toUpperCase();

  if (!routes.has(upperMethod)) {
    routes.set(upperMethod, new Map());
  }

  routes.get(upperMethod)!.set(path, handler);
}
