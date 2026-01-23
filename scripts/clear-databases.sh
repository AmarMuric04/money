#!/bin/bash

# Script to clear all data from both secure and cashgap databases
# WARNING: This will delete ALL data from both applications!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  DATABASE CLEARING SCRIPT ⚠️${NC}"
echo "================================"
echo ""
echo "This will DELETE ALL DATA from:"
echo "  • Secure app database (password manager)"
echo "  • CashGap app database (finance tracker)"
echo ""
echo -e "${RED}⚠️  THIS ACTION CANNOT BE UNDONE! ⚠️${NC}"
echo ""

# Ask for confirmation
read -p "Are you absolutely sure you want to proceed? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$|^[Yy]$ ]]
then
    echo -e "${GREEN}✅ Operation cancelled. No data was deleted.${NC}"
    exit 0
fi

echo -e "${BLUE}🚀 Starting database clearing process...${NC}"
echo ""

# Load environment variables
if [ -f "apps/secure/.env" ]; then
    export $(cat apps/secure/.env | grep MONGODB_URI | xargs)
fi

if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}❌ Error: MONGODB_URI not found in environment${NC}"
    echo "Please set MONGODB_URI in apps/secure/.env or apps/cashgap/.env"
    exit 1
fi

# Collections for Secure app
SECURE_COLLECTIONS="users passwordentries categories sessions auditlogs ratelimits emailverificationtokens"

# Collections for CashGap app
CASHGAP_COLLECTIONS="users accounts sessions verificationtokens expenses incomes subscriptions usersettings emailverificationtokens"

# Combine all collections (remove duplicates)
ALL_COLLECTIONS=$(echo "$SECURE_COLLECTIONS $CASHGAP_COLLECTIONS" | tr ' ' '\n' | sort -u | tr '\n' ' ')

# Extract database name from URI
DB_NAME=$(echo "$MONGODB_URI" | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
    DB_NAME="cashgap"
fi

echo -e "${BLUE}📊 Database: $DB_NAME${NC}"
echo ""

# Use mongosh or mongo command
if command -v mongosh &> /dev/null; then
    MONGO_CMD="mongosh"
elif command -v mongo &> /dev/null; then
    MONGO_CMD="mongo"
else
    echo -e "${RED}❌ Error: Neither mongosh nor mongo command found${NC}"
    echo "Please install MongoDB Shell (mongosh) or use the TypeScript script instead:"
    echo "  npm run clear-db"
    exit 1
fi

echo -e "${BLUE}🔌 Using MongoDB client: $MONGO_CMD${NC}"
echo ""

# Clear each collection
for collection in $ALL_COLLECTIONS; do
    echo -e "${BLUE}🗑️  Clearing collection: $collection${NC}"
    $MONGO_CMD "$MONGODB_URI" --quiet --eval "
        db = db.getSiblingDB('$DB_NAME');
        result = db.$collection.deleteMany({});
        if (result.deletedCount > 0) {
            print('   ✓ Deleted ' + result.deletedCount + ' documents');
        } else {
            print('   ⏭️  Collection was already empty');
        }
    " 2>/dev/null || echo -e "${YELLOW}   ⚠️  Collection might not exist${NC}"
done

echo ""
echo -e "${GREEN}✅ Database clearing complete!${NC}"
echo ""
echo -e "${BLUE}💡 Note: Indexes and schemas remain intact.${NC}"
