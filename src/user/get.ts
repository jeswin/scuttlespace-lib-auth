import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-service-common";
import exception from "../exception";
import { getPool } from "../pool";
import { IScuttlespaceUser } from "scuttlespace-service-user-graphql-schema";

export interface IGetUserResult {
  rowid: string;
  about: string;
  domain: string;
  enabled: boolean;
  externalId: string;
  pub: string;
  username: string;
}

export interface IFindUserArgs {
  domain?: string;
  externalId?: string;
  username?: string;
}

export async function findUser(
  args: IFindUserArgs,
  context: ICallContext
): Promise<ServiceResult<IScuttlespaceUser | undefined>> {
  const pool = getPool();
  return args.domain
    ? await getUserByDomain(args.domain, context)
    : args.username
      ? await getUserByUsername(args.username, context)
      : args.externalId
        ? await getUserByExternalId(args.externalId, context)
        : exception(
            "INVALID_ARGS",
            `One of username, domain or externalId needs to be specified.`
          );
}

export async function getUserByExternalId(
  externalId: string,
  context: ICallContext
): Promise<ServiceResult<IScuttlespaceUser | undefined>> {
  const pool = getPool();
  const params = new psy.Params({ external_id: externalId });
  const { rows } = await pool.query(
    `SELECT * FROM scuttlespace_user
     WHERE external_id = ${params.id("external_id")}`,
    params.values()
  );

  const result: IGetUserResult | undefined =
    rows.length > 0
      ? {
          about: rows[0].about,
          domain: rows[0].domain,
          enabled: rows[0].enabled,
          externalId,
          pub: rows[0].pub,
          rowid: rows[0].rowid,
          username: rows[0].username
        }
      : undefined;

  return new ValidResult(result);
}

export async function getUserByDomain(
  domain: string,
  context: ICallContext
): Promise<ServiceResult<IScuttlespaceUser | undefined>> {
  const pool = getPool();
  const params = new psy.Params({ domain });
  const { rows } = await pool.query(
    `SELECT * FROM scuttlespace_user
     WHERE domain = ${params.id("domain")}`,
    params.values()
  );

  const result: IGetUserResult | undefined =
    rows.length > 0
      ? {
          about: rows[0].about,
          domain: rows[0].domain,
          enabled: rows[0].enabled,
          externalId: rows[0].external_id,
          pub: rows[0].pub,
          rowid: rows[0].rowid,
          username: rows[0].username
        }
      : undefined;

  return new ValidResult(result);
}

export async function getUserByUsername(
  username: string,
  context: ICallContext
): Promise<ServiceResult<IScuttlespaceUser | undefined>> {
  const pool = getPool();
  const params = new psy.Params({ username });
  const { rows } = await pool.query(
    `SELECT * FROM scuttlespace_user
     WHERE username = ${params.id("username")}`,
    params.values()
  );

  const result: IScuttlespaceUser | undefined =
    rows.length > 0
      ? {
          about: rows[0].about,
          domain: rows[0].domain,
          enabled: rows[0].enabled,
          externalId: rows[0].external_id,
          permissions: [],
          pub: rows[0].pub,
          rowid: rows[0].rowid,
          username
        }
      : undefined;

  return new ValidResult(result);
}
