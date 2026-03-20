# CYLTFR App — Application Architecture Documentation

> **Check Your Long Term Flood Risk — Front-End Application**
> Version 5.6.0 | Node.js 22+ | Hapi.js 21

---

## 1. Executive Summary

The CYLTFR App is the public-facing web application for the UK Government's **Check Your Long Term Flood Risk** service, operated by DEFRA (Department for Environment, Food & Rural Affairs). It allows members of the public to enter their postcode, select an address in England, and receive an assessment of their long-term flood risk across four hazard types: Rivers & Sea, Surface Water, Groundwater, and Reservoirs.

The application is built as a server-rendered Node.js application using the **Hapi.js** framework, with **Nunjucks** templates and the **GOV.UK Frontend** design system. It acts as an orchestration layer — it does not hold flood data itself, instead calling a suite of downstream APIs (the internal `cyltfr-service`, Ordnance Survey APIs, and a flood warnings service) to assemble the data needed to render each page.

The application sits within a wider DEFRA service ecosystem:
- [`cyltfr-service`](https://github.com/DEFRA/cyltfr-service) — the backend spatial data API
- [`cyltfr-data`](https://github.com/DEFRA/cyltfr-data) — the geospatial data pipeline
- [`cyltfr-admin`](https://github.com/DEFRA/cyltfr-admin) — internal administration tooling

---

## 2. Technology Stack

| Category | Technology | Version |
|---|---|---|
| Language | Node.js | ≥ 22.14.0 |
| Web Framework | Hapi.js (`@hapi/hapi`) | ^21.4.4 |
| Template Engine | Nunjucks | ^3.2.4 |
| UI Framework | GOV.UK Frontend | ^6.0.0 |
| CSS Pre-processor | Sass | ^1.94.2 |
| JS Bundler | Webpack | ^5.103.0 |
| Session Management | @hapi/yar | ^11.0.3 |
| Cache (in-memory) | @hapi/catbox-memory | ^6.0.2 |
| Cache (distributed) | @hapi/catbox-redis | 7.0.2 |
| HTTP Client | @hapi/wreck | ^18.1.0 |
| Input Validation | Joi | ^18.0.2 |
| Logging | hapi-pino | ^13.0.0 |
| Rate Limiting | hapi-rate-limit | ^8.0.0 |
| Proxy (HTTP) | @hapi/h2o2 | ^10.0.4 |
| Static Assets | @hapi/inert | ^7.1.0 |
| Bot Protection | FriendlyCaptcha (`@friendlycaptcha/sdk`) | ^0.1.33 |
| Error Monitoring | Airbrake / Errbit (`@airbrake/node`) | ^2.1.9 |
| Map Layers | ESRI ArcGIS (`@arcgis/core`) | ^4.34.8 |
| Map Tiles | Ordnance Survey Maps API | — |
| Process Manager | PM2 | — |
| Tests | Jest | ^30.2.0 |
| Linting | ESLint + neostandard | ^9.39.2 |
| Container Base | defradigital/node | 2.5.3-node22.14.0 |

---

## 3. System Context

The diagram below shows the CYLTFR App in the context of its users and the external systems it interacts with.

```mermaid
flowchart LR
    User(["Public User"])

    subgraph App ["CYLTFR App"]
        Server["Hapi.js Server"]
    end

    subgraph External ["External Services"]
        Svc["cyltfr-service"]
        OS["Ordnance Survey APIs"]
        Warnings["Flood Warnings API"]
        ArcGIS["ESRI ArcGIS"]
        Captcha["FriendlyCaptcha"]
        Errbit["Errbit"]
    end

    User -->|"HTTPS"| Server
    Server -->|"flood risk"| Svc
    Server -->|"address / map tokens"| OS
    Server -->|"flood warnings"| Warnings
    Server -->|"map layer tokens"| ArcGIS
    Server -->|"bot verification"| Captcha
    Server -->|"error reports"| Errbit
```

The app is a single server-rendered Node.js process. All external service calls are made server-side; the browser only communicates directly with external services for map tiles (after receiving tokens from the server).

---

## 4. Container Architecture

The CYLTFR App is deployed as a single Docker container. The diagram below shows the major runtime containers and their relationships.

```mermaid
flowchart TD
    User(["Public User"])

    subgraph Container ["CYLTFR App Container"]
        Server["Hapi.js Server\n(Node.js 22)"]
        Cache[("Server Cache\n(Redis / In-Memory)")]
    end

    subgraph Services ["External Services"]
        Risk["cyltfr-service"]
        OS["Ordnance Survey"]
        Flood["Flood Warnings API"]
        ArcGIS["ESRI ArcGIS"]
        FC["FriendlyCaptcha"]
        Err["Errbit"]
    end

    User -->|"HTTPS :3000"| Server
    Server <-->|"Catbox"| Cache
    Server --> Risk
    Server --> OS
    Server --> Flood
    Server --> ArcGIS
    Server --> FC
    Server --> Err
```

The server cache uses **Redis** in production (for shared state across PM2 worker processes) and an **in-memory** Catbox store in development and test. Session data is stored entirely in the cache; only a session ID cookie is sent to the browser.

---

## 5. Component Architecture

The diagram below breaks the Hapi.js server into its major internal layers and shows how they interact.

```mermaid
flowchart TD
    subgraph Bootstrap ["Bootstrap"]
        A["index.js"]
        B["server/index.js"]
        C["config.js"]
        D["cache.js"]
    end

    subgraph Plugins ["Hapi Plugins"]
        E["views\n(Nunjucks)"]
        F["session\n(yar)"]
        G["rate-limit"]
        H["error-pages"]
        I["logging + airbrake"]
    end

    subgraph Routing ["Request Handling"]
        J["router\n(24 routes)"]
        K["route handlers\n(routes/)"]
    end

    subgraph ServiceLayer ["Service Layer"]
        L["server methods\n(cached wrappers)"]
        M["services\n(address, risk, flood, osapi, captcha)"]
        N["util.js\n(HTTP client)"]
    end

    subgraph Rendering ["Response"]
        O["view models\n(models/)"]
        P["Nunjucks views\n(views/)"]
    end

    A --> B --> C
    B --> D
    B --> Plugins
    B --> J
    J --> K
    K --> L --> M --> N
    K --> O --> P
```

| Layer | Responsibility |
|---|---|
| **Bootstrap** | Loads `.env`, validates config with Joi, creates Hapi server, configures Catbox cache |
| **Hapi Plugins** | Cross-cutting concerns: templating, sessions, rate limiting, error pages, structured logging, error monitoring |
| **Request Handling** | Maps URL paths to handler functions; each handler is a standalone module in `routes/` |
| **Service Layer** | Server methods wrap service functions with a 100-second Catbox cache; services are thin HTTP clients using `util.js` / `@hapi/wreck` |
| **Response** | View models transform raw API data into view-ready objects; Nunjucks renders the final HTML using GOV.UK Frontend components |

---

## 6. Plugin Registration Order

Plugins are registered in this exact sequence in `server/index.js`. Order is significant — session depends on cache, error-pages must follow the router, and airbrake is conditional.

```mermaid
flowchart TD
    A["@hapi/h2o2\n(proxy)"]
    B["@hapi/inert\n(static files)"]
    C["views\n(Nunjucks)"]
    D["router\n(all routes)"]
    E["rate-limit"]
    F["error-pages\n(onPreResponse)"]
    G["full-url\n(onPostHandler)"]
    H["logging\n(pino)"]
    I["session\n(yar)"]
    J["cookies"]
    K["blipp"]
    L{"errbit.postErrors?"}
    M["airbrake"]
    N["server methods"]

    A --> B --> C --> D --> E --> F --> G --> H --> I --> J --> K --> L
    L -- yes --> M --> N
    L -- no --> N
```

---

## 7. Request Flow — Postcode to Address List

The sequence below covers the first half of the user journey: entering a postcode through to seeing the address selector.

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Server as Hapi Server
    participant Session as Session Store
    participant Captcha as FriendlyCaptcha
    participant AddressAPI as OS Address API

    User->>Browser: Navigate to /
    Browser->>Server: GET /
    Server-->>Browser: 301 → /postcode

    Browser->>Server: GET /postcode
    Server->>Session: clear stored address
    Server-->>Browser: render postcode.html

    User->>Browser: Enter postcode, solve CAPTCHA
    Browser->>Server: POST /postcode
    Server->>Captcha: POST verify token
    Captcha-->>Server: success: true
    Server->>Session: store postcode + token
    Server-->>Browser: 302 → /search?postcode=...

    Browser->>Server: GET /search
    Server->>Session: validate captcha token
    Server->>AddressAPI: find addresses (cached)
    AddressAPI-->>Server: address list
    Server->>Session: store addresses
    Server-->>Browser: render search.html
```

---

## 8. Request Flow — Address Selection to Risk Result

The second half of the journey: selecting an address and viewing the flood risk summary.

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Server as Hapi Server
    participant Session as Session Store
    participant RiskAPI as cyltfr-service

    User->>Browser: Select address, submit
    Browser->>Server: POST /search
    Server->>Session: store address (x, y)
    Server-->>Browser: 302 → /risk

    Browser->>Server: GET /risk
    Server->>Session: read address x, y
    Server->>RiskAPI: GET /floodrisk/{x}/{y} (cached)
    RiskAPI-->>Server: risk scores + detail
    Server->>Session: store risk data
    Server-->>Browser: render risk.html
```

The `risk` session value is subsequently reused by the depth detail pages (`/rivers-and-sea-depth`, `/surface-water-depth`) to avoid re-fetching risk data.

---

## 9. Data Flow

```mermaid
flowchart TD
    subgraph Input ["User Input"]
        A["Enter postcode"]
        B["Select address"]
    end

    subgraph Validation ["Validation"]
        C["Postcode normalisation"]
        D["CAPTCHA check"]
        E["Joi payload validation"]
    end

    subgraph SessionStore ["Session Store"]
        F[("postcode + token")]
        G[("address x, y")]
        H[("risk data")]
    end

    subgraph CachedCalls ["External Calls (100s cache)"]
        I["Address lookup\n(OS API)"]
        J["Flood warnings\n(Warnings API)"]
        K["Flood risk\n(cyltfr-service)"]
        L["Depth data\n(cyltfr-service)"]
    end

    subgraph Views ["Rendered Views"]
        M["search.html"]
        N["risk.html"]
        O["depth pages"]
        P["map pages"]
    end

    A --> C --> D --> F
    B --> E --> G
    F --> I --> M
    F --> J --> M
    G --> K --> H --> N
    G --> L --> O
    H --> P
```

---

## 10. Caching Architecture

All calls to external APIs are routed through Hapi server methods, which provide transparent caching via Catbox.

```mermaid
flowchart LR
    subgraph RouteHandlers ["Route Handlers"]
        A["routes/*.js"]
    end

    subgraph ServerMethods ["Server Methods"]
        B["find\n(address)"]
        C["riskService\nswDepth / rsDepth"]
        D["floodService"]
    end

    subgraph CacheStore ["Cache (100s TTL)"]
        E[("Redis\nor In-Memory")]
    end

    subgraph ExternalAPIs ["External APIs"]
        F["OS Names API"]
        G["cyltfr-service"]
        H["Flood Warnings API"]
    end

    A --> B & C & D
    B & C & D <-->|"read / write"| E
    B --"cache miss"--> F
    C --"cache miss"--> G
    D --"cache miss"--> H
```

**TTL:** 100 seconds for all server method caches. Controlled by `CACHE_ENABLED` (set to `false` to disable entirely). The Redis backend is enabled by `REDIS_CACHE_ENABLED=true` and supports TLS via `REDIS_TLS=true`.

---

## 11. Interactive Map Architecture

The map page has a distinct flow involving server-fetched OAuth tokens that are embedded in the page for client-side use.

```mermaid
flowchart TD
    A["GET /map"]
    B["Hapi Server"]

    subgraph TokenFetch ["Token Fetch (parallel)"]
        C["ESRI OAuth\n(client credentials)"]
        D["OS Maps OAuth\n(Basic auth)"]
    end

    E["Build MapViewModel\n(maps.json definition)"]
    F["Store token expiry\nin session"]
    G["Render map-*.html\n(tokens embedded)"]

    subgraph Client ["Browser (client-side)"]
        H["ArcGIS JS\n(flood layers)"]
        I["OS tile requests"]
    end

    J["GET /os-get-token\n(refresh endpoint)"]

    A --> B --> C & D
    C & D --> E --> F --> G
    G --> H & I
    H -->|"token expired"| J
    J --> D
```

Map layer definitions (which layers to display per map type) are loaded from versioned JSON files at `server/models/definition/{DATA_VERSION}/maps.json`. The data version is set via the `DATA_VERSION` environment variable, allowing layer configuration changes without a code deployment.

---

## 12. Error Handling

```mermaid
flowchart TD
    A["HTTP Request"]
    B["Route Handler"]
    C{"Boom error?"}
    D["onPostHandler\n(full-url)"]
    E["onPreResponse\n(cookies)"]
    F["Send Response"]
    G{"Status code"}
    H["404.html"]
    I["429.html"]
    J{"Error type"}
    K["500-error.html"]
    L["500-friendly-captcha.html"]
    M["500-session-timeout.html"]
    N["Errbit\n(if enabled)"]

    A --> B --> C
    C -- No --> D --> E --> F
    C -- Yes --> G
    G -- 404 --> H
    G -- 429 --> I
    G -- 500 --> J
    J -- address error --> K
    J -- captcha error --> L
    J -- session timeout --> M
    J -- other --> K
    C -- Yes --> N
```

The `error-pages` plugin registers an `onPreResponse` lifecycle hook. Every Boom error is intercepted and mapped to a specific error template before the response is sent. The `airbrake` plugin listens to Hapi's `request` error channel and forwards all errors to Errbit independently.

---

## 13. Bot Protection Flow

```mermaid
flowchart TD
    A["POST /postcode"]
    B{"captchaEnabled?"}
    C["Validate postcode\n→ redirect /search"]
    D{"Bypass in session?"}
    E{"Token valid\n(same postcode)?"}
    F["POST to\nFriendlyCaptcha API"]
    G{"Success?"}
    H["Store token\nin session"]
    I["Fail open\n(network error)"]
    J["Show error\n→ notify Errbit"]

    A --> B
    B -- No --> C
    B -- Yes --> D
    D -- Yes --> C
    D -- No --> E
    E -- Yes --> C
    E -- No --> F --> G
    G -- Yes --> H --> C
    G -- Network error --> I --> C
    G -- Invalid --> J
```

The token is stored in session and reused for the duration of the user journey, bounded by `SESSION_TIMEOUT` (default 10 minutes). The bypass mechanism (`FRIENDLY_CAPTCHA_BYPASS`) supports automated testing. If FriendlyCaptcha is unreachable due to a network error the application **fails open** to avoid blocking legitimate users.

---

## 14. Deployment Architecture

```mermaid
flowchart TD
    subgraph CI ["CI / CD"]
        A["GitHub source"]
        B["npm test\n(lint + jest)"]
        C["SonarCloud"]
    end

    subgraph DockerBuild ["Docker Build (multi-stage)"]
        D["dev stage\n(npm ci + webpack + sass)"]
        E["prod stage\n(omit dev deps + built assets)"]
    end

    subgraph Runtime ["Runtime"]
        F["Container\nnode index.js :3000"]
        G[("Redis Cache\n(optional)")]
    end

    H["External Services"]

    A --> B --> C
    A --> D --> E --> F
    F <-->|"Catbox"| G
    F --> H
```

**Multi-stage Docker build:**
- **`development` stage** — installs all dependencies (including dev), runs `npm run build` to produce Webpack bundles and compiled CSS, includes AWS CLI and debugger port (9229).
- **`production` stage** — installs production dependencies only, copies server source and built assets from the `development` stage. Runs as non-root `node` user.

**Health check:** Container health is verified by `curl http://localhost:{PORT}/healthcheck` with a 5-second timeout.

**Process start:** In production the container runs `node index.js` directly. The `npm start` script uses PM2 with `config/pm2.json` for multi-process deployments outside of Docker.

---

## 15. Route Inventory

| Method | Path | Description |
|---|---|---|
| GET | `/` | Permanent redirect to `/postcode` |
| GET | `/postcode` | Postcode entry form |
| POST | `/postcode` | Validates postcode and captcha; redirects to `/search` |
| GET | `/search` | Address selector for given postcode |
| POST | `/search` | Stores selected address in session; redirects to `/risk` |
| GET | `/risk` | Flood risk summary page |
| GET | `/rivers-and-sea` | Rivers and sea flood risk detail |
| GET | `/rivers-and-sea-depth` | Rivers and sea depth data |
| GET | `/surface-water` | Surface water flood risk detail |
| GET | `/surface-water-depth` | Surface water depth data |
| GET | `/ground-water` | Groundwater detail |
| GET | `/reservoirs` | Reservoir flood risk detail |
| GET | `/map` | Interactive flood risk map (`?map=` selects layer) |
| GET | `/os-get-token` | Refreshes OS Maps OAuth token for client-side use |
| GET | `/risk-data` | Static: how to access flood risk data |
| GET | `/information-for-planning` | Static: planning guidance |
| GET | `/managing-flood-risk` | Static: managing flood risk |
| GET | `/england-only` | Non-England postcode redirect page |
| GET | `/feedback` | User feedback page |
| GET | `/cookies` | Cookie policy page |
| GET | `/privacy-notice` | Privacy notice page |
| GET | `/terms-and-conditions` | Terms and conditions page |
| GET | `/accessibility-statement` | Accessibility statement page |
| GET | `/os-terms` | Ordnance Survey terms page |
| GET | `/public/*` | Static assets served via `@hapi/inert` |
| GET | `/healthcheck` | Returns `"ok"` — used by container health check |

---

## 16. Configuration Management

All configuration is read from environment variables and validated at startup by a Joi schema in `server/config.js`. If required variables are missing or invalid the server will not start. Sensitive properties (API keys, secrets, passwords) are redacted from log output by `server/sanitise-log.js`.

| Group | Key Variables |
|---|---|
| Server | `RISK_APP_HOST`, `PORT`, `NODE_ENV` |
| Backend Services | `SERVICE_URL`, `FLOOD_WARNINGS_URL`, `FLOOD_RISK_URL` |
| Ordnance Survey | `OS_POSTCODE_URL`, `OS_MAPS_URL`, `OS_SEARCH_KEY`, `OS_MAPS_KEY`, `OS_MAPS_SECRET`, `OS_TOKEN_ENDPOINT` |
| ESRI ArcGIS | `ESRI_CLIENT_ID`, `ESRI_CLIENT_SECRET` |
| Session & Cookies | `COOKIE_PASSWORD` (min 32 chars), `SESSION_TIMEOUT` |
| Redis Cache | `REDIS_CACHE_ENABLED`, `REDIS_CACHE_HOST`, `REDIS_CACHE_PORT`, `REDIS_TLS` |
| Rate Limiting | `RATE_LIMIT_ENABLED`, `RATE_LIMIT_REQUESTS`, `RATE_LIMIT_EXPIRES_IN`, `RATE_LIMIT_WHITELIST` |
| FriendlyCaptcha | `FRIENDLY_CAPTCHA_ENABLED`, `FRIENDLY_CAPTCHA_SITE_KEY`, `FRIENDLY_CAPTCHA_SECRET_KEY`, `FRIENDLY_CAPTCHA_URL`, `FRIENDLY_CAPTCHA_BYPASS` |
| Error Monitoring | `ERRBIT_POST_ERRORS`, `ERRBIT_ENV`, `ERRBIT_KEY`, `ERRBIT_HOST` |
| Analytics | `G4_ANALYTICS_ACCOUNT`, `GTAG_MANAGER_ID` |
| Performance | `HTTP_TIMEOUT_MS`, `PERFORMANCE_LOGGING` |
| Testing / Simulation | `SIMULATE_ADDRESS_SERVICE`, `DATA_VERSION`, `IS_LOCAL_ENV` |

---

## 17. Client-Side Architecture

The client-side code is built using Webpack (output to `server/public/build/`) and consists of:

- **GOV.UK Frontend** — Loaded as a JS module for accessible, GOV.UK Design System compliant UI components.
- **ESRI ArcGIS JS API (`@arcgis/core`)** — Used on `/map` for interactive flood risk map rendering. ESRI and OS tokens are injected server-side into the page config object and used to initialise the map client-side.
- **FriendlyCaptcha SDK (`@friendlycaptcha/sdk`)** — Injected on `/postcode` when `FRIENDLY_CAPTCHA_ENABLED=true`.
- **Custom SASS** — Styles compiled from `client/sass/` and `node_modules/govuk-frontend/`, output to `server/public/build/`.

Static assets are served at `/assets` via `@hapi/inert`.

---

## 18. Testing Approach

| Type | Tool | Scope |
|---|---|---|
| Unit / Integration | Jest | Service functions, route handlers, view models, plugins, config validation |
| Linting | ESLint + neostandard | All JS files |
| Dependency audit | `npm audit` | Production dependencies only (run as part of `npm test`) |
| Static analysis | SonarCloud | Connected via `sonar-project.properties` |
| Simulated data | JSON fixtures under `routes/simulated/data/` | Address and warning service simulation when `SIMULATE_ADDRESS_SERVICE=true` |

Test files are co-located with source in `__tests__/` directories. Jest manual mocks live in `__mocks__/` directories alongside the modules they replace.

---

## 19. Key Design Decisions

| Decision | Rationale |
|---|---|
| **Hapi.js over Express** | Plugin-based architecture with first-class server methods, Catbox caching, and Joi validation; used consistently across DEFRA services. |
| **External calls as server methods** | Wrapping service calls as Hapi server methods enables transparent, configurable caching without cluttering route handlers. |
| **Dual cache backends** | Redis is used in production for shared cache across PM2 worker processes. In-memory Catbox removes Redis as a local dependency in development and test. |
| **Session stored server-side** | `maxCookieSize: 0` forces all session data into the cache store; only a session ID cookie reaches the browser. This prevents session data exposure and keeps cookie payloads minimal. |
| **FriendlyCaptcha token reuse** | The captcha token is validated once and stored in session for the duration of the user journey, avoiding repeated external verification calls. |
| **Fail-open for captcha network errors** | If FriendlyCaptcha is unreachable, the application proceeds rather than blocking legitimate users. Errors are reported to Errbit. |
| **Versioned map definitions** | Map layer configuration is loaded from `server/models/definition/{DATA_VERSION}/maps.json`, allowing data version changes via environment variable without a code deployment. |
| **Non-England postcode handling** | NI, Scottish, and Welsh postcodes are detected early and redirected to an informational page — the OS address API and risk data only cover England. |
| **GOV.UK Frontend** | Ensures compliance with the GOV.UK Design System and WCAG 2.1 accessibility requirements for public-sector digital services. |
