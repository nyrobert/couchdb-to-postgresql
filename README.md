# CouchDB to PostgreSQL migration PoC

This sample app exposes a REST CRUD API for books, stores the canonical data in CouchDB, and supports migration to PostgreSQL using two strategies:

- `dualwrite`: write each change to CouchDB and Postgres simultaneously
- `cdc`: write only to CouchDB and replicate changes into Postgres with CouchDB `_changes`

## Setup

### Local development

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

## Quick start

1. Start Minikube with Podman driver:

   ```bash
   minikube start --driver=podman
   ```

2. Build the app image:

   ```bash
   podman build -t couchdb-to-postgresql:latest .
   ```

3. Apply the Kubernetes resources:

   ```bash
   kubectl apply -f k8s/all.yaml
   ```

4. Forward the app port:

   ```bash
   kubectl port-forward -n couchdb-postgres svc/couchdb-to-postgresql-app 3000:3000
   ```

5. Use the API:

   - `GET /books`
   - `GET /books/:id`
   - `POST /books`
   - `PUT /books/:id`
   - `DELETE /books/:id`

   Example:

   ```bash
   curl -X POST http://localhost:3000/books \
     -H 'Content-Type: application/json' \
     -d '{"title":"The Pragmatic Programmer","author":"Andrew Hunt","publishedDate":"1999-10-20","summary":"A journey into pragmatic software development."}'
   ```

## Migration strategy

Set `MIGRATION_STRATEGY` on the app deployment to one of:

- `dualwrite` — writes API changes to CouchDB and Postgres immediately
- `cdc` — writes only to CouchDB and streams changes from CouchDB into Postgres

The deployment in `k8s/all.yaml` is configured with `MIGRATION_STRATEGY=dualwrite`.

## Backfill historical data

If you want to replay all current CouchDB books into Postgres, use the backfill endpoint:

```bash
curl -X POST http://localhost:3000/migration/backfill
```

## Notes

- The primary data store for the REST API is CouchDB.
- Postgres is used as a target store for migration experiments.
- No auth is configured in this sample.

## License

This project is licensed under the terms of the [MIT License (MIT)](LICENSE).
