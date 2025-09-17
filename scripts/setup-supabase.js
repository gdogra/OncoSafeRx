#!/usr/bin/env node

import fs from 'fs/promises';
import { supabaseAdmin } from '../src/config/supabase.js';

async function setupSupabaseDatabase() {
  console.log('🚀 Setting up OncoSafeRx database in Supabase...');

  try {
    // Read schema and seed files
    const schemaSQL = await fs.readFile('./supabase/schema.sql', 'utf8');
    const seedSQL = await fs.readFile('./supabase/seed.sql', 'utf8');

    console.log('📋 Executing database schema...');
    
    console.log('⚠️  Schema must be created via Supabase SQL Editor - skipping automated schema creation');
    console.log('📋 Please run the following in Supabase SQL Editor:');
    console.log('   1. Go to https://emfrwckxctyarphjvfeu.supabase.co/project/emfrwckxctyarphjvfeu/sql');
    console.log('   2. Run the contents of ./supabase/schema.sql');
    console.log('   3. Run the contents of ./supabase/seed.sql');
    console.log('');
    
    console.log('🌱 Attempting to seed sample data via API...');
    await seedDataManually();

    // Verify the setup
    await verifySetup();

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function seedDataManually() {
  console.log('🔧 Attempting manual data seeding...');
  
  try {
    // Insert genes
    const genes = [
      {
        symbol: 'CYP2D6',
        name: 'Cytochrome P450 Family 2 Subfamily D Member 6',
        chromosome: '22',
        function: 'Drug metabolism enzyme',
        clinical_significance: 'Critical for metabolism of many psychiatric and pain medications'
      },
      {
        symbol: 'CYP2C19',
        name: 'Cytochrome P450 Family 2 Subfamily C Member 19',
        chromosome: '10',
        function: 'Drug metabolism enzyme',
        clinical_significance: 'Important for metabolism of antiplatelet agents and proton pump inhibitors'
      },
      {
        symbol: 'DPYD',
        name: 'Dihydropyrimidine Dehydrogenase',
        chromosome: '1',
        function: '5-fluorouracil metabolism enzyme',
        clinical_significance: 'Essential for 5-FU toxicity prevention'
      }
    ];

    const { error: geneError } = await supabaseAdmin
      .from('genes')
      .upsert(genes, { onConflict: 'symbol' });

    if (geneError) {
      console.warn('⚠️  Gene insertion failed:', geneError.message);
    } else {
      console.log('✅ Genes inserted successfully');
    }

    // Insert drugs
    const drugs = [
      {
        rxcui: '40048',
        name: 'Fluorouracil',
        generic_name: 'fluorouracil',
        brand_names: ['Adrucil', '5-FU'],
        active_ingredients: ['fluorouracil'],
        therapeutic_class: 'Antineoplastic',
        indication: 'Colorectal cancer, breast cancer'
      },
      {
        rxcui: '39998',
        name: 'Irinotecan',
        generic_name: 'irinotecan',
        brand_names: ['Camptosar'],
        active_ingredients: ['irinotecan hydrochloride'],
        therapeutic_class: 'Antineoplastic',
        indication: 'Colorectal cancer'
      },
      {
        rxcui: '42463',
        name: 'Clopidogrel',
        generic_name: 'clopidogrel',
        brand_names: ['Plavix'],
        active_ingredients: ['clopidogrel bisulfate'],
        therapeutic_class: 'Antiplatelet',
        indication: 'Cardiovascular protection'
      }
    ];

    const { error: drugError } = await supabaseAdmin
      .from('drugs')
      .upsert(drugs, { onConflict: 'rxcui' });

    if (drugError) {
      console.warn('⚠️  Drug insertion failed:', drugError.message);
    } else {
      console.log('✅ Drugs inserted successfully');
    }

  } catch (error) {
    console.warn('⚠️  Manual seeding failed:', error.message);
  }
}

async function verifySetup() {
  console.log('🔍 Verifying database setup...');

  try {
    // Check if tables exist and have data
    const { data: drugs, error: drugError, count: drugCount } = await supabaseAdmin
      .from('drugs')
      .select('*', { count: 'exact', head: true });

    const { data: genes, error: geneError, count: geneCount } = await supabaseAdmin
      .from('genes')
      .select('*', { count: 'exact', head: true });

    if (drugError || geneError) {
      console.log('⚠️  Tables not found - please create schema first using Supabase SQL Editor');
      console.log('   📋 Schema file: ./supabase/schema.sql');
      console.log('   🌱 Seed file: ./supabase/seed.sql');
      console.log('   🌐 Supabase SQL Editor: https://emfrwckxctyarphjvfeu.supabase.co/project/emfrwckxctyarphjvfeu/sql');
      return;
    }

    console.log(`✅ Database verification successful!`);
    console.log(`   📊 Tables created and accessible`);
    console.log(`   💊 Drugs: ${drugCount || 0} records available`);
    console.log(`   🧬 Genes: ${geneCount || 0} records available`);
    console.log(`   🌐 Supabase URL: https://emfrwckxctyarphjvfeu.supabase.co`);
    
  } catch (error) {
    console.log('⚠️  Database not ready - please create schema first using Supabase SQL Editor');
    console.log('   📋 Schema file: ./supabase/schema.sql');
    console.log('   🌱 Seed file: ./supabase/seed.sql');
    console.log('   🌐 Supabase SQL Editor: https://emfrwckxctyarphjvfeu.supabase.co/project/emfrwckxctyarphjvfeu/sql');
  }
}

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSupabaseDatabase().catch(console.error);
}

export default setupSupabaseDatabase;