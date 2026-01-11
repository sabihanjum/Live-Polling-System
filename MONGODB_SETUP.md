# MongoDB Setup Guide

## Local Installation

### Windows

1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Install MongoDB as a Service"
4. MongoDB will start automatically on `mongodb://localhost:27017`

### macOS (using Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
# Follow the official MongoDB installation guide
```

## Verify Installation

```bash
mongo --version
# Or for MongoDB 6.0+
mongosh --version
```

## Connection String

For local development, the default connection string is:
```
mongodb://localhost:27017/polling-system
```

## Environment Configuration

Set the MongoDB URI in your `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/polling-system
```

## Using MongoDB Atlas (Cloud)

For cloud-hosted MongoDB:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Add to `.env`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/polling-system?retryWrites=true&w=majority
```

## Troubleshooting

**Port 27017 already in use:**
- Change the port in MongoDB config and update connection string

**Connection refused:**
- Ensure MongoDB service is running
- On Windows: Check Services app for "MongoDB" service
- On macOS: Run `brew services start mongodb-community`
- On Linux: Run `sudo systemctl start mongod`

**Authentication issues:**
- For local development, no authentication is required by default
- For production, always use strong passwords and authentication

## Data Persistence

MongoDB automatically persists data in:
- **Windows**: `C:\data\db`
- **macOS/Linux**: `/usr/local/var/mongodb` or `/data/db`

Make sure these directories exist and have proper permissions.
