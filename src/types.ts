import { APIResult } from "standard-api";

export interface IScuttleSpaceError {
  code: string;
  message: string;
}

export type ScuttleSpaceAPIResult<T> = APIResult<T, IScuttleSpaceError>;
