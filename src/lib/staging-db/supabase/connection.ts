/**
 * Staging Postgres connection resolution.
 * Prefer Session pooler (IPv4); keep Direct URL as record / fallback only.
 * Never logs passwords or full URIs.
 */

import { StagingEnvironmentBlockedError } from "../errors.ts";

export type HostCheckResult = {
  status: "PASS" | "FAIL";
  reasons: string[];
};

export type DatabaseConnectionMode = "SESSION_POOLER" | "DIRECT_FALLBACK";

export type StagingPgConnection = {
  mode: DatabaseConnectionMode;
  connectionString: string;
  host: string;
  port: number;
  database: string;
  username: string;
  /** Decoded password for explicit pg Client fields — never log. */
  password: string;
};

export type PoolerCheckBundle = {
  POOLER_URL_CHECK: HostCheckResult;
  POOLER_HOST_CHECK: HostCheckResult;
  POOLER_PROJECT_REF_CHECK: HostCheckResult;
  POOLER_USERNAME_CHECK: HostCheckResult;
  POOLER_PORT_CHECK: HostCheckResult;
  POOLER_DATABASE_CHECK: HostCheckResult;
  POOLER_ALLOWED_HOST_CHECK: HostCheckResult;
  parsedHost: string | null;
  parsedUsername: string | null;
  parsedPort: number | null;
  parsedDatabase: string | null;
};

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function pass(): HostCheckResult {
  return { status: "PASS", reasons: [] };
}

function fail(...reasons: string[]): HostCheckResult {
  return { status: "FAIL", reasons };
}

/**
 * Validate STAGING_DATABASE_POOLER_URL without printing secrets.
 */
