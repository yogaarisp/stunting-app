// Test Production API Endpoints
const BASE_URL = 'https://nutritrack-smg.vercel.app';

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    
    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('✅ Response:', JSON.stringify(json, null, 2));
        return json;
      } catch (e) {
        console.log('✅ Response (text):', text.substring(0, 200) + '...');
        return text;
      }
    } else {
      console.log('❌ Error Response:', text);
      return null;
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing NutriTrack Production APIs');
  console.log('🌐 Base URL:', BASE_URL);
  
  // Test 1: Check Environment Variables
  console.log('\n=== TEST 1: Environment Check ===');
  await testAPI('/api/admin/check-env');
  
  // Test 2: Test Gemini Connection
  console.log('\n=== TEST 2: Gemini Connection ===');
  await testAPI('/api/admin/test-connection', 'POST', {
    service: 'gemini',
    config: {}
  });
  
  // Test 3: Test Supabase Connection
  console.log('\n=== TEST 3: Supabase Connection ===');
  await testAPI('/api/admin/test-connection', 'POST', {
    service: 'supabase',
    config: {}
  });
  
  // Test 4: Generate Menu (Sample Data)
  console.log('\n=== TEST 4: Generate Menu ===');
  const sampleMenuRequest = {
    childData: {
      nama_anak: 'Test Child',
      umur_bulan: 18,
      jenis_kelamin: 'Perempuan',
      berat_badan: 9.5,
      tinggi_badan: 75,
      lingkar_kepala: 46,
      alergi: 'Tidak ada',
      has_mikrobiota_data: false,
      mikrobiota: null,
    },
    researchGroup: 'B',
    analisisResult: {
      bbStatus: 'kurang',
      tbStatus: 'normal',
      lkStatus: 'normal',
      kategoriRekomendasi: ['tinggi_kalori', 'tinggi_protein'],
      riskLevel: 'sedang',
      pesan: 'Berat badan anak di bawah standar WHO',
    },
    childId: 'test-child-123',
    forceRefresh: true,
  };
  
  await testAPI('/api/generate-menu', 'POST', sampleMenuRequest);
  
  console.log('\n🎯 Test completed!');
}

runTests().catch(console.error);