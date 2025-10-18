import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Hasura GraphQL endpoint
const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT || 'http://localhost:8081/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET; // no default in code

// Create HTTP link
const httpLink = createHttpLink({
  uri: HASURA_ENDPOINT,
});

// Create auth link with admin secret
const authLink = setContext((_, { headers }) => {
  const extra = HASURA_ADMIN_SECRET ? { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } : {};
  return { headers: { ...headers, ...extra } };
});

// Create Apollo Client
export const hasuraClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL queries and mutations
export const QUERIES = {
  // Get drug by RXCUI
  GET_DRUG_BY_RXCUI: `
    query GetDrugByRxcui($rxcui: String!) {
      drugs(where: {rxcui: {_eq: $rxcui}}) {
        id
        rxcui
        name
        generic_name
        brand_names
        active_ingredients
        dosage_forms
        strengths
        therapeutic_class
        indication
        contraindications
        warnings
        adverse_reactions
        dosing
        metabolism
        created_at
        updated_at
      }
    }
  `,

  // Search drugs by name
  SEARCH_DRUGS: `
    query SearchDrugs($searchTerm: String!) {
      drugs(
        where: {
          _or: [
            {name: {_ilike: $searchTerm}},
            {generic_name: {_ilike: $searchTerm}},
            {brand_names: {_has_key: $searchTerm}}
          ]
        }
        limit: 50
      ) {
        id
        rxcui
        name
        generic_name
        brand_names
        therapeutic_class
        indication
      }
    }
  `,

  // Get drug interactions
  GET_DRUG_INTERACTIONS: `
    query GetDrugInteractions($rxcui: String!) {
      drug_interactions(
        where: {
          _or: [
            {drug1_rxcui: {_eq: $rxcui}},
            {drug2_rxcui: {_eq: $rxcui}}
          ]
        }
      ) {
        id
        drug1_rxcui
        drug2_rxcui
        severity
        mechanism
        effect
        management
        evidence_level
        sources
        drug1: drug_by_drug1_rxcui {
          name
          generic_name
        }
        drug2: drug_by_drug2_rxcui {
          name
          generic_name
        }
      }
    }
  `,

  // Check interactions between multiple drugs
  CHECK_MULTIPLE_INTERACTIONS: `
    query CheckMultipleInteractions($rxcuis: [String!]!) {
      drug_interactions(
        where: {
          _and: [
            {drug1_rxcui: {_in: $rxcuis}},
            {drug2_rxcui: {_in: $rxcuis}}
          ]
        }
      ) {
        id
        drug1_rxcui
        drug2_rxcui
        severity
        mechanism
        effect
        management
        evidence_level
        sources
        drug1: drug_by_drug1_rxcui {
          name
          generic_name
        }
        drug2: drug_by_drug2_rxcui {
          name
          generic_name
        }
      }
    }
  `,

  // Get gene-drug interactions
  GET_GENE_DRUG_INTERACTIONS: `
    query GetGeneDrugInteractions($geneSymbol: String, $drugRxcui: String) {
      gene_drug_interactions(
        where: {
          _and: [
            {gene_symbol: {_eq: $geneSymbol}},
            {drug_rxcui: {_eq: $drugRxcui}}
          ]
        }
      ) {
        id
        gene_symbol
        drug_rxcui
        phenotype
        recommendation
        evidence_level
        implications
        dosage_adjustment
        sources
        gene {
          name
          function
          clinical_significance
        }
        drug {
          name
          generic_name
          therapeutic_class
        }
      }
    }
  `,

  // Get all CPIC guidelines
  GET_CPIC_GUIDELINES: `
    query GetCpicGuidelines {
      gene_drug_interactions(where: {sources: {_has_key: "CPIC"}}) {
        gene_symbol
        drug_rxcui
        phenotype
        recommendation
        evidence_level
        implications
        gene {
          symbol
          name
        }
        drug {
          name
          generic_name
        }
      }
    }
  `,

  // Get oncology protocols
  GET_ONCOLOGY_PROTOCOLS: `
    query GetOncologyProtocols($cancerType: String) {
      oncology_protocols(
        where: {cancer_type: {_ilike: $cancerType}}
        order_by: {sequence_order: asc}
      ) {
        id
        protocol_name
        cancer_type
        stage
        guideline_source
        drugs
        sequence_order
        duration_weeks
        efficacy_data
        toxicity_profile
        contraindications
      }
    }
  `,

  // Get clinical trials
  GET_CLINICAL_TRIALS: `
    query GetClinicalTrials($condition: String, $drugs: [String!]) {
      clinical_trials(
        where: {
          _and: [
            {condition: {_ilike: $condition}},
            {drugs: {_has_keys_any: $drugs}}
          ]
        }
      ) {
        id
        nct_id
        title
        status
        phase
        condition
        intervention
        drugs
        eligibility_criteria
        locations
        contact_info
      }
    }
  `
};

