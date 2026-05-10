# Azure Developer Course — Full Stack Project (AZ-204)

Node.js + Express backend · React + Tailwind frontend · Azure cloud services

---

## Quick start (local dev)

```bash
# 1. Backend
cd backend
cp .env.example .env      # fill in your Azure keys
npm install
npm run dev               # http://localhost:3001

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env      # fill in your Entra ID app IDs
npm install
npm run dev               # http://localhost:5173
```

---

## Project structure

```
azure-course-project/
├── backend/
│   ├── index.js                   # Entry point (App Insights + Express)
│   ├── routes/
│   │   ├── health.js              # Module 01 — App Service health endpoint
│   │   ├── notes.js               # Module 04 — Cosmos DB CRUD
│   │   ├── files.js               # Module 03 — Blob Storage upload/download
│   │   └── events.js              # Module 09 — Event Grid webhook
│   ├── services/
│   │   ├── cosmos.js              # Module 04 — Cosmos DB client
│   │   ├── blob.js                # Module 03 — Blob Storage client
│   │   ├── keyvault.js            # Module 07 — Key Vault secrets
│   │   └── serviceBus.js          # Module 10 — Service Bus sender
│   ├── middleware/
│   │   └── auth.js                # Module 06 — JWT / Entra ID validation
│   ├── functions/
│   │   └── handlers.js            # Module 02, 10 — Azure Functions
│   └── Dockerfile                 # Module 05 — Container image
│
├── frontend/
│   ├── src/
│   │   ├── auth/msalConfig.js     # Module 06 — MSAL configuration
│   │   ├── lib/api.js             # Axios client with Bearer token
│   │   ├── hooks/
│   │   │   ├── useHealth.js       # Module 01
│   │   │   ├── useNotes.js        # Module 04
│   │   │   └── useFiles.js        # Module 03
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Module 01 — health status
│   │   │   ├── NotesPage.jsx      # Module 04 — CRUD UI
│   │   │   ├── FilesPage.jsx      # Module 03 — file upload UI
│   │   │   └── DashboardPage.jsx  # Module 08, 11 — metrics
│   │   └── components/Layout.jsx  # Nav + auth button
│   └── Dockerfile                 # Module 05 — nginx static container
│
└── docker-compose.yml             # Module 05 — local orchestration
```

---

## Module setup guide

### Day 1

#### Module 01 · App Service Web Apps
1. Create an App Service Plan (B1 tier) in Azure Portal
2. Create a Web App (Node.js 20 LTS runtime)
3. Under **Configuration > Application settings**, add all env vars from `backend/.env`
4. Deploy: `az webapp deployment source config-zip --src backend.zip`
5. Test: `curl https://<your-app>.azurewebsites.net/health`

#### Module 02 · Azure Functions
1. Create a Function App in Azure Portal (Node.js 20)
2. The handlers are in `backend/functions/handlers.js`
3. Create three functions: `HttpTrigger`, `ServiceBusQueueTrigger`, `BlobTrigger`
4. Local testing: `npm install -g azure-functions-core-tools && func start`

---

### Day 2

#### Module 03 · Blob Storage
1. Create a Storage Account in Azure Portal
2. Create a container named `uploads` (Private access)
3. Copy the connection string to `.env` as `AZURE_STORAGE_CONNECTION_STRING`
4. Test: upload a file on the Files page

#### Module 04 · Cosmos DB
1. Create a Cosmos DB account (API: NoSQL)
2. The app auto-creates the `azurecourse` database and `notes` container on first run
3. Set `COSMOS_ENDPOINT` and `COSMOS_KEY` in `.env`
4. Test: create a note on the Notes page and verify it in Data Explorer

---

### Day 3

#### Module 05 · Containerized Solutions
```bash
# Build and push to Azure Container Registry
az acr create --name <registry> --sku Basic
az acr login --name <registry>

docker build -t <registry>.azurecr.io/backend:v1 ./backend
docker push <registry>.azurecr.io/backend:v1

# Deploy to Azure Container Instances
az container create \
  --name azure-course-backend \
  --image <registry>.azurecr.io/backend:v1 \
  --ports 3001 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables COSMOS_KEY=$COSMOS_KEY
```

#### Module 06 · User Authentication
1. Register an app in **Entra ID > App registrations**
2. Add a Redirect URI: `http://localhost:5173` (SPA type)
3. Expose an API scope: `access_as_user`
4. Copy `client_id` and `tenant_id` to `frontend/.env`
5. Add `AZURE_TENANT_ID` and `AZURE_CLIENT_ID` to backend `.env`

#### Module 07 · Secure Cloud Solutions (Key Vault)
1. Create a Key Vault in Azure Portal
2. Add secrets named: `cosmos-key`, `storage-connection-string`, etc.
3. Enable System-Assigned Managed Identity on the App Service
4. Assign the "Key Vault Secrets User" role to the identity
5. Set `KEY_VAULT_NAME` in App Service configuration

---

### Day 4

#### Module 08 · API Management
1. Create an API Management instance (Developer tier)
2. Import your backend as an API (OpenAPI or HTTP)
3. Add a rate-limit policy: 100 calls/min per subscription key
4. Use the APIM gateway URL in your frontend `VITE_API_BASE_URL`

#### Module 09 · Event-Based Solutions (Event Grid)
1. Go to your Storage Account > Events
2. Create an event subscription: `Microsoft.Storage.BlobCreated`
3. Set the endpoint to: `https://<your-backend>/api/events/grid`
4. The webhook handler is in `backend/routes/events.js`

#### Module 10 · Message-Based Solutions (Service Bus)
1. Create a Service Bus namespace (Basic tier)
2. Create a queue named `notes-queue`
3. Copy the connection string to `.env` as `SERVICE_BUS_CONNECTION_STRING`
4. Deploy the `ServiceBusQueueTrigger` Azure Function to process messages

---

### Day 5

#### Module 11 · Application Insights
1. Create an Application Insights resource in Azure Portal
2. Copy the **Connection String** (not just the key)
3. Set `APPINSIGHTS_CONNECTION_STRING` in backend `.env`
4. Restart the backend — telemetry flows automatically
5. View: Azure Portal > Application Insights > Live Metrics / Transaction search

---

## Tech stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, React Router, Tailwind CSS, Vite      |
| Auth      | @azure/msal-react, @azure/msal-browser          |
| Backend   | Node.js 20, Express 4                           |
| Database  | Azure Cosmos DB (@azure/cosmos)                 |
| Storage   | Azure Blob Storage (@azure/storage-blob)        |
| Secrets   | Azure Key Vault (@azure/keyvault-secrets)       |
| Messaging | Azure Service Bus (@azure/service-bus)          |
| Events    | Azure Event Grid (webhook)                      |
| Telemetry | Application Insights (applicationinsights SDK)  |
| Containers| Docker, Azure Container Registry, ACI           |