export function checkStagingPoolerUrl(
  poolerUrl: string | null,
  projectRef: string | null,
  allowedPoolerHost: string | null,
  productionProjectRef: string | null,
): PoolerCheckBundle {
  if (!poolerUrl) {
    const missing = fail("STAGING_DATABASE_POOLER_URL missing");
    return {
      POOLER_URL_CHECK: missing,
      POOLER_HOST_CHECK: missing,
      POOLER_PROJECT_REF_CHECK: missing,
      POOLER_USERNAME_CHECK: missing,
      POOLER_PORT_CHECK: missing,
      POOLER_DATABASE_CHECK: missing,
      POOLER_ALLOWED_HOST_CHECK: fail(
        "STAGING_ALLOWED_POOLER_HOST not validated (pooler URL missing)",
      ),
      parsedHost: null,
      parsedUsername: null,
      parsedPort: null,
      parsedDatabase: null,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(poolerUrl);
  } catch {
    const bad = fail("STAGING_DATABASE_POOLER_URL is not a valid URL");
    return {
      POOLER_URL_CHECK: bad,
      POOLER_HOST_CHECK: bad,
      POOLER_PROJECT_REF_CHECK: bad,
      POOLER_USERNAME_CHECK: bad,
      POOLER_PORT_CHECK: bad,
      POOLER_DATABASE_CHECK: bad,
      POOLER_ALLOWED_HOST_CHECK: bad,
      parsedHost: null,
      parsedUsername: null,
      parsedPort: null,
      parsedDatabase: null,
    };
  }

  const urlCheckReasons: string[] = [];
  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    urlCheckReasons.push("protocol must be postgresql: or postgres:");
  }

  const host = parsed.hostname.toLowerCase();
  const hostReasons: string[] = [];
  if (!host.endsWith(".pooler.supabase.com") || host === "pooler.supabase.com") {
    hostReasons.push("hostname must end with .pooler.supabase.com");
  }

  const username = decodeURIComponent(parsed.username || "");
  const usernameReasons: string[] = [];
  const refReasons: string[] = [];
  if (!projectRef) {
    usernameReasons.push("STAGING_PROJECT_REF missing");
    refReasons.push("STAGING_PROJECT_REF missing");
  } else {
    const expectedUser = `postgres.${projectRef}`;
    if (username !== expectedUser) {
      usernameReasons.push(
        "username must be postgres.<STAGING_PROJECT_REF> (expected postgres.<ref>)",
      );
    }
    if (!username.includes(projectRef)) {
      refReasons.push("pooler username does not include STAGING_PROJECT_REF");
    }
  }

  if (
    productionProjectRef &&
    productionProjectRef.trim() &&
    (username.includes(productionProjectRef.trim()) ||
      host.includes(productionProjectRef.trim().toLowerCase()) ||
      poolerUrl.toLowerCase().includes(productionProjectRef.trim().toLowerCase()))
  ) {
    refReasons.push("Production Project Ref detected in pooler URL — blocked");
  }

  const port = parsed.port ? Number(parsed.port) : 5432;
  const portReasons: string[] = [];
  if (port !== 5432) {
    portReasons.push("port must be 5432 (Session pooler)");
  }

  const database = (parsed.pathname || "/").replace(/^\//, "") || "postgres";
  const dbReasons: string[] = [];
  if (database !== "postgres") {
    dbReasons.push("database name must be postgres");
  }

  const allowedReasons: string[] = [];
  if (!allowedPoolerHost) {
    allowedReasons.push("STAGING_ALLOWED_POOLER_HOST missing");
  } else if (host !== allowedPoolerHost.toLowerCase()) {
    allowedReasons.push(
      "STAGING_ALLOWED_POOLER_HOST != STAGING_DATABASE_POOLER_URL hostname",
    );
  }

  return {
    POOLER_URL_CHECK: urlCheckReasons.length ? fail(...urlCheckReasons) : pass(),
    POOLER_HOST_CHECK: hostReasons.length ? fail(...hostReasons) : pass(),
    POOLER_PROJECT_REF_CHECK: refReasons.length ? fail(...refReasons) : pass(),
    POOLER_USERNAME_CHECK: usernameReasons.length
      ? fail(...usernameReasons)
      : pass(),
    POOLER_PORT_CHECK: portReasons.length ? fail(...portReasons) : pass(),
    POOLER_DATABASE_CHECK: dbReasons.length ? fail(...dbReasons) : pass(),
    POOLER_ALLOWED_HOST_CHECK: allowedReasons.length
      ? fail(...allowedReasons)
      : pass(),
    parsedHost: host,
    parsedUsername: username || null,
    parsedPort: port,
    parsedDatabase: database,
  };
}

export function poolerChecksOk(bundle: PoolerCheckBundle): boolean {
  return (
    bundle.POOLER_URL_CHECK.status === "PASS" &&
    bundle.POOLER_HOST_CHECK.status === "PASS" &&
    bundle.POOLER_PROJECT_REF_CHECK.status === "PASS" &&
    bundle.POOLER_USERNAME_CHECK.status === "PASS" &&
    bundle.POOLER_PORT_CHECK.status === "PASS" &&
    bundle.POOLER_DATABASE_CHECK.status === "PASS" &&
    bundle.POOLER_ALLOWED_HOST_CHECK.status === "PASS"
  );
}

/**
 * Prefer Session pooler; fall back to Direct only when pooler unset.
 * When pooler is set but invalid → throw (do not silently fall back).
 */
export function resolveStagingPgConnection(
  env: NodeJS.ProcessEnv = process.env,
): StagingPgConnection {
  const pooler = (env.STAGING_DATABASE_POOLER_URL || "").trim();
  const direct = (env.STAGING_DATABASE_URL || "").trim();
  const projectRef = (env.STAGING_PROJECT_REF || "").trim() || null;
  const allowedPoolerHost =
    (env.STAGING_ALLOWED_POOLER_HOST || "").trim() || null;
  const productionRef =
    (env.SUPABASE_PRODUCTION_PROJECT_REF || "").trim() || null;

  if (pooler) {
    const checks = checkStagingPoolerUrl(
      pooler,
      projectRef,
      allowedPoolerHost,
      productionRef,
    );
    if (!poolerChecksOk(checks)) {
      const reasons = [
        ...checks.POOLER_URL_CHECK.reasons,
        ...checks.POOLER_HOST_CHECK.reasons,
        ...checks.POOLER_PROJECT_REF_CHECK.reasons,
        ...checks.POOLER_USERNAME_CHECK.reasons,
        ...checks.POOLER_PORT_CHECK.reasons,
        ...checks.POOLER_DATABASE_CHECK.reasons,
        ...checks.POOLER_ALLOWED_HOST_CHECK.reasons,
      ];
      throw new StagingEnvironmentBlockedError(
        reasons.join("; ") || "Invalid STAGING_DATABASE_POOLER_URL",
        { checks: "POOLER_URL_CHECK" },
      );
    }
    let password = "";
    try {
      password = decodeURIComponent(new URL(pooler).password);
    } catch {
      password = "";
    }
    return {
      mode: "SESSION_POOLER",
      connectionString: pooler,
      host: checks.parsedHost!,
      port: checks.parsedPort!,
      database: checks.parsedDatabase!,
      username: checks.parsedUsername!,
      password,
    };
  }

  if (!direct) {
    throw new StagingEnvironmentBlockedError(
      "STAGING_DATABASE_POOLER_URL and STAGING_DATABASE_URL both missing",
    );
  }
  const host = hostOf(direct);
  if (!host) {
    throw new StagingEnvironmentBlockedError(
      "STAGING_DATABASE_URL host could not be parsed",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(direct);
  } catch {
    throw new StagingEnvironmentBlockedError(
      "STAGING_DATABASE_URL is not a valid URL",
    );
  }
  return {
    mode: "DIRECT_FALLBACK",
    connectionString: direct,
    host,
    port: parsed.port ? Number(parsed.port) : 5432,
    database: (parsed.pathname || "/").replace(/^\//, "") || "postgres",
    username: decodeURIComponent(parsed.username || ""),
    password: decodeURIComponent(parsed.password || ""),
  };
}

/** Safe summary for logs/reports — never includes password or full URI. */
export function describeStagingPgConnection(
  conn: StagingPgConnection,
): Record<string, unknown> {
  return {
    DATABASE_CONNECTION_MODE: conn.mode,
    host: conn.host,
    port: conn.port,
    database: conn.database,
    username: conn.username,
  };
}
