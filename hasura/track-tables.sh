#!/bin/bash

# Track all tables in Hasura GraphQL Engine
HASURA_ENDPOINT="http://localhost:8081/v1/metadata"
ADMIN_SECRET="jrVx4KlySc1PoNUkbn6S41x958VtU6pR9loQHrpe44bSTlYE3qq9NGjGttaZGtR5"

echo "🔄 Tracking tables in Hasura..."

# Track all tables
curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_track_table",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "drugs"}
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_track_table", 
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "drug_interactions"}
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_track_table",
    "args": {
      "source": "default", 
      "table": {"schema": "public", "name": "genes"}
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_track_table",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "gene_drug_interactions"}
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_track_table",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "oncology_protocols"}
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_track_table",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "clinical_trials"}
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_track_table",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "patient_profiles"}
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_track_table",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "data_sync_log"}
    }
  }'

echo ""
echo "✅ All tables tracked!"

# Set up foreign key relationships
echo "🔗 Setting up relationships..."

# Drug interactions to drugs
curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_object_relationship",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "drug_interactions"},
      "name": "drug_by_drug1_rxcui",
      "using": {
        "foreign_key_constraint_on": "drug1_rxcui"
      }
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_object_relationship",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "drug_interactions"},
      "name": "drug_by_drug2_rxcui", 
      "using": {
        "foreign_key_constraint_on": "drug2_rxcui"
      }
    }
  }'

echo ""

# Gene-drug interactions to genes and drugs
curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_object_relationship",
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "gene_drug_interactions"},
      "name": "gene",
      "using": {
        "foreign_key_constraint_on": "gene_symbol"
      }
    }
  }'

echo ""

curl -X POST \
  "$HASURA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_object_relationship", 
    "args": {
      "source": "default",
      "table": {"schema": "public", "name": "gene_drug_interactions"},
      "name": "drug",
      "using": {
        "foreign_key_constraint_on": "drug_rxcui"
      }
    }
  }'

echo ""
echo "✅ Relationships created!"
echo "🎉 Hasura setup complete! Visit http://localhost:8081 to access the console."