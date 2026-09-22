/**
 * Reading Québec's codified-legislation dataset out of Données Québec's
 * CKAN API.
 *
 * LégisQuébec itself is reachable — the earlier "unreachable" finding does
 * not reproduce; the refusal is a CloudFront WAF rule keyed on `User-Agent`,
 * observed flipping between 403 and 200 on identical URLs seconds apart
 * (docs/LAW_MONITORING.md § Sourcing evaluation for Ontario and Québec). That
 * makes it exactly the wrong thing to hash: whole-page hashing would produce
 * a false alert on a normal day from the block alone, on top of an embedded
 * `historique=YYYYMMDD` value that changes on every request regardless of
 * any amendment.
 *
 * Données Québec publishes the same underlying corpus as a first-party,
 * no-bot-filter, machine-readable dataset instead:
 *
 *   https://www.donneesquebec.ca/recherche/api/3/action/package_show
 *     ?id=c8433300-f752-4815-8ea2-69cad416dd80
 *
 * ("Lois et règlements codifiés du Québec" — dataset id verified live and
 * byte-stable across two independent fetches, 2026-08-05.) Its "Lois"
 * resource is a dated zip (`20260720_lois.zip`) containing every codified
 * Act in XML, refreshed on an "as needed" cadence; the resource's
 * `last_modified` timestamp and the date embedded in its filename both move
 * when a new release lands.
 *
 * This module watches the dataset at that level — it does not yet download
 * and open the zip to read `Statutes_EN_Status.txt`, which is what would
 * name the *specific* statutes that changed (docs/LAW_MONITORING.md records
 * this as the next layer, not built here). Today: any change to the "Lois"
 * resource is reported against every Quebec law_name configured to watch it,
 * same as an `html` source reports "something on this page changed" without
 * saying what.
 */

interface CkanResource {
  id?: string
  name?: string
  last_modified?: string
  url?: string
  format?: string
}

export interface QuebecPackageFacts {
  resourceId: string
  resourceName: string
  lastModified: string
  url: string
}

export type QuebecPackageVerdict =
  | { readonly ok: true; readonly facts: QuebecPackageFacts }
  | { readonly ok: false; readonly reason: 'invalid-json'; readonly detail: string }
  | { readonly ok: false; readonly reason: 'api-error'; readonly detail: string }
  | { readonly ok: false; readonly reason: 'no-resources'; readonly detail: string }
  | { readonly ok: false; readonly reason: 'resource-missing'; readonly detail: string }

/**
 * Parse *and* confirm the named resource (e.g. `"Lois"`) is present with a
 * `last_modified` value — the same "prove this is the thing we think it is"
 * discipline the Ontario and Justice Canada sources apply, so a dataset
 * reorganization surfaces as `broken` rather than silently stopping
 * detection.
 */
export function assessQuebecPackage(
  jsonText: string,
  expectedResourceName: string,
): QuebecPackageVerdict {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return {
      ok: false,
      reason: 'invalid-json',
      detail: 'Response was not valid JSON — the CKAN API shape may have changed.',
    }
  }

  const body = parsed as { success?: boolean; result?: { resources?: CkanResource[] } }
  if (body.success !== true) {
    return {
      ok: false,
      reason: 'api-error',
      detail: 'CKAN package_show did not report success=true.',
    }
  }

  const resources = body.result?.resources
  if (!Array.isArray(resources) || resources.length === 0) {
    return {
      ok: false,
      reason: 'no-resources',
      // A zero-resource result is an outage, never "no change" — same guard as Ontario's zero-version case.
      detail: 'The dataset returned zero resources.',
    }
  }

  const resource = resources.find((r) => r.name === expectedResourceName)
  if (resource === undefined || !resource.last_modified) {
    return {
      ok: false,
      reason: 'resource-missing',
      detail: `No resource named "${expectedResourceName}" with a last_modified value — it may have been renamed or restructured.`,
    }
  }

  return {
    ok: true,
    facts: {
      resourceId: resource.id ?? '',
      resourceName: resource.name ?? expectedResourceName,
      lastModified: resource.last_modified,
      url: resource.url ?? '',
    },
  }
}

/**
 * Fingerprint stored in `law_page_hashes.content_hash`. Both the timestamp
 * and the URL are included because the dated filename (e.g.
 * `20260720_lois.zip`) is itself informative and has moved independently of
 * `last_modified` in principle, even though neither has been observed to.
 */
export function quebecFingerprint(facts: QuebecPackageFacts): string {
  return `quebec-ckan:${facts.lastModified}|${facts.url}`
}
