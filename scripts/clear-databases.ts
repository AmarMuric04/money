#!/usr/bin/env tsx
/**
 * Script to clear all data from both secure and cashgap databases
 * WARNING: This will delete ALL data from both applications!
 */

import { MongoClient } from "mongodb";
import * as readline from "readline";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env files
function loadEnv(envPath: string): Record<string, string> {
  try {
    const envContent = readFileSync(envPath, "utf-8");
    const env: Record<string, string> = {};
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    });
    return env;
  } catch (error) {
    return {};
  }
}

// Try to load from both app .env files
const secureEnv = loadEnv(resolve(__dirname, "../apps/secure/.env"));
const cashgapEnv = loadEnv(resolve(__dirname, "../apps/cashgap/.env"));

// Database URIs - these should match your .env files
const SECURE_DB_URI =
  secureEnv.MONGODB_URI ||
  process.env.SECURE_MONGODB_URI ||
  process.env.MONGODB_URI;
const CASHGAP_DB_URI =
  cashgapEnv.MONGODB_URI ||
  process.env.CASHGAP_MONGODB_URI ||
  process.env.MONGODB_URI;

// Collections to clear for each app
const SECURE_COLLECTIONS = [
  "users",
  "passwordentries",
  "categories",
  "sessions",
  "auditlogs",
  "ratelimits",
  "emailverificationtokens",
];

const CASHGAP_COLLECTIONS = [
  "users",
  "accounts",
  "sessions",
  "verificationtokens",
  "expenses",
  "incomes",
  "subscriptions",
  "usersettings",
  "emailverificationtokens",
];

async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

async function clearDatabase(
  uri: string,
  collections: string[],
  dbName: string,
) {
  if (!uri) {
    console.log(`⚠️  No URI provided for ${dbName}, skipping...`);
    return;
  }

  console.log(`\n🔌 Connecting to ${dbName}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`✅ Connected to ${dbName}`);

    const db = client.db();
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map((c) => c.name);

    let deletedCount = 0;
    let totalDocuments = 0;

    for (const collectionName of collections) {
      if (!existingCollectionNames.includes(collectionName)) {
        console.log(
          `⏭️  Collection "${collectionName}" doesn't exist, skipping...`,
        );
        continue;
      }

      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();

      if (count > 0) {
        const result = await collection.deleteMany({});
        console.log(
          `🗑️  Deleted ${result.deletedCount} documents from "${collectionName}"`,
        );
        deletedCount += result.deletedCount;
        totalDocuments += count;
      } else {
        console.log(`⏭️  Collection "${collectionName}" is already empty`);
      }
    }

    console.log(`\n📊 ${dbName} Summary:`);
    console.log(`   Total documents deleted: ${deletedCount}`);
    console.log(
      `   Collections cleared: ${collections.filter((c) => existingCollectionNames.includes(c)).length}`,
    );
  } catch (error) {
    console.error(`❌ Error clearing ${dbName}:`, error);
  } finally {
    await client.close();
    console.log(`🔌 Disconnected from ${dbName}`);
  }
}

async function main() {
  console.log("⚠️  DATABASE CLEARING SCRIPT ⚠️");
  console.log("================================\n");
  console.log("This will DELETE ALL DATA from:");
  console.log("  • Secure app database (password manager)");
  console.log("  • CashGap app database (finance tracker)");
  console.log("\n⚠️  THIS ACTION CANNOT BE UNDONE! ⚠️\n");

  const confirmed = await askConfirmation(
    "Are you absolutely sure you want to proceed? (yes/no): ",
  );

  if (!confirmed) {
    console.log("\n✅ Operation cancelled. No data was deleted.");
    process.exit(0);
  }

  console.log("\n🚀 Starting database clearing process...\n");

  // Check if we're using the same database for both apps
  const sameDatabase = SECURE_DB_URI === CASHGAP_DB_URI;

  if (sameDatabase) {
    console.log("ℹ️  Both apps use the same database URI");
    const allCollections = [
      ...new Set([...SECURE_COLLECTIONS, ...CASHGAP_COLLECTIONS]),
    ];
    await clearDatabase(SECURE_DB_URI!, allCollections, "Shared Database");
  } else {
    // Clear Secure database
    await clearDatabase(SECURE_DB_URI!, SECURE_COLLECTIONS, "Secure App");

    // Clear CashGap database
    await clearDatabase(CASHGAP_DB_URI!, CASHGAP_COLLECTIONS, "CashGap App");
  }

  console.log("\n✅ Database clearing complete!");
  console.log("\n💡 Note: Indexes and schemas remain intact.");
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
