/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type FixProblem = {
  slug: string;
  title: string;
  description: string;
  problem: string;
  directAnswer: string;
  instantAnswer: string;
  outcome: string;
  causes: string[];
  fixes: string[];
  faqs: { q: string; a: string }[];
  sampleInput: string;
  technicalContext: FixProblemTechnicalContext;
};

export type FixProblemTechnicalContext = {
  commands: string[];
  logSnippet: string;
  configSnippet: string;
};

/* ------------------------------------------------------------------ */
/*  Data — 15 initial problems                                         */
/* ------------------------------------------------------------------ */

export const fixProblems: FixProblem[] = [
  {
    slug: "kubernetes-pod-crash-loop",
    title: "Fix Kubernetes Pod Crash Loop Root Cause & Solution",
    description:
      "Pods restarting frequently? Identify root causes and fix fast.",
    problem: "Kubernetes pod crash loop",
    directAnswer:
      "Kubernetes pods enter CrashLoopBackOff when the container process exits repeatedly. Common causes are OOMKilled (memory limit exceeded), failing liveness probes, and application startup errors. Run kubectl logs --previous and kubectl describe pod to identify the specific failure.",
    instantAnswer:
      "Pods crash loop due to memory limits, failed probes, or startup errors. Check pod logs with kubectl logs, then inspect events with kubectl describe pod to pinpoint the exact failure reason.",
    causes: [
      "Memory limit exceeded (OOMKilled)",
      "Liveness probe failing repeatedly",
      "Application crash on startup due to missing config or dependency",
      "Required dependency or service unavailable at boot",
      "Image pull errors or wrong container image tag",
    ],
    fixes: [
      "Check pod logs using kubectl logs <pod-name> --previous to see crash output",
      "Run kubectl describe pod <pod-name> and inspect the Events section for OOMKilled or probe failures",
      "Increase memory limits in your deployment manifest if OOMKilled is the reason",
      "Validate liveness and readiness probe configuration — ensure endpoints return 200",
      "Verify environment variables, config maps, and secrets are correctly mounted",
    ],
    faqs: [
      {
        q: "Why does a Kubernetes pod crash loop?",
        a: "Usually due to resource limits being exceeded, liveness probe misconfigurations, application errors on startup, or missing dependencies. The kubelet keeps restarting the container with exponential backoff.",
      },
      {
        q: "How to debug CrashLoopBackOff?",
        a: "Start with kubectl logs --previous to see the last crash output, then kubectl describe pod to check events. Look for OOMKilled, probe failures, or image pull errors.",
      },
      {
        q: "What is the difference between liveness and readiness probes?",
        a: "Liveness probes determine if a container should be restarted. Readiness probes determine if a container should receive traffic. A failing liveness probe causes restarts; a failing readiness probe removes the pod from service endpoints.",
      },
    ],
    sampleInput:
      "CrashLoopBackOff — pod keeps restarting every 30 seconds with OOMKilled status",
    outcome:
      "Pod restarts stop and the container runs stably with correct resource limits and probe configuration.",
    technicalContext: {
      commands: [
        "kubectl logs <pod-name> --previous",
        "kubectl describe pod <pod-name>",
        "kubectl get events --sort-by='.lastTimestamp'",
      ],
      logSnippet:
        "State:          Waiting\n  Reason:       CrashLoopBackOff\nLast State:     Terminated\n  Reason:       OOMKilled\n  Exit Code:    137",
      configSnippet:
        "resources:\n  limits:\n    memory: \"512Mi\"\n  requests:\n    memory: \"256Mi\"\nlivenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 15",
    },
  },
  {
    slug: "api-latency-spike",
    title: "Fix API Latency Spike — Diagnose & Resolve Slow Endpoints",
    description:
      "API response times spiking? Find the bottleneck and fix it in minutes.",
    problem: "API latency spike",
    directAnswer:
      "API latency spikes occur when a bottleneck appears in the request path — typically slow database queries, exhausted connection pools, or degraded upstream services. Use distributed tracing to isolate the slowest span and address that component directly.",
    instantAnswer:
      "API latency spikes are usually caused by slow database queries, missing caches, or upstream service degradation. Profile with distributed tracing to find the slowest span, then address the bottleneck directly.",
    causes: [
      "Slow or unindexed database queries under load",
      "Missing response caching for repeated requests",
      "Upstream service degradation or timeout cascading",
      "Thread pool or connection pool exhaustion",
      "Garbage collection pauses in the application runtime",
    ],
    fixes: [
      "Enable distributed tracing (OpenTelemetry, Datadog) and identify the slowest spans",
      "Add database indexes on columns used in WHERE and JOIN clauses",
      "Implement Redis or in-memory caching for frequently requested data",
      "Increase connection pool sizes and add proper timeout configurations",
      "Parallelize independent API calls with Promise.all instead of sequential await",
    ],
    faqs: [
      {
        q: "What causes sudden API latency spikes?",
        a: "Common causes include database query degradation, upstream service slowdowns, GC pauses, connection pool exhaustion, and increased traffic without auto-scaling.",
      },
      {
        q: "How do I measure API latency accurately?",
        a: "Use distributed tracing tools like OpenTelemetry to capture P50, P95, and P99 latency per endpoint. Avoid relying solely on averages as they hide tail latency.",
      },
    ],
    sampleInput:
      "API response times jumped from 200ms to 3s after deployment, P99 at 5s",
    outcome:
      "API response times return to baseline with the identified bottleneck resolved.",
    technicalContext: {
      commands: [
        "curl -w 'time_total: %{time_total}s\n' -o /dev/null -s https://api.example.com/endpoint",
        "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5;",
      ],
      logSnippet:
        "[WARN] Request to /api/users took 3200ms (threshold: 500ms)\n[ERROR] Connection pool timeout after 30000ms",
      configSnippet:
        "pool:\n  max: 20\n  idleTimeoutMillis: 30000\n  connectionTimeoutMillis: 5000",
    },
  },
  {
    slug: "docker-container-restarting",
    title: "Fix Docker Container Restarting — Stop Restart Loops",
    description:
      "Docker container keeps restarting? Diagnose exit codes and fix the root cause.",
    problem: "Docker container restarting repeatedly",
    directAnswer:
      "Docker containers restart when the main process exits with a non-zero code and the restart policy triggers a retry. Exit code 137 indicates OOM kill, exit code 1 indicates an application error. Check docker logs and docker inspect to identify the failure.",
    instantAnswer:
      "Docker containers restart due to OOM kills, application errors, or misconfigured health checks. Check docker logs and inspect the exit code to identify the exact failure.",
    causes: [
      "Out of memory (exit code 137 — OOMKilled)",
      "Application crash with unhandled exception (exit code 1)",
      "Misconfigured HEALTHCHECK causing restart",
      "Missing environment variables or config files",
      "Entrypoint script failing silently",
    ],
    fixes: [
      "Run docker logs <container-id> to see the last error output",
      "Check the exit code with docker inspect <container-id> --format='{{.State.ExitCode}}'",
      "Increase memory limits in docker run --memory or docker-compose.yml",
      "Validate all environment variables and mounted volumes are correct",
      "Test the entrypoint script locally to catch silent failures",
    ],
    faqs: [
      {
        q: "What does exit code 137 mean in Docker?",
        a: "Exit code 137 means the container was killed by the OOM (Out of Memory) killer. The process exceeded its memory limit and was terminated by the kernel.",
      },
      {
        q: "How do I stop a Docker container from restarting?",
        a: "First fix the root cause. If you need to stop it immediately, use docker update --restart=no <container-id> or docker stop <container-id>.",
      },
    ],
    sampleInput:
      "Docker container exits with code 137 and restarts every 10 seconds",
    outcome:
      "Container runs without restart loops and the root cause exit code is resolved.",
    technicalContext: {
      commands: [
        "docker logs <container-id> --tail 50",
        "docker inspect <container-id> --format='{{.State.ExitCode}}'",
        "docker stats --no-stream",
      ],
      logSnippet:
        "container exited with status 137\nOOMKilled: true\nMemory limit: 256MiB\nPeak usage: 312MiB",
      configSnippet:
        "services:\n  app:\n    deploy:\n      resources:\n        limits:\n          memory: 512M\n    restart: unless-stopped",
    },
  },
  {
    slug: "aws-ec2-high-cpu",
    title: "Fix AWS EC2 High CPU Usage — Identify & Resolve",
    description:
      "EC2 instance hitting 100% CPU? Find the process causing it and fix it fast.",
    problem: "AWS EC2 high CPU usage",
    directAnswer:
      "EC2 high CPU usage is caused by a process consuming excessive compute cycles — typically a runaway application thread, undersized instance, or malicious process. SSH in and run top to identify the process, then check CloudWatch for the duration pattern.",
    instantAnswer:
      "High EC2 CPU is typically caused by runaway processes, insufficient instance sizing, or application-level infinite loops. SSH in, run top to find the culprit process, then address the root cause.",
    causes: [
      "Runaway application process or infinite loop",
      "Instance type undersized for workload",
      "Crypto mining malware or compromised instance",
      "Inefficient code running CPU-bound tasks without throttling",
      "Missing auto-scaling causing single instance to absorb all traffic",
    ],
    fixes: [
      "SSH into the instance and run top or htop to identify the high-CPU process",
      "Check CloudWatch CPU metrics to determine if this is a spike or sustained pattern",
      "Right-size the instance type based on actual CPU utilization requirements",
      "Implement auto-scaling groups to distribute load across multiple instances",
      "Audit the process — if unknown, run security scans for compromised binaries",
    ],
    faqs: [
      {
        q: "What is a normal CPU utilization for EC2?",
        a: "It depends on the workload, but sustained utilization above 80% typically indicates the instance is undersized or there's an issue. Burstable instances (T-series) have CPU credits that deplete at high usage.",
      },
      {
        q: "How do I set up CPU alerts for EC2?",
        a: "Use CloudWatch Alarms on the CPUUtilization metric. Set thresholds at 70% and 90% with appropriate actions like notifications or auto-scaling triggers.",
      },
    ],
    sampleInput:
      "EC2 instance at 100% CPU for 2 hours, application unresponsive, t3.medium",
    outcome:
      "CPU utilization drops to normal levels after addressing the offending process or resizing the instance.",
    technicalContext: {
      commands: [
        "top -b -n 1 | head -20",
        "aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --period 300 --statistics Average --dimensions Name=InstanceId,Value=i-xxxx",
      ],
      logSnippet:
        "PID   USER   %CPU  %MEM  COMMAND\n3421  app    98.2  45.1  node server.js\n  12  root    0.3   0.1  [ksoftirqd/0]",
      configSnippet:
        "Resources:\n  Type: AWS::AutoScaling::ScalingPolicy\n  Properties:\n    AdjustmentType: ChangeInCapacity\n    ScalingAdjustment: 1\n    Cooldown: 300",
    },
  },
  {
    slug: "ssl-certificate-expired",
    title: "Fix SSL Certificate Expired — Renew & Prevent Downtime",
    description:
      "SSL certificate expired and site is down? Renew immediately and set up auto-renewal.",
    problem: "SSL certificate expired",
    directAnswer:
      "An expired SSL certificate causes browsers to reject HTTPS connections with ERR_CERT_DATE_INVALID. Renew the certificate immediately using certbot renew or your CA dashboard, then install it on the web server and configure automated renewal.",
    instantAnswer:
      "An expired SSL certificate causes browsers to block access to your site. Renew the certificate immediately through your CA or Let's Encrypt, then set up auto-renewal to prevent recurrence.",
    causes: [
      "Certificate renewal was not automated",
      "Auto-renewal process failed silently",
      "DNS validation records were removed or changed",
      "Renewal emails went to an unmonitored inbox",
      "Certificate manager service had permissions issues",
    ],
    fixes: [
      "Renew the certificate immediately via your CA dashboard or certbot renew",
      "Install the renewed certificate on your web server and restart the service",
      "Set up auto-renewal with certbot or AWS Certificate Manager",
      "Add monitoring alerts for certificates expiring within 30 days",
      "Verify DNS validation records are in place for domain-validated certificates",
    ],
    faqs: [
      {
        q: "How long does it take to renew an SSL certificate?",
        a: "With Let's Encrypt and DNS already configured, renewal takes seconds. Commercial CAs may take minutes to hours depending on validation type (DV, OV, EV).",
      },
      {
        q: "Can I automate SSL certificate renewal?",
        a: "Yes. Use certbot with a cron job for Let's Encrypt, or use managed services like AWS ACM or Cloudflare that handle renewal automatically.",
      },
    ],
    sampleInput:
      "ERR_CERT_DATE_INVALID site unreachable, SSL certificate expired 2 days ago",
    outcome:
      "Certificate is renewed, HTTPS connections work, and auto-renewal prevents future expiration.",
    technicalContext: {
      commands: [
        "certbot renew --dry-run",
        "openssl s_client -connect example.com:443 -servername example.com | openssl x509 -noout -dates",
        "certbot certificates",
      ],
      logSnippet:
        "NET::ERR_CERT_DATE_INVALID\nSSL certificate problem: certificate has expired\nVerify return code: 10 (certificate has expired)",
      configSnippet:
        "# Crontab for auto-renewal\n0 0 1 * * certbot renew --quiet --post-hook \"systemctl reload nginx\"",
    },
  },
  {
    slug: "nginx-502-bad-gateway",
    title: "Fix Nginx 502 Bad Gateway — Upstream Connection Failed",
    description:
      "Getting 502 Bad Gateway from Nginx? Fix upstream connection issues fast.",
    problem: "Nginx 502 Bad Gateway error",
    directAnswer:
      "Nginx returns 502 Bad Gateway when it cannot get a valid response from the upstream server. This means the backend process is either down, unreachable, or timing out. Check the upstream process status and Nginx error logs.",
    instantAnswer:
      "A 502 Bad Gateway from Nginx means the upstream server (your app) is not responding. Check if the upstream process is running, verify the proxy_pass address, and inspect Nginx error logs.",
    causes: [
      "Upstream application process crashed or is not running",
      "Incorrect proxy_pass address or port in Nginx config",
      "Upstream server is overloaded and dropping connections",
      "PHP-FPM, Node.js, or application process pool exhausted",
      "Firewall or security group blocking Nginx-to-upstream traffic",
    ],
    fixes: [
      "Check if the upstream application is running: systemctl status <service> or ps aux",
      "Verify proxy_pass in Nginx config points to the correct host and port",
      "Check Nginx error logs: tail -f /var/log/nginx/error.log",
      "Increase upstream timeout values: proxy_connect_timeout, proxy_read_timeout",
      "Restart the upstream service and monitor for stability",
    ],
    faqs: [
      {
        q: "What does 502 Bad Gateway mean?",
        a: "It means Nginx received an invalid response from the upstream server. The most common cause is the upstream process being down or unreachable.",
      },
      {
        q: "How do I check Nginx error logs?",
        a: "Run tail -f /var/log/nginx/error.log to see real-time errors. Look for 'upstream connection refused' or 'upstream timed out' messages.",
      },
    ],
    sampleInput:
      "502 Bad Gateway on all routes, Nginx reverse proxy to Node.js app on port 3000",
    outcome:
      "Upstream responses are received correctly and 502 errors stop.",
    technicalContext: {
      commands: [
        "tail -f /var/log/nginx/error.log",
        "systemctl status <upstream-service>",
        "curl -I http://127.0.0.1:3000/health",
      ],
      logSnippet:
        "upstream prematurely closed connection while reading response header from upstream\nconnect() failed (111: Connection refused) while connecting to upstream",
      configSnippet:
        "upstream backend {\n    server 127.0.0.1:3000;\n}\nserver {\n    location / {\n        proxy_pass http://backend;\n        proxy_connect_timeout 60s;\n        proxy_read_timeout 60s;\n    }\n}",
    },
  },
  {
    slug: "database-connection-pool-exhausted",
    title: "Fix Database Connection Pool Exhausted — Resolve Connection Limits",
    description:
      "Database connection pool full? Fix pool exhaustion and prevent query failures.",
    problem: "Database connection pool exhausted",
    directAnswer:
      "Database connection pool exhaustion occurs when all connections are in use and no new connections can be acquired. This is typically caused by connection leaks in error handling paths or undersized pool configuration. Audit connection release logic and increase pool size.",
    instantAnswer:
      "Connection pool exhaustion happens when your app opens more connections than it releases. Check for connection leaks in error paths, increase pool size to match your database's max_connections, and add idle timeout settings.",
    causes: [
      "Connection leaks — connections not released after errors",
      "Pool size too small for the number of concurrent requests",
      "Long-running transactions holding connections open",
      "Missing connection idle timeout configuration",
      "Multiple services sharing the same database without coordinated pool limits",
    ],
    fixes: [
      "Audit code for connection leaks ensure connections are released in finally blocks",
      "Increase pool size to accommodate peak concurrent request volume",
      "Set idle connection timeout to automatically reclaim unused connections",
      "Break up long-running transactions into smaller units of work",
      "Monitor active connection count and alert when approaching the limit",
    ],
    faqs: [
      {
        q: "What is a database connection pool?",
        a: "A pool is a cache of reusable database connections. Instead of opening a new connection for every query, the app borrows one from the pool and returns it when done.",
      },
      {
        q: "How do I check active database connections?",
        a: "In PostgreSQL: SELECT count(*) FROM pg_stat_activity; In MySQL: SHOW PROCESSLIST; These show all active connections and their states.",
      },
    ],
    sampleInput:
      "Error: too many connections connection pool exhausted, PostgreSQL max_connections=100",
    outcome:
      "Queries execute without connection errors and pool utilization stays within limits.",
    technicalContext: {
      commands: [
        "SELECT count(*) FROM pg_stat_activity;",
        "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;",
        "SHOW max_connections;",
      ],
      logSnippet:
        "ERROR: remaining connection slots are reserved for non-replication superuser connections\npool: timeout expired, all connections in use (active: 100, idle: 0)",
      configSnippet:
        "# postgresql.conf\nmax_connections = 200\n\n# Application pool config\npool.max = 20\npool.min = 5\npool.idleTimeoutMillis = 30000",
    },
  },
  {
    slug: "terraform-state-lock-error",
    title: "Fix Terraform State Lock Error — Unlock & Resume Safely",
    description:
      "Terraform state locked? Safely unlock and resume infrastructure changes.",
    problem: "Terraform state lock error",
    directAnswer:
      "Terraform state lock errors occur when a previous operation did not release the lock, usually from a crash or interrupted CI/CD run. Confirm no other operation is running, then use terraform force-unlock with the lock ID to release the stale lock.",
    instantAnswer:
      "Terraform state lock errors occur when a previous operation didn't release the lock — usually due to a crash or timeout. Verify no other operation is running, then force-unlock with the lock ID.",
    causes: [
      "Previous terraform apply was interrupted or crashed",
      "CI/CD pipeline timed out during a Terraform operation",
      "Multiple users or pipelines running Terraform concurrently",
      "DynamoDB lock table has a stale lock entry (for S3 backend)",
      "Network interruption during state file write",
    ],
    fixes: [
      "Check if another Terraform operation is actually running before unlocking",
      "Run terraform force-unlock <LOCK_ID> to release the stale lock",
      "Verify state file integrity after unlocking with terraform plan",
      "Implement CI/CD pipeline locking to prevent concurrent Terraform runs",
      "Add timeout handling to your Terraform CI/CD pipeline configuration",
    ],
    faqs: [
      {
        q: "Is it safe to force-unlock Terraform state?",
        a: "Yes, if you've confirmed no other operation is running. The lock prevents concurrent writes. If the lock is stale from a crashed process, force-unlock is the correct action.",
      },
      {
        q: "How do I prevent Terraform state lock issues?",
        a: "Use CI/CD pipeline concurrency controls to ensure only one Terraform operation runs at a time. Add proper timeout and retry logic to your pipelines.",
      },
    ],
    sampleInput:
      "Error: Error locking state: Error acquiring the state lock ConditionalCheckFailedException",
    outcome:
      "State lock is released, terraform plan runs successfully, and CI/CD pipeline concurrency is configured.",
    technicalContext: {
      commands: [
        "terraform force-unlock <LOCK_ID>",
        "terraform plan",
        "aws dynamodb scan --table-name terraform-locks",
      ],
      logSnippet:
        "Error: Error acquiring the state lock\nConditionalCheckFailedException: The conditional request failed\nLock Info:\n  ID:        a1b2c3d4-e5f6-7890\n  Path:      s3://my-bucket/terraform.tfstate",
      configSnippet:
        "terraform {\n  backend \"s3\" {\n    bucket         = \"my-terraform-state\"\n    key            = \"prod/terraform.tfstate\"\n    dynamodb_table = \"terraform-locks\"\n  }\n}",
    },
  },
  {
    slug: "redis-memory-full",
    title: "Fix Redis Memory Full — Eviction & Memory Management",
    description:
      "Redis out of memory? Configure eviction policies and optimize memory usage.",
    problem: "Redis memory full OOM errors",
    directAnswer:
      "Redis returns OOM errors when used memory exceeds the maxmemory limit and the eviction policy is set to noeviction. Set maxmemory-policy to allkeys-lru for automatic eviction of least recently used keys, and add TTL to all cache keys to prevent unbounded growth.",
    instantAnswer:
      "When Redis runs out of memory, writes fail with OOM errors. Set a maxmemory-policy (e.g., allkeys-lru) to auto-evict old keys, and audit key expiration to prevent unbounded growth.",
    causes: [
      "No maxmemory-policy configured (default is noeviction)",
      "Keys stored without TTL, growing indefinitely",
      "Large data structures (sorted sets, lists) consuming excessive memory",
      "Memory fragmentation ratio is high",
      "Instance size is undersized for the dataset",
    ],
    fixes: [
      "Set maxmemory-policy to allkeys-lru or volatile-lru for automatic eviction",
      "Add TTL (EXPIRE) to all cache keys to prevent unbounded growth",
      "Run redis-cli INFO memory to check used_memory and fragmentation ratio",
      "Identify large keys with redis-cli --bigkeys and optimize or remove them",
      "Scale up the Redis instance or add a Redis Cluster for larger datasets",
    ],
    faqs: [
      {
        q: "What is the best Redis eviction policy?",
        a: "For caching: allkeys-lru (evicts least recently used keys). For sessions: volatile-lru (evicts only keys with TTL). For queues: noeviction with proper memory sizing.",
      },
      {
        q: "How do I check Redis memory usage?",
        a: "Run INFO memory in redis-cli. Check used_memory_human for current usage and maxmemory for the configured limit.",
      },
    ],
    sampleInput:
      "OOM command not allowed when used memory > maxmemory Redis 6.2, maxmemory 256mb",
    outcome:
      "Redis accepts writes again with an eviction policy in place, and key TTLs prevent unbounded memory growth.",
    technicalContext: {
      commands: [
        "redis-cli INFO memory",
        "redis-cli --bigkeys",
        "redis-cli CONFIG SET maxmemory-policy allkeys-lru",
      ],
      logSnippet:
        "OOM command not allowed when used memory > 'maxmemory'\nused_memory_human:256.12M\nmaxmemory_human:256.00M\nmaxmemory_policy:noeviction",
      configSnippet:
        "# redis.conf\nmaxmemory 512mb\nmaxmemory-policy allkeys-lru\nmaxmemory-samples 10",
    },
  },
  {
    slug: "dns-resolution-failure",
    title: "Fix DNS Resolution Failure — Diagnose & Restore Connectivity",
    description:
      "DNS not resolving? Diagnose propagation issues and restore service connectivity.",
    problem: "DNS resolution failure",
    directAnswer:
      "DNS resolution failures occur when a domain's DNS records are misconfigured, the domain registration has expired, or DNS propagation is incomplete. Use dig or nslookup to verify current resolution, then check the DNS provider for correct record configuration.",
    instantAnswer:
      "DNS resolution failures are caused by misconfigured DNS records, expired domains, or DNS server issues. Use dig or nslookup to check record propagation, then verify your DNS configuration.",
    causes: [
      "DNS records misconfigured or deleted",
      "Domain registration expired",
      "DNS propagation not yet complete after a change",
      "DNS server (e.g., Route 53, Cloudflare) experiencing issues",
      "Local DNS cache serving stale records",
    ],
    fixes: [
      "Run dig <domain> or nslookup <domain> to check current DNS resolution",
      "Verify DNS records in your DNS provider dashboard (A, CNAME, etc.)",
      "Check domain registration status renew if expired",
      "Flush local DNS cache: ipconfig /flushdns (Windows) or sudo dscacheutil -flushcache (macOS)",
      "Wait for DNS propagation if changes were made recently (up to 48 hours for some records)",
    ],
    faqs: [
      {
        q: "How long does DNS propagation take?",
        a: "Most DNS changes propagate within 5 minutes to 24 hours. Records with low TTL propagate faster. In rare cases, it can take up to 48 hours.",
      },
      {
        q: "How do I check if DNS is propagated?",
        a: "Use tools like dig, nslookup, or online DNS checkers (dnschecker.org) to verify resolution from multiple locations worldwide.",
      },
    ],
    sampleInput:
      "NXDOMAIN domain not resolving after DNS migration to Cloudflare",
    outcome:
      "Domain resolves correctly from all locations and services reconnect without DNS errors.",
    technicalContext: {
      commands: [
        "dig example.com +short",
        "nslookup example.com 8.8.8.8",
        "dig example.com @ns1.cloudflare.com",
      ],
      logSnippet:
        "NXDOMAIN - Query for example.com returned no results\nserver can't find example.com: NXDOMAIN\nresolution failed: SERVFAIL",
      configSnippet:
        "; DNS Zone File\nexample.com.  IN  A      203.0.113.10\nwww           IN  CNAME  example.com.\n@             IN  MX 10  mail.example.com.",
    },
  },
  {
    slug: "github-actions-failing",
    title: "Fix GitHub Actions Failing — Debug CI/CD Pipeline Errors",
    description:
      "GitHub Actions workflow failing? Diagnose common CI/CD errors and fix your pipeline.",
    problem: "GitHub Actions pipeline failing",
    directAnswer:
      "GitHub Actions failures are caused by errors in a specific workflow step — most commonly dependency installation failures, missing secrets, or runtime version mismatches. Check the failing step log output in the Actions tab, then verify secrets and pin dependency versions.",
    instantAnswer:
      "GitHub Actions failures are usually caused by dependency issues, environment mismatches, or secret/token problems. Check the failing step's logs, verify secrets are set, and ensure dependency versions match.",
    causes: [
      "Dependency installation failure (npm, pip, etc.)",
      "Environment variable or secret not configured",
      "Node/Python/runtime version mismatch",
      "Test failures due to environment differences",
      "Runner disk space or memory exhaustion",
    ],
    fixes: [
      "Click the failing step in the Actions tab to see the full error log",
      "Verify all required secrets are set in Settings > Secrets and variables",
      "Pin runtime versions explicitly in your workflow YAML",
      "Add caching for dependencies to speed up builds and reduce flakiness",
      "Use actions/setup-node or actions/setup-python with explicit version numbers",
    ],
    faqs: [
      {
        q: "How do I debug a failing GitHub Actions workflow?",
        a: "Go to the Actions tab, click the failed run, expand the failing step to see logs. You can also re-run with debug logging enabled by setting ACTIONS_STEP_DEBUG=true.",
      },
      {
        q: "Why do my tests pass locally but fail in CI?",
        a: "Usually due to environment differences: different OS, Node/Python version, missing env vars, or timezone differences. Pin versions and replicate the CI environment locally.",
      },
    ],
    sampleInput:
      "GitHub Actions: npm ci failed ERR_SOCKET_TIMEOUT on dependency install",
    outcome:
      "CI/CD pipeline runs green with pinned versions, cached dependencies, and correctly configured secrets.",
    technicalContext: {
      commands: [
        "gh run list --status failure --limit 5",
        "gh run view <run-id> --log-failed",
        "act --list",
      ],
      logSnippet:
        "Error: Process completed with exit code 1.\nnpm ERR! code ERR_SOCKET_TIMEOUT\nnpm ERR! network request to https://registry.npmjs.org failed",
      configSnippet:
        "- uses: actions/setup-node@v4\n  with:\n    node-version: '20'\n    cache: 'npm'\n- run: npm ci\n- run: npm test",
    },
  },
  {
    slug: "cors-blocked-request",
    title: "Fix CORS Blocked Request — Cross Origin Access Denied",
    description:
      "Browser blocking your API call with CORS error? Fix headers and preflight configuration.",
    problem: "CORS blocked request in browser",
    directAnswer:
      "CORS errors occur when a browser blocks a cross-origin request because the server response is missing the Access-Control-Allow-Origin header. Configure the backend to handle OPTIONS preflight requests and return the requesting origin in response headers.",
    instantAnswer:
      "CORS errors mean your API server is not sending the right Access-Control-Allow-Origin headers. Configure your backend to respond to OPTIONS preflight requests and include the frontend's origin.",
    causes: [
      "Backend missing Access-Control-Allow-Origin header",
      "OPTIONS preflight request not handled by the server",
      "API gateway or reverse proxy stripping CORS headers",
      "Wildcard (*) used with credentials mode",
      "Mismatched protocol (http vs https) in origin",
    ],
    fixes: [
      "Add Access-Control-Allow-Origin header with your frontend's exact origin",
      "Handle OPTIONS requests and return Access-Control-Allow-Methods and Access-Control-Allow-Headers",
      "Set Access-Control-Allow-Credentials: true if using cookies or auth headers",
      "Check that API gateway/proxy is not stripping CORS headers from responses",
      "For development, use a dev server proxy instead of disabling CORS entirely",
    ],
    faqs: [
      {
        q: "Why do CORS errors only happen in the browser?",
        a: "CORS is enforced by browsers as a security feature. Server-to-server requests (curl, Node.js) don't enforce Same-Origin Policy so they never trigger CORS errors.",
      },
      {
        q: "Can I use Access-Control-Allow-Origin: * with credentials?",
        a: "No. When Access-Control-Allow-Credentials is true, you must specify the exact origin. Wildcard (*) is not allowed with credential requests.",
      },
    ],
    sampleInput:
      "Access to XMLHttpRequest at 'https://api.example.com' from origin 'https://app.example.com' has been blocked by CORS policy",
    outcome:
      "Cross-origin requests succeed without browser blocking and preflight responses return correct CORS headers.",
    technicalContext: {
      commands: [
        "curl -I -X OPTIONS https://api.example.com/endpoint -H 'Origin: https://app.example.com'",
        "curl -I https://api.example.com/endpoint -H 'Origin: https://app.example.com'",
      ],
      logSnippet:
        "Access to XMLHttpRequest at 'https://api.example.com' from origin 'https://app.example.com' has been blocked by CORS policy:\nNo 'Access-Control-Allow-Origin' header is present on the requested resource.",
      configSnippet:
        "// Express CORS middleware\napp.use(cors({\n  origin: 'https://app.example.com',\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  credentials: true\n}));",
    },
  },
  {
    slug: "out-of-memory-node-js",
    title: "Fix Node.js Out of Memory (Heap) — JavaScript Heap OOM",
    description:
      "Node.js crashing with FATAL ERROR: heap out of memory? Find the leak and fix it.",
    problem: "Node.js JavaScript heap out of memory",
    directAnswer:
      "Node.js crashes with heap out of memory when the V8 engine exceeds its memory limit. Increase the heap size with --max-old-space-size as a temporary fix, then use heap snapshots via Chrome DevTools to identify and fix the underlying memory leak.",
    instantAnswer:
      "Node.js OOM crashes happen when the V8 heap exceeds its limit. Increase --max-old-space-size temporarily, then profile with heap snapshots to find memory leaks.",
    causes: [
      "Memory leak from unreleased event listeners or closures",
      "Large dataset loaded entirely into memory",
      "Unbounded cache or Map growing without eviction",
      "Heap size limit too low for the workload",
      "Circular references preventing garbage collection",
    ],
    fixes: [
      "Increase heap size temporarily: node --max-old-space-size=4096 app.js",
      "Take heap snapshots with --inspect and Chrome DevTools to identify leaks",
      "Stream large files/datasets instead of loading them into memory",
      "Add size limits and eviction to all in-memory caches",
      "Check for event listener leaks — use process._getActiveHandles() to audit",
    ],
    faqs: [
      {
        q: "What is the default Node.js heap size?",
        a: "The default V8 heap limit is roughly 1.5 GB on 64-bit systems. You can increase it with --max-old-space-size=<MB>.",
      },
      {
        q: "How do I find a memory leak in Node.js?",
        a: "Use --inspect to connect Chrome DevTools, take heap snapshots at intervals, and compare them. Look for objects that grow over time but are never garbage collected.",
      },
    ],
    sampleInput:
      "FATAL ERROR: Reached heap limit Allocation failed JavaScript heap out of memory",
    outcome:
      "Node.js process runs within memory limits with identified leaks fixed and proper heap sizing configured.",
    technicalContext: {
      commands: [
        "node --max-old-space-size=4096 app.js",
        "node --inspect app.js",
        "node -e \"console.log(v8.getHeapStatistics())\"",
      ],
      logSnippet:
        "FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory\n<--- Last few GCs --->\n[1234:0x5678] 120000 ms: Mark-sweep 1495.2 (1520.1) -> 1494.8 (1520.1) MB",
      configSnippet:
        "// package.json scripts\n\"scripts\": {\n  \"start\": \"node --max-old-space-size=4096 server.js\",\n  \"debug\": \"node --inspect --max-old-space-size=4096 server.js\"\n}",
    },
  },
  {
    slug: "load-balancer-health-check-failing",
    title: "Fix Load Balancer Health Check Failing — Targets Unhealthy",
    description:
      "Load balancer marking targets as unhealthy? Fix health check configuration and restore traffic.",
    problem: "Load balancer health check failing",
    directAnswer:
      "Load balancer health checks fail when the target instance does not return HTTP 200 on the configured health check path and port. Verify the health endpoint is responding, the port matches the application listener, and security groups allow traffic from the load balancer.",
    instantAnswer:
      "Unhealthy targets mean the health check endpoint isn't responding correctly. Verify the health check path returns HTTP 200, the correct port is configured, and the application starts before the first check.",
    causes: [
      "Health check path returns non-200 status code",
      "Health check port doesn't match the application's listening port",
      "Application takes too long to start — fails initial health checks",
      "Security group or firewall blocks health check traffic from the LB",
      "Application crashes intermittently, failing checks during restarts",
    ],
    fixes: [
      "Verify the health check endpoint returns HTTP 200 by curling it from the instance",
      "Match the health check port and path to what the application is actually serving",
      "Increase the health check grace period or initial delay for slow-starting apps",
      "Check security groups to ensure the LB's IP range can reach the target port",
      "Add a dedicated /health endpoint that returns 200 without heavy computation",
    ],
    faqs: [
      {
        q: "What is a load balancer health check?",
        a: "A periodic HTTP request the load balancer sends to each target to verify it can handle traffic. Targets failing health checks are removed from the rotation.",
      },
      {
        q: "How often do health checks run?",
        a: "Configurable, but typically every 10–30 seconds. An unhealthy threshold of 2–3 consecutive failures marks the target as unhealthy.",
      },
    ],
    sampleInput:
      "ALB target group: 0 healthy targets, all showing unhealthy status, health check path /health",
    outcome:
      "All targets register as healthy and the load balancer distributes traffic normally.",
    technicalContext: {
      commands: [
        "curl -v http://localhost:8080/health",
        "aws elbv2 describe-target-health --target-group-arn <arn>",
        "ss -tlnp | grep 8080",
      ],
      logSnippet:
        "Health check failed: target group arn:aws:elasticloadbalancing:...\nTarget id: i-0abc123\nReason: Health checks failed with these codes: [502]",
      configSnippet:
        "HealthCheck:\n  Path: /health\n  Port: 8080\n  Protocol: HTTP\n  HealthyThresholdCount: 2\n  UnhealthyThresholdCount: 3\n  IntervalSeconds: 15",
    },
  },
  {
    slug: "elasticsearch-cluster-red",
    title: "Fix Elasticsearch Cluster Red Status — Restore Index Health",
    description:
      "Elasticsearch cluster status red? Identify unassigned shards and restore cluster health.",
    problem: "Elasticsearch cluster red status",
    directAnswer:
      "Elasticsearch cluster red status means one or more primary shards are unassigned, indicating potential data loss. Use GET _cat/shards to identify unassigned shards, then check _cluster/allocation/explain for the reason — typically disk space, node failure, or configuration issues.",
    instantAnswer:
      "A red cluster means at least one primary shard is unassigned. Check unassigned shards with _cat/shards, identify the cause with _cluster/allocation/explain, and resolve disk space, node, or configuration issues.",
    causes: [
      "Node failure causing primary shard loss",
      "Disk space full watermark threshold exceeded",
      "Corrupt index or shard data",
      "Insufficient nodes for replication requirements",
      "JVM heap pressure or garbage collection issues",
    ],
    fixes: [
      "Run GET _cat/shards?v&h=index,shard,prirep,state,unassigned.reason to find unassigned shards",
      "Check disk space on all nodes clear space if watermark threshold is exceeded",
      "Use POST _cluster/reroute with allocate_stale_primary for recoverable shards",
      "Add nodes to the cluster if replication factor exceeds available node count",
      "Monitor JVM heap and increase if consistently above 75% utilization",
    ],
    faqs: [
      {
        q: "What do Elasticsearch cluster colors mean?",
        a: "Green: all shards assigned. Yellow: all primary shards assigned but some replicas are not. Red: at least one primary shard is unassigned — data loss risk.",
      },
      {
        q: "How do I prevent cluster red status?",
        a: "Maintain adequate disk space (below watermark thresholds), run 3+ data nodes for fault tolerance, monitor shard allocation, and set up alerts on cluster health.",
      },
    ],
    sampleInput:
      "Elasticsearch cluster health: red, 5 unassigned primary shards, disk watermark exceeded",
    outcome:
      "All primary shards are assigned, cluster status returns to green, and shard allocation is stable.",
    technicalContext: {
      commands: [
        "GET _cat/shards?v&h=index,shard,prirep,state,unassigned.reason",
        "GET _cluster/allocation/explain",
        "GET _cat/nodes?v&h=name,disk.used_percent,heap.percent",
      ],
      logSnippet:
        "cluster health status: RED\nnumber_of_nodes: 3\nunassigned_shards: 5\ninitializing_shards: 0\nrelocating_shards: 0",
      configSnippet:
        "# elasticsearch.yml\ncluster.routing.allocation.disk.watermark.low: 85%\ncluster.routing.allocation.disk.watermark.high: 90%\ncluster.routing.allocation.disk.watermark.flood_stage: 95%",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function findFixProblem(slug: string): FixProblem | undefined {
  return fixProblems.find((p) => p.slug === slug);
}

export function getRelatedProblems(
  current: FixProblem,
  limit = 5,
): FixProblem[] {
  return fixProblems
    .filter((p) => p.slug !== current.slug)
    .slice(0, limit);
}
