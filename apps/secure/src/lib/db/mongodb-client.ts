/**
 * MongoDB Client for NextAuth Adapter
 * Uses the native MongoDB driver for NextAuth compatibility
 */

import { MongoClient } from "mongodb";

// Only validate at runtime, not at build time
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/placeholder";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Skip connection during build
if (process.env.NODE_ENV !== "production" || process.env.MONGODB_URI) {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Provide a dummy promise during build
  clientPromise = Promise.resolve(null as any);
}

export default clientPromise;
