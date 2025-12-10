# DMS-DOTNETREACT

Simple .NET 10 Web API with a React/Vite frontend for testing CRUD on `TestModel` (SQL Server).

## Prerequisites
- .NET 8/10 SDK
- Node.js 18+
- SQL Server / LocalDB (`(localdb)\MSSQLLocalDB` by default)

## Backend (API)
```bash
cd DMS-DOTNETREACT/DMS-DOTNETREACT
dotnet run --project DMS-DOTNETREACT.csproj
```
The API listens on `http://localhost:5024` (see `Properties/launchSettings.json`). Connection string `DefaultConnection` is configured in `appsettings*.json`.

## Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```
Frontend runs at `http://localhost:5173` and calls the API at `http://localhost:5024` by default (set `VITE_API_BASE` to override).

## API endpoints
- Add your own controllers for clinic entities (Users/Patients/Doctors/Appointments/etc.). Sample CORS and database wiring are already configured.

## Azure deployment notes
- Use Azure SQL and place its ADO.NET connection string in App Service settings: `ConnectionStrings:DefaultConnection`.
- Enable “Allow Azure services” in SQL firewall and add client IP for local testing.
- `TrustServerCertificate=True` is included in the default string; adjust as needed for your cert policy.

