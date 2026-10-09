"""
LuciProxy Manager - Cloudflare Analytics Service.
Executes GraphQL Analytics queries against api.cloudflare.com/client/v4/graphql.
Handles authorization failures, dataset availability, and normalized metric extraction.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from .client import CloudflareClient
from .exceptions import GraphQLError, PermissionDeniedError


class AnalyticsService:
    """Service for querying Cloudflare Workers metrics via the GraphQL Analytics API."""

    def __init__(self, client: CloudflareClient):
        self.client = client

    def get_worker_invocations(
        self,
        account_id: str,
        script_name: Optional[str] = None,
        hours: int = 24
    ) -> Dict[str, Any]:
        """
        Queries Cloudflare GraphQL API for worker invocations, errors, and CPU usage.
        Endpoint: POST /client/v4/graphql
        """
        now = datetime.utcnow()
        since = (now - timedelta(hours=hours)).strftime("%Y-%m-%dT%H:%M:%SZ")
        until = now.strftime("%Y-%m-%dT%H:%M:%SZ")

        # GraphQL query requesting low-cardinality aggregated metrics
        query = """
        query GetWorkerMetrics($accountTag: String!, $datetimeStart: String!, $datetimeEnd: String!, $scriptName: String) {
          viewer {
            accounts(filter: { accountTag: $accountTag }) {
              workersInvocationsAdaptive(
                limit: 100
                filter: {
                  datetime_geq: $datetimeStart
                  datetime_leq: $datetimeEnd
                  scriptName: $scriptName
                }
              ) {
                sum {
                  subrequests
                  requests
                  errors
                }
                quantiles {
                  cpuTimeP50
                  cpuTimeP99
                }
              }
            }
          }
        }
        """

        variables = {
            "accountTag": account_id,
            "datetimeStart": since,
            "datetimeEnd": until,
            "scriptName": script_name,
        }

        try:
            data = self.client.graphql(
                query=query,
                variables=variables,
                step="Query Worker Invocations"
            )
            # Normalize response structure
            accounts = data.get("viewer", {}).get("accounts", [])
            if not accounts:
                return {
                    "available": False,
                    "requests": None,
                    "quota": None,
                    "reason": "No account metrics found.",
                }

            invocations = accounts[0].get("workersInvocationsAdaptive", [])
            if not invocations:
                return {
                    "available": True,
                    "requests": 0,
                    "quota": None,
                    "errors": 0,
                    "subrequests": 0,
                    "cpu_time_p50": 0,
                    "cpu_time_p99": 0,
                }

            first = invocations[0]
            sums = first.get("sum", {})
            quantiles = first.get("quantiles", {})

            # Authoritative quota: only populated if returned by the service
            raw_quota = sums.get("quota") or first.get("quota")
            quota_val = int(raw_quota) if (raw_quota is not None and str(raw_quota).isdigit()) else None

            return {
                "available": True,
                "requests": sums.get("requests", 0),
                "quota": quota_val,
                "errors": sums.get("errors", 0),
                "subrequests": sums.get("subrequests", 0),
                "cpu_time_p50": quantiles.get("cpuTimeP50", 0),
                "cpu_time_p99": quantiles.get("cpuTimeP99", 0),
                "since": since,
                "until": until,
            }
        except GraphQLError as e:
            # Plan or token not permitted for GraphQL analytics
            return {
                "available": False,
                "requests": None,
                "quota": None,
                "reason": f"GraphQL Analytics unavailable: {e.message}",
            }
        except PermissionDeniedError:
            return {
                "available": False,
                "requests": None,
                "quota": None,
                "reason": "Token lacks permission for Analytics.",
            }
        except Exception as e:
            return {
                "available": False,
                "requests": None,
                "quota": None,
                "reason": str(e),
            }