export const MUTATIONS = {
  // Insert or update drug
  UPSERT_DRUG: `
    mutation UpsertDrug($drug: drugs_insert_input!) {
      insert_drugs_one(
        object: $drug
        on_conflict: {
          constraint: drugs_rxcui_key
          update_columns: [
            name, generic_name, brand_names, active_ingredients,
            dosage_forms, strengths, fda_application_number, ndc,
            therapeutic_class, indication, contraindications,
            warnings, adverse_reactions, dosing, metabolism, updated_at
          ]
        }
      ) {
        id
        rxcui
        name
        updated_at
      }
    }
  `,

  // Insert drug interaction
  INSERT_DRUG_INTERACTION: `
    mutation InsertDrugInteraction($interaction: drug_interactions_insert_input!) {
      insert_drug_interactions_one(
        object: $interaction
        on_conflict: {
          constraint: drug_interactions_drug1_rxcui_drug2_rxcui_key
          update_columns: [severity, mechanism, effect, management, evidence_level, sources, updated_at]
        }
      ) {
        id
        drug1_rxcui
        drug2_rxcui
        severity
      }
    }
  `,

  // Insert gene-drug interaction
  INSERT_GENE_DRUG_INTERACTION: `
    mutation InsertGeneDrugInteraction($interaction: gene_drug_interactions_insert_input!) {
      insert_gene_drug_interactions_one(
        object: $interaction
        on_conflict: {
          constraint: gene_drug_interactions_gene_symbol_drug_rxcui_key
          update_columns: [phenotype, recommendation, evidence_level, implications, dosage_adjustment, sources, updated_at]
        }
      ) {
        id
        gene_symbol
        drug_rxcui
      }
    }
  `,

  // Log data sync activity
  LOG_SYNC_ACTIVITY: `
    mutation LogSyncActivity($log: data_sync_log_insert_input!) {
      insert_data_sync_log_one(object: $log) {
        id
        source
        sync_type
        status
        started_at
      }
    }
  `,

  // Update sync status
  UPDATE_SYNC_STATUS: `
    mutation UpdateSyncStatus($id: uuid!, $status: String!, $records_processed: Int, $records_added: Int, $records_updated: Int, $errors: [String!], $completed_at: timestamptz) {
      update_data_sync_log_by_pk(
        pk_columns: {id: $id}
        _set: {
          status: $status
          records_processed: $records_processed
          records_added: $records_added
          records_updated: $records_updated
          errors: $errors
          completed_at: $completed_at
        }
      ) {
        id
        status
        completed_at
      }
    }
  `
};

// Helper function to execute GraphQL queries
export const executeQuery = async (query, variables = {}) => {
  try {
    const result = await hasuraClient.query({
      query: gql(query),
      variables,
      fetchPolicy: 'network-only'
    });
    return result.data;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
};

// Helper function to execute GraphQL mutations
export const executeMutation = async (mutation, variables = {}) => {
  try {
    const result = await hasuraClient.mutate({
      mutation: gql(mutation),
      variables
    });
    return result.data;
  } catch (error) {
    console.error('GraphQL mutation error:', error);
    throw error;
  }
};

export default hasuraClient;
