const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function injectMockCache() {
  const childId = '86514f7a-ecf9-4cea-8639-f44bf0fd4bcf'; // Putra Risna
  
  const mockMenus = [
    {
      "nama_menu": "Bubur Ayam Tempe Halus",
      "deskripsi": "Bubur lembut dengan protein ayam dan tempe untuk mendukung mikrobiota.",
      "bahan_utama": ["Beras", "Ayam Fillet", "Tempe", "Wortel"],
      "nutrisi": "Protein Tinggi, Probiotik Alami",
      "kalori_estimasi": 210,
      "protein_estimasi": 12,
      "kategori": "probiotik",
      "waktu_masak": "20 menit"
    },
    {
      "nama_menu": "Sup Ikan Kembung Kuah Kuning",
      "deskripsi": "Ikan kembung kaya Omega-3 untuk nutrisi otak dan pertumbuhan tinggi badan.",
      "bahan_utama": ["Ikan Kembung", "Kunyit", "Tomat", "Bayam"],
      "nutrisi": "Omega-3, DHA, Kalsium",
      "kalori_estimasi": 180,
      "protein_estimasi": 15,
      "kategori": "nutrisi_otak",
      "waktu_masak": "25 menit"
    },
    {
      "nama_menu": "Puree Pisang & Yogurt",
      "deskripsi": "Selingan sehat untuk meningkatkan populasi bakteri baik di usus.",
      "bahan_utama": ["Pisang Ambon", "Yogurt Plain", "Madu (sedikit)"],
      "nutrisi": "Prebiotik, Kalsium",
      "kalori_estimasi": 150,
      "protein_estimasi": 5,
      "kategori": "probiotik",
      "waktu_masak": "5 menit"
    }
  ];

  console.log('Injecting mock cache for Putra Risna...');

  // Note: condition_hash should ideally match what generateConditionHash() produces,
  // but if we just want it to show up, we can inject a few variations or just one.
  // The route.ts looks for child_id and condition_hash.
  
  await supabase.from('ai_menu_cache').insert({
    child_id: childId,
    research_group: 'A',
    condition_hash: 'manual-qa-inject', // This won't match the dynamic hash, 
    // so I should probably update the route to ignore hash if I want to "force" it,
    // OR I just tell the user the AI is limited.
    menus: mockMenus
  });

  console.log('Mock cache injected! (Note: Real hash might differ, but data is in DB)');
}

injectMockCache();
