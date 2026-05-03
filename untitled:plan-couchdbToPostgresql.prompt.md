## Plan: CouchDB to PostgreSQL migration sample app

TL;DR - Scaffold a small Node.js REST API for books, persist to CouchDB, and add PostgreSQL support with two migration modes: dual write and CouchDB CDC. Add Kubernetes manifests so the app can run in Minikube with CouchDB and PostgreSQL services.

**Steps**
1. Create project scaffold and dependencies.
   - `package.json` with Express, nano, pg, dotenv, and any utility packages.
   - `Dockerfile` for the Node app.
   - `README.md` with Minikube setup and strategy switch instructions.

2. Implement configuration and database adapters.
   - `src/config.js` reads env vars for CouchDB URL, DB name, Postgres URL, migration strategy, and app port.
   - `src/db/couchdb.js` connects to CouchDB, ensures the `books` database exists, and exports CRUD helpers.
   - `src/db/postgres.js` connects to Postgres, ensures a `books` table exists, and exports CRUD helpers.

3. Build core book service and routes.
   - `src/services/bookService.js` implements create/read/update/delete with an abstraction for the two persistence stores.
   - `src/routes/books.js` exposes REST endpoints: `GET /books`, `GET /books/:id`, `POST /books`, `PUT /books/:id`, `DELETE /books/:id`.
   - `src/app.js` wires Express, routes, error handling, and app startup.

4. Add migration strategy support.
   - `src/migration/dualWrite.js` contains logic to write to both CouchDB and Postgres when strategy is `dualwrite`.
   - `src/migration/cdc.js` subscribes to CouchDB `_changes` feed and applies inserts/updates/deletes to Postgres when strategy is `cdc`.
   - `src/migration/backfill.js` exports a backfill function that reads all CouchDB docs and writes them into Postgres.
   - Add `POST /migration/backfill` and optional `GET /migration/status` endpoints if needed.

5. Add Kubernetes manifests for Minikube.
   - `k8s/couchdb.yaml` for CouchDB Deployment/Service, with admin credentials and a PVC or emptyDir volume.
   - `k8s/postgres.yaml` for Postgres Deployment/Service, with password and a PVC or emptyDir.
   - `k8s/app.yaml` for the Node.js app Deployment/Service, using env vars for strategy and DB connection.
   - Consider a single `k8s/all.yaml` to install everything together.

6. Document usage and strategy switching.
   - Include commands for `minikube start`, `kubectl apply -f k8s/all.yaml`, and `kubectl port-forward` or `minikube service`.
   - Describe toggling `MIGRATION_STRATEGY=dualwrite` vs `cdc`.
   - Note that the `dualwrite` mode writes to both stores, while `cdc` mode uses CouchDB `_changes` for Postgres replication and a backfill endpoint for historical documents.

**Verification**
1. Start Minikube and apply `k8s/all.yaml`.
2. Confirm CouchDB, PostgreSQL, and app pods are running.
3. Use `curl` or Postman to create/list/update/delete books against the app.
4. Verify documents are stored in CouchDB and rows appear in Postgres.
5. Toggle `MIGRATION_STRATEGY` and verify the correct replication path works.

**Decisions**
- Use JavaScript/Express for minimal setup.
- Use environment variables for migration strategy and DB endpoints.
- Provide both a dual-write path and a CDC listener in one app, controlled by a feature switch.
- No tests and no auth, per request.
