/**
 * Programmatic SEO — minimal, high-intent dev problems.
 *
 * Each entry renders a lean /fix/[slug] page optimized for:
 *  - Google search (high-intent dev queries)
 *  - AI search (FAQ schema)
 *  - Direct conversion into /fix usage
 *
 * Rules:
 *  - Short answer (2–3 lines)
 *  - Example output must be actionable, safe-first
 *  - No blog-style fluff
 */

export type IssueCategory =
  | "kubernetes"
  | "aws"
  | "api"
  | "dns-ssl"
  | "cdn"
  | "database"
  | "docker"
  | "nginx";

export type Issue = {
  slug: string;
  title: string;
  category: IssueCategory;
  description: string;
  shortAnswer: string;
  exampleInput: string;
  exampleOutput: string;
  causes: string[];
  fix: string[];
};

type IssueLike = Issue & {
  source?: "generated";
};

export const issues: Issue[] = [
  /* =================== KUBERNETES =================== */
  {
    slug: "kubernetes-crashloopbackoff",
    title: "Kubernetes CrashLoopBackOff",
    category: "kubernetes",
    description: "Pod restarting repeatedly due to config or resource issue.",
    shortAnswer:
      "A pod in CrashLoopBackOff is failing on startup and being restarted by the kubelet. The most common causes are OOMKilled, a bad command/args, or a missing config/secret.",
    exampleInput:
      "Kubernetes pod stuck in CrashLoopBackOff after config update",
    exampleOutput:
      "Check container logs for the failure reason (`kubectl logs <pod> --previous`), validate recent config changes, and confirm memory limits are sufficient before restarting the pod.",
    causes: [
      "OOMKilled from insufficient memory limits",
      "Failed liveness probe during warm-up",
      "Missing ConfigMap or Secret reference",
      "Bad command or entrypoint args",
    ],
    fix: [
      "Run `kubectl logs <pod> --previous` to see the last crash output",
      "Check `kubectl describe pod <pod>` for the exit reason (OOMKilled, Error, etc.)",
      "Validate resource limits and liveness probe `initialDelaySeconds`",
      "Verify referenced ConfigMaps and Secrets exist in the same namespace",
    ],
  },
  {
    slug: "kubernetes-imagepullbackoff",
    title: "Kubernetes ImagePullBackOff",
    category: "kubernetes",
    description: "Pod cannot pull its container image.",
    shortAnswer:
      "ImagePullBackOff means the kubelet can't fetch the image. Usually a wrong tag, a missing registry credential, or a typo in the image path.",
    exampleInput: "Pod shows ImagePullBackOff for my private ECR image",
    exampleOutput:
      "Verify the image tag exists, confirm the `imagePullSecrets` reference a valid docker-registry secret, and check that the node has network access to the registry.",
    causes: [
      "Invalid image name or tag",
      "Missing or expired registry credentials",
      "Private registry not reachable from node",
      "Rate limiting by public registry (Docker Hub)",
    ],
    fix: [
      "Run `kubectl describe pod <pod>` and read the `Events` section",
      "Confirm the image exists via `docker pull <image>` from a workstation",
      "Check `imagePullSecrets` on the pod/service account",
      "For ECR/GCR, refresh the token and recreate the secret",
    ],
  },
  {
    slug: "kubernetes-pod-pending",
    title: "Kubernetes Pod Stuck in Pending",
    category: "kubernetes",
    description: "Pod cannot be scheduled onto a node.",
    shortAnswer:
      "A Pending pod hasn't been assigned to a node. The scheduler is usually blocked by insufficient CPU/memory, unmatched node selectors, or unsatisfied taints.",
    exampleInput: "My deployment pods stay in Pending for minutes",
    exampleOutput:
      "Run `kubectl describe pod <pod>` and check the `Events`. Most Pending issues are scheduling — inspect node resources, taints, and PVC availability before scaling the cluster.",
    causes: [
      "Insufficient CPU or memory across nodes",
      "Unbound PersistentVolumeClaim",
      "Node taints not tolerated by the pod",
      "Node selector or affinity rules with no match",
    ],
    fix: [
      "Describe the pod and read the scheduler event",
      "Check node capacity via `kubectl top nodes`",
      "Confirm PVCs are bound and StorageClass exists",
      "Review taints/tolerations and node affinity rules",
    ],
  },
  {
    slug: "kubernetes-oomkilled",
    title: "Kubernetes OOMKilled",
    category: "kubernetes",
    description: "Container killed by the kernel for exceeding memory limits.",
    shortAnswer:
      "OOMKilled means the process used more memory than its limit. Raise the limit cautiously, or profile the workload — a leak will just exhaust the new limit too.",
    exampleInput: "My container keeps getting OOMKilled under load",
    exampleOutput:
      "Check actual memory usage vs limit (`kubectl top pod`). If usage is a steady creep, investigate a leak before raising limits. For spiky workloads, raise the memory limit and set a matching request.",
    causes: [
      "Memory limit set too low for real workload",
      "Memory leak in the application",
      "JVM heap not aligned with container limit",
      "Unbounded in-memory cache or buffer",
    ],
    fix: [
      "Run `kubectl top pod` to compare usage vs limit",
      "Profile the app with heap/pprof to detect leaks",
      "For JVMs, set `-XX:MaxRAMPercentage` under the limit",
      "Increase memory limit and matching request",
    ],
  },
  {
    slug: "kubernetes-service-unreachable",
    title: "Kubernetes Service Unreachable",
    category: "kubernetes",
    description: "Pods cannot reach a Service ClusterIP or DNS name.",
    shortAnswer:
      "If a Service is unreachable, the endpoints list is usually empty — a label/selector mismatch, or the target pods aren't Ready. CoreDNS can also be the cause.",
    exampleInput: "Pod can't connect to internal service on cluster.local",
    exampleOutput:
      "Run `kubectl get endpoints <service>` — if empty, fix the Service selector or pod readiness. If populated, test DNS with a busybox pod before changing network policies.",
    causes: [
      "Service selector doesn't match pod labels",
      "Target pods are not Ready",
      "NetworkPolicy blocking traffic",
      "CoreDNS issue or wrong FQDN",
    ],
    fix: [
      "Check `kubectl get endpoints <service>` — non-empty?",
      "Confirm pod labels match the Service selector",
      "Review NetworkPolicies in the namespace",
      "Test DNS from a debug pod: `nslookup <service>`",
    ],
  },

  /* =================== AWS =================== */
  {
    slug: "aws-lambda-timeout",
    title: "AWS Lambda Timeout",
    category: "aws",
    description: "Lambda function exceeds its configured timeout.",
    shortAnswer:
      "Lambda timeouts are almost always downstream latency (DB, HTTP) or cold-start + large init. Raise the timeout only after you confirm where the time is being spent.",
    exampleInput: "AWS Lambda timing out after 3 seconds calling DynamoDB",
    exampleOutput:
      "Check X-Ray traces or CloudWatch logs for the slow segment. Verify VPC-attached Lambdas have NAT/endpoints configured — cold starts on VPC can push past the default timeout.",
    causes: [
      "Downstream API or DB latency",
      "Cold start in a VPC without adequate ENI capacity",
      "Heavy init code outside the handler",
      "Timeout set too low for real p99",
    ],
    fix: [
      "Inspect CloudWatch duration metrics (p50 vs p99)",
      "Enable X-Ray to find the slow segment",
      "Move init logic outside the handler for warm reuse",
      "Raise the timeout only after root cause is known",
    ],
  },
  {
    slug: "aws-s3-access-denied",
    title: "AWS S3 AccessDenied",
    category: "aws",
    description: "S3 request rejected by IAM or bucket policy.",
    shortAnswer:
      "S3 AccessDenied is usually an IAM policy, a bucket policy block, or a missing `s3:GetObject` on the exact object path (not just the bucket).",
    exampleInput: "S3 GetObject returns AccessDenied from my Lambda",
    exampleOutput:
      "Check the caller's IAM role for `s3:GetObject` on `arn:aws:s3:::bucket/*`. Then review bucket policy, Block Public Access, and KMS key permissions if the object is encrypted.",
    causes: [
      "IAM role missing `s3:GetObject` on the object ARN",
      "Bucket policy explicitly denying the principal",
      "Object encrypted with a KMS key the caller can't use",
      "Block Public Access overriding a bucket policy",
    ],
    fix: [
      "Simulate the call with IAM Policy Simulator",
      "Verify bucket policy doesn't `Deny` the principal",
      "Grant `kms:Decrypt` on the bucket's KMS key",
      "Check Block Public Access settings",
    ],
  },
  {
    slug: "aws-ecs-task-not-starting",
    title: "AWS ECS Task Fails to Start",
    category: "aws",
    description: "ECS task stops immediately or never becomes healthy.",
    shortAnswer:
      "Failed ECS tasks usually die on image pull, secret fetch, or health check. The stopped reason in the task details tells you which one.",
    exampleInput: "ECS Fargate task stops with exit code 1 right after start",
    exampleOutput:
      "Open the stopped task and read `Stopped reason`. For image pull failures, check the task role and ECR permissions. For exit 1, stream CloudWatch logs for the container.",
    causes: [
      "Task execution role missing ECR or Secrets Manager permissions",
      "Container command fails on boot",
      "Health check grace period too short",
      "Secret or environment variable referenced but not set",
    ],
    fix: [
      "Read `Stopped reason` on the failed task",
      "Ensure execution role has `AmazonECSTaskExecutionRolePolicy`",
      "Increase `healthCheckGracePeriodSeconds`",
      "Tail CloudWatch logs for the failing container",
    ],
  },
  {
    slug: "aws-rds-connection-timeout",
    title: "AWS RDS Connection Timeout",
    category: "aws",
    description: "Clients cannot establish a connection to RDS.",
    shortAnswer:
      "RDS connection timeouts are almost always a security group, subnet route, or a saturated connection pool on the DB.",
    exampleInput: "Application Lambda can't connect to RDS Postgres",
    exampleOutput:
      "Confirm the Lambda's SG is allowed as a source on the RDS SG on port 5432. If allowed, check `pg_stat_activity` for connection exhaustion before adding retries.",
    causes: [
      "Security group does not allow the caller",
      "Lambda in a subnet without a route to RDS",
      "DB `max_connections` exhausted",
      "Publicly accessible flag mismatched with network",
    ],
    fix: [
      "Verify SG ingress from caller SG on the DB port",
      "Confirm VPC routing and subnet associations",
      "Check active connections: `SELECT count(*) FROM pg_stat_activity`",
      "Use RDS Proxy to pool connections",
    ],
  },
  {
    slug: "aws-cloudfront-403",
    title: "AWS CloudFront Returns 403",
    category: "aws",
    description: "CloudFront distribution responding with 403 Forbidden.",
    shortAnswer:
      "CloudFront 403 is usually an S3 origin permission, an OAC/OAI misconfig, or a WAF rule blocking the request.",
    exampleInput: "CloudFront returns 403 for a valid S3 object",
    exampleOutput:
      "Check the origin — for S3, verify Origin Access Control and bucket policy. If WAF is attached, inspect sampled requests for a matched rule before tweaking origin config.",
    causes: [
      "S3 bucket policy doesn't grant CloudFront OAC",
      "Object does not exist at the requested path",
      "WAF rule blocking the request",
      "Signed URL expired or invalid",
    ],
    fix: [
      "Verify OAC/OAI is attached and bucket policy updated",
      "Inspect WAF sampled requests for blocks",
      "Check object exists at exact key",
      "Invalidate cache after origin changes",
    ],
  },

  /* =================== API =================== */
  {
    slug: "api-latency-after-deploy",
    title: "API Latency Spike After Deploy",
    category: "api",
    description: "Latency increased immediately after a deployment.",
    shortAnswer:
      "Sudden latency after deploy is usually a DB query regression, a new blocking call, or a cold cache. Roll back is the safest first move while you investigate.",
    exampleInput: "P99 latency doubled after latest deploy",
    exampleOutput:
      "Compare the last two deploys — review DB query plans and outbound calls. Roll back if customer impact is active, then diff commits and enable slow-query logging.",
    causes: [
      "New slow query or N+1 introduced",
      "External API call added to hot path",
      "Cache invalidated by the deploy",
      "Resource limits changed (CPU throttling)",
    ],
    fix: [
      "Roll back to the previous version if impact is active",
      "Diff the two commits and look for DB or HTTP calls",
      "Enable slow-query logs and EXPLAIN the top offenders",
      "Check CPU throttling and GC metrics",
    ],
  },
  {
    slug: "api-500-internal-server-error",
    title: "API Returns 500 Internal Server Error",
    category: "api",
    description: "Endpoint returning 500 on a subset of requests.",
    shortAnswer:
      "500 errors are unhandled exceptions. The correct first step is to correlate a failing request ID with a stack trace in logs — not to add retries.",
    exampleInput: "/api/users returns 500 for some users only",
    exampleOutput:
      "Grep logs for the failing request ID and read the stack trace. Common causes: null from a DB join, a timeout from a downstream service, or a deserialization error.",
    causes: [
      "Unhandled exception in a code path",
      "Downstream service returning unexpected payload",
      "Null or missing field in DB row",
      "Timeout on an external call",
    ],
    fix: [
      "Find the stack trace via the request ID",
      "Add a guard for the specific null/missing field",
      "Wrap external calls with explicit timeouts",
      "Add a regression test for the failing case",
    ],
  },
  {
    slug: "api-502-bad-gateway",
    title: "API 502 Bad Gateway",
    category: "api",
    description: "Proxy or load balancer cannot reach the upstream.",
    shortAnswer:
      "502 means your proxy got nothing usable from upstream — the app crashed, closed the connection, or timed out. Check upstream health before tweaking the proxy.",
    exampleInput: "Nginx returning 502 intermittently",
    exampleOutput:
      "Check upstream app health (restarts, OOMs). Inspect Nginx error log for `upstream prematurely closed connection` — it points to a crash or a keepalive mismatch.",
    causes: [
      "Upstream app crashed or restarted",
      "Keepalive timeout mismatch between proxy and upstream",
      "Upstream timed out on a slow request",
      "Upstream port/host wrong in config",
    ],
    fix: [
      "Confirm upstream process is running and healthy",
      "Tail proxy error log for exact cause",
      "Align keepalive timeouts (upstream > proxy)",
      "Check upstream resource usage for restarts",
    ],
  },
  {
    slug: "api-cors-error",
    title: "API CORS Error",
    category: "api",
    description: "Browser blocks a cross-origin request due to CORS.",
    shortAnswer:
      "CORS errors are a server response problem, not a client problem. The missing piece is usually `Access-Control-Allow-Origin` (or preflight handling for non-simple requests).",
    exampleInput: "Fetch from app.example.com to api.example.com blocked by CORS",
    exampleOutput:
      "Confirm the server returns `Access-Control-Allow-Origin` matching the caller. For credentialed requests, use an explicit origin — not `*` — and include `Access-Control-Allow-Credentials: true`.",
    causes: [
      "Missing `Access-Control-Allow-Origin` response header",
      "Preflight OPTIONS not handled",
      "Credentialed request with wildcard origin",
      "Missing allowed headers or methods",
    ],
    fix: [
      "Return `Access-Control-Allow-Origin` with the caller's origin",
      "Handle OPTIONS preflight and return 204",
      "Add `Access-Control-Allow-Credentials: true` if needed",
      "Include `Access-Control-Allow-Headers` for custom headers",
    ],
  },
  {
    slug: "api-rate-limit-exceeded",
    title: "API Rate Limit Exceeded",
    category: "api",
    description: "Requests blocked by 429 Too Many Requests.",
    shortAnswer:
      "429 responses mean the caller hit a rate limit. The fix is to read `Retry-After`, back off, and batch — not to hammer the endpoint with retries.",
    exampleInput: "Third-party API returning 429 in bursts",
    exampleOutput:
      "Implement exponential backoff honoring `Retry-After`, add request batching, and cache responses. Only raise your quota after the caller's behavior is efficient.",
    causes: [
      "Bursty request pattern without batching",
      "Retry storm after a transient error",
      "Cache miss amplifying load on the provider",
      "Quota genuinely too low for workload",
    ],
    fix: [
      "Honor `Retry-After` in all retries",
      "Add exponential backoff with jitter",
      "Batch requests where the API allows it",
      "Cache stable responses aggressively",
    ],
  },

  /* =================== DNS / SSL =================== */
  {
    slug: "ssl-handshake-failed",
    title: "SSL Handshake Failed",
    category: "dns-ssl",
    description: "TLS negotiation fails between client and server.",
    shortAnswer:
      "SSL handshake failures are almost always a certificate chain, a hostname mismatch, or a TLS version / cipher mismatch.",
    exampleInput: "curl fails with SSL_ERROR_SYSCALL on handshake",
    exampleOutput:
      "Check certificate chain and DNS resolution before rolling back. Run `openssl s_client -connect host:443` to inspect the chain and confirm SAN includes the hostname.",
    causes: [
      "Missing intermediate certificate",
      "Hostname not in cert SAN",
      "Unsupported TLS version (1.0/1.1 disabled)",
      "Clock skew between client and server",
    ],
    fix: [
      "Run `openssl s_client -showcerts -connect host:443`",
      "Install the intermediate cert on the server",
      "Verify SAN matches the hostname",
      "Sync system clocks (NTP)",
    ],
  },
  {
    slug: "dns-not-resolving",
    title: "DNS Name Not Resolving",
    category: "dns-ssl",
    description: "A domain or service name fails to resolve.",
    shortAnswer:
      "DNS resolution failures are usually a missing record, a TTL still propagating, or a local resolver issue. Start with `dig` against `8.8.8.8` to rule the local resolver out.",
    exampleInput: "myapp.example.com returns NXDOMAIN",
    exampleOutput:
      "Run `dig myapp.example.com @8.8.8.8` to compare public resolution with your resolver. If 8.8.8.8 answers, it's local/cache. If not, check the authoritative zone for the record.",
    causes: [
      "Record missing at the authoritative zone",
      "TTL still propagating after a change",
      "Local resolver cache holding stale answer",
      "CNAME pointing to a deleted target",
    ],
    fix: [
      "Query authoritative NS directly with `dig +trace`",
      "Compare public vs local resolver answers",
      "Flush local DNS cache",
      "Verify the target of any CNAME",
    ],
  },
  {
    slug: "ssl-certificate-expired",
    title: "SSL Certificate Expired",
    category: "dns-ssl",
    description: "Browser or client rejects an expired certificate.",
    shortAnswer:
      "An expired cert needs to be reissued — there is no workaround on the client side that doesn't compromise security. Renewals should be automated.",
    exampleInput: "NET::ERR_CERT_DATE_INVALID on our main domain",
    exampleOutput:
      "Renew the certificate now via ACME/Let's Encrypt or your provider. After renewal, confirm the new chain with `openssl s_client` and set up auto-renewal monitoring.",
    causes: [
      "Auto-renewal job broken or disabled",
      "Manual cert not tracked in calendar",
      "ACME challenge no longer reachable",
      "Wrong cert served by load balancer",
    ],
    fix: [
      "Issue a new certificate immediately",
      "Verify chain with `openssl s_client`",
      "Enable automated renewal (cert-manager, acme.sh)",
      "Add expiry monitoring alerts",
    ],
  },
  {
    slug: "cloudflare-5xx-error",
    title: "Cloudflare 5xx Error",
    category: "cdn",
    description: "Cloudflare returning 502/520/521/522 to visitors.",
    shortAnswer:
      "Cloudflare 5xx codes each point to a specific origin problem — 521 means origin down, 522 means origin timed out, 520 means an unknown origin response.",
    exampleInput: "Users seeing Cloudflare Error 522 intermittently",
    exampleOutput:
      "522 = origin timeout. Check origin health, firewall rules blocking Cloudflare IPs, and keepalive settings. Rule out origin before tuning Cloudflare timeouts.",
    causes: [
      "Origin server down or overloaded",
      "Firewall blocking Cloudflare IP ranges",
      "Origin keepalive too short",
      "Long-running request past CF timeout",
    ],
    fix: [
      "Confirm origin is reachable from a non-CF IP",
      "Allow Cloudflare IPs at the origin firewall",
      "Increase origin keepalive timeout",
      "Move long requests behind a queue",
    ],
  },
  {
    slug: "cloudflare-too-many-redirects",
    title: "Cloudflare Too Many Redirects",
    category: "cdn",
    description: "Redirect loop between Cloudflare and origin.",
    shortAnswer:
      "Redirect loops on Cloudflare are almost always an SSL mode mismatch — Flexible mode with an origin that also redirects to HTTPS loops forever.",
    exampleInput: "ERR_TOO_MANY_REDIRECTS after enabling Cloudflare",
    exampleOutput:
      "Set SSL/TLS mode to Full (strict) if your origin serves HTTPS, and remove any HTTP→HTTPS redirect at the origin. Flexible + origin HTTPS redirect creates an infinite loop.",
    causes: [
      "Cloudflare SSL set to Flexible + origin forces HTTPS",
      "Page Rule conflicting with origin redirect",
      "Origin redirect chain misconfigured",
      "Worker script issuing redirects",
    ],
    fix: [
      "Change SSL/TLS mode to Full or Full (strict)",
      "Remove origin HTTP→HTTPS redirect if on Flexible",
      "Audit Page Rules and Workers",
      "Test with `curl -IL` to see the chain",
    ],
  },

  /* =================== DOCKER =================== */
  {
    slug: "docker-container-exited",
    title: "Docker Container Exited Immediately",
    category: "docker",
    description: "Container exits right after `docker run`.",
    shortAnswer:
      "A container that exits immediately either ran a one-shot command that finished, or crashed on start. `docker logs <container>` tells you which.",
    exampleInput: "docker run my-app exits with code 0 right away",
    exampleOutput:
      "Run `docker logs <container>` to see stdout/stderr. Exit 0 with no logs usually means the CMD finished (missing long-running process). Non-zero exits print the error.",
    causes: [
      "CMD/ENTRYPOINT runs and completes (no daemon)",
      "Unhandled exception during boot",
      "Missing required env var or mount",
      "Port already in use inside container network",
    ],
    fix: [
      "Tail `docker logs <container>`",
      "Run interactively with `docker run -it --entrypoint sh`",
      "Verify env vars and volume mounts",
      "Ensure the process stays foreground (not daemonized)",
    ],
  },
  {
    slug: "docker-no-space-left",
    title: "Docker No Space Left on Device",
    category: "docker",
    description: "Docker operations fail due to exhausted disk.",
    shortAnswer:
      "Docker fills disk with old images, dangling layers, and stopped containers. `docker system prune` reclaims most of it safely.",
    exampleInput: "Build fails with 'no space left on device'",
    exampleOutput:
      "Run `docker system df` to see usage, then `docker system prune -a --volumes` to reclaim. For long-term, set log rotation on the daemon and prune unused images weekly.",
    causes: [
      "Unpruned dangling images and build cache",
      "Large container logs without rotation",
      "Orphaned volumes from removed containers",
      "Overlay2 directory filled the host",
    ],
    fix: [
      "Run `docker system df` then `docker system prune -a --volumes`",
      "Enable log rotation: `max-size` in daemon.json",
      "Remove unused volumes: `docker volume prune`",
      "Move Docker data root to a larger disk",
    ],
  },
  {
    slug: "docker-port-already-allocated",
    title: "Docker Bind: Port Already Allocated",
    category: "docker",
    description: "Port binding fails because another process holds it.",
    shortAnswer:
      "Another process — often a lingering container or a host service — is holding the port. `lsof -i :PORT` on the host tells you who.",
    exampleInput: "Error starting: Bind for 0.0.0.0:8080 failed: port allocated",
    exampleOutput:
      "Find the holder with `lsof -i :8080` or `ss -tlnp`. Stop the conflicting container (`docker ps`) or change the published port (`-p 8081:8080`).",
    causes: [
      "Previous container still running or zombie",
      "Host service bound to the same port",
      "Another Compose project using the port",
      "Port reserved by the OS",
    ],
    fix: [
      "List holders: `lsof -i :<port>` or `ss -tlnp`",
      "Stop the conflicting container or service",
      "Change the published port mapping",
      "Check `docker ps -a` for stopped containers",
    ],
  },

  /* =================== NGINX =================== */
  {
    slug: "nginx-502-error",
    title: "Nginx 502 Bad Gateway",
    category: "nginx",
    description: "Nginx cannot reach or get a valid response from upstream.",
    shortAnswer:
      "Nginx 502 is an upstream problem. The error log shows the exact cause — connection refused, timeout, or premature close.",
    exampleInput: "Nginx returns 502 for requests to upstream app",
    exampleOutput:
      "Read `/var/log/nginx/error.log` — look for `connect() failed`, `upstream timed out`, or `prematurely closed connection`. Each maps to a different upstream issue.",
    causes: [
      "Upstream app not listening on the expected port",
      "Upstream timed out (slow endpoint)",
      "Upstream closed connection (crash/restart)",
      "SELinux blocking nginx outbound (on RHEL)",
    ],
    fix: [
      "Tail nginx error log for the specific reason",
      "Curl the upstream directly from the nginx host",
      "Increase `proxy_read_timeout` if needed",
      "Set `setsebool -P httpd_can_network_connect 1` on SELinux",
    ],
  },
  {
    slug: "nginx-504-gateway-timeout",
    title: "Nginx 504 Gateway Timeout",
    category: "nginx",
    description: "Nginx timed out waiting for upstream.",
    shortAnswer:
      "504 = upstream took longer than `proxy_read_timeout`. Raise the timeout only after you confirm the upstream isn't actually stuck.",
    exampleInput: "Nginx 504 after 60 seconds on a long export endpoint",
    exampleOutput:
      "Confirm the upstream actually returns eventually. If so, raise `proxy_read_timeout` for that location block — or move the long work behind a job queue + polling.",
    causes: [
      "Upstream genuinely slow for this request",
      "`proxy_read_timeout` too aggressive",
      "Upstream deadlocked or blocked on a lock",
      "Missing index causing slow DB query",
    ],
    fix: [
      "Time the upstream directly with curl",
      "Raise `proxy_read_timeout` on the route",
      "Move long work to async job + polling",
      "Profile the slow path (DB, external call)",
    ],
  },
  {
    slug: "nginx-413-request-too-large",
    title: "Nginx 413 Request Entity Too Large",
    category: "nginx",
    description: "Upload rejected because it exceeds body size limit.",
    shortAnswer:
      "413 comes from `client_max_body_size`. Default is 1MB — raise it on the server/location block, and match the setting on any upstream app.",
    exampleInput: "File upload over 1MB returns 413",
    exampleOutput:
      "Set `client_max_body_size 50M;` in the relevant `server {}` or `location {}` block and reload nginx. Also confirm the upstream app accepts the same size.",
    causes: [
      "`client_max_body_size` left at 1MB default",
      "Setting scoped to wrong block (http vs location)",
      "Upstream app has its own body limit",
      "CDN in front also limits body size",
    ],
    fix: [
      "Add `client_max_body_size 50M;` to the location",
      "Reload nginx: `nginx -s reload`",
      "Raise upstream app's body limit to match",
      "Check CDN body size settings",
    ],
  },

  /* =================== DATABASE =================== */
  {
    slug: "postgres-too-many-connections",
    title: "Postgres FATAL: too many connections",
    category: "database",
    description: "Postgres refuses new connections at `max_connections`.",
    shortAnswer:
      "Raising `max_connections` is usually the wrong fix — each connection costs memory. Pool connections (PgBouncer, RDS Proxy) instead.",
    exampleInput: "FATAL: remaining connection slots are reserved",
    exampleOutput:
      "Check active connections: `SELECT count(*) FROM pg_stat_activity`. Add PgBouncer or RDS Proxy in front before raising the DB limit.",
    causes: [
      "Application creating a connection per request",
      "Connection pool misconfigured (too big)",
      "Leaked connections not returned to pool",
      "Too many services pointing at one DB",
    ],
    fix: [
      "Introduce PgBouncer or RDS Proxy",
      "Cap application pool size per instance",
      "Find long-idle connections: `pg_stat_activity`",
      "Use `pg_terminate_backend` to clear leaks",
    ],
  },
  {
    slug: "postgres-slow-query",
    title: "Postgres Slow Query",
    category: "database",
    description: "A specific query dominates DB latency.",
    shortAnswer:
      "Slow Postgres queries are almost always a missing index, a bad plan from stale stats, or a large sequential scan. `EXPLAIN ANALYZE` shows which.",
    exampleInput: "Query takes 4s in production but fast in dev",
    exampleOutput:
      "Run `EXPLAIN ANALYZE` on the query in production. Look for Seq Scan on large tables, missing indexes on join keys, and run `ANALYZE` if stats are stale.",
    causes: [
      "Missing index on a filter or join key",
      "Stale planner statistics",
      "Dead tuples from frequent updates",
      "Parameter sniffing with bad plan cache",
    ],
    fix: [
      "Run `EXPLAIN (ANALYZE, BUFFERS)` in prod",
      "Add indexes on filter/join columns",
      "Run `ANALYZE` on the table",
      "Run `VACUUM` if dead tuples are high",
    ],
  },
  {
    slug: "mysql-deadlock-found",
    title: "MySQL Deadlock Found",
    category: "database",
    description: "Transaction aborted due to a deadlock.",
    shortAnswer:
      "MySQL deadlocks happen when two transactions lock rows in opposite order. The fix is consistent lock ordering + a retry loop — not disabling row locks.",
    exampleInput: "ERROR 1213: Deadlock found when trying to get lock",
    exampleOutput:
      "Inspect `SHOW ENGINE INNODB STATUS` for the last deadlock. Ensure all code paths lock rows in the same order, and wrap the transaction in a retry with backoff.",
    causes: [
      "Two transactions locking in opposite order",
      "Missing indexes causing wider locks",
      "Long-running transaction holding rows",
      "Auto-increment lock contention on hot insert",
    ],
    fix: [
      "Read `SHOW ENGINE INNODB STATUS` for last deadlock",
      "Enforce consistent lock order in code",
      "Add indexes to narrow locked ranges",
      "Retry on deadlock with exponential backoff",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function findIssue(slug: string): Issue | undefined {
  return issues.find((i) => i.slug === slug);
}

export function getRelatedIssues(current: Issue, limit = 4): Issue[] {
  // Prefer same category, then fill from others
  const sameCategory = issues.filter(
    (i) => i.category === current.category && i.slug !== current.slug,
  );
  const others = issues.filter(
    (i) => i.category !== current.category && i.slug !== current.slug,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getIssueSlugs(): string[] {
  return issues.map((i) => i.slug);
}

export function mergeIssues<T extends IssueLike>(
  staticIssues: Issue[],
  generatedIssues: T[],
): Array<Issue | T> {
  const seen = new Set<string>();
  const merged: Array<Issue | T> = [];

  for (const issue of [...staticIssues, ...generatedIssues]) {
    if (seen.has(issue.slug)) {
      continue;
    }

    seen.add(issue.slug);
    merged.push(issue);
  }

  return merged;
}

export function findIssueInCatalog<T extends IssueLike>(
  slug: string,
  generatedIssues: T[],
): Issue | T | undefined {
  return mergeIssues(issues, generatedIssues).find((issue) => issue.slug === slug);
}

export function getRelatedIssuesFromCatalog<T extends IssueLike>(
  current: IssueLike,
  generatedIssues: T[],
  limit = 4,
): Array<Issue | T> {
  const catalog = mergeIssues(issues, generatedIssues).filter(
    (issue) => issue.slug !== current.slug,
  );
  const sameCategory = catalog.filter((issue) => issue.category === current.category);
  const others = catalog.filter((issue) => issue.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
}

export function getCatalogIssueSlugs<T extends IssueLike>(generatedIssues: T[]): string[] {
  return mergeIssues(issues, generatedIssues).map((issue) => issue.slug);
}
