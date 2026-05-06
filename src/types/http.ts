import { IncomingMessage } from "http";

export interface AppRequest extends IncomingMessage {
  params: Record<string, string>;
}
