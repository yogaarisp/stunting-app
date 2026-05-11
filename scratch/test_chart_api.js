require('dotenv').config({ path: '.env.local' });

async function testChartRecommendationAPI() {
  console.log('🧪 Testing Chart Recommendation API...');
  
  const testData = {
    childId: 'test-child-123',
    chartData: {
      berat_badan: [8.5, 9.0, 9.2, 9.5],
      tinggi_badan: [70, 72, 73, 74],
      lingkar_kepala: [44, 45, 45.5, 46],
      umur_bulan: [12, 13, 14, 15],
      dates: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01']
    },
    childInfo: {
      nama_anak: 'Anak Test',
      jenis_kelamin: 'Laki-laki',
      umur_bulan: 15,
      alergi: 'Tidak ada'
    },
    currentStatus: {
      bbStatus: 'kurang',
      tbStatus: 'normal',
      lkStatus: 'normal',
      trend: 'naik'
    }
  };

  try {
    console.log('📊 Sending request to /api/chart-recommendation...');
    
    const response = await fetch('http://localhost:3000/api/chart-recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('✅ API Response:');
    console.log('Success:', result.success);
    console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
    
    if (result.recommendation) {
      console.log('\n📋 Recommendation:');
      console.log('Analisis Kondisi:', result.recommendation.analisis_kondisi);
      console.log('Strategi Nutrisi:', result.recommendation.strategi_nutrisi);
      console.log('Jumlah Menu:', result.recommendation.menu_rekomendasi?.length || 0);
      console.log('Target Pertumbuhan:', JSON.stringify(result.recommendation.target_pertumbuhan, null, 2));
      console.log('Tips Orang Tua:', result.recommendation.tips_orang_tua?.length || 0, 'tips');
    }

    console.log('\n🎉 Chart Recommendation API test berhasil!');

  } catch (error) {
    console.error('❌ Test gagal:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solusi: Pastikan aplikasi Next.js berjalan di localhost:3000');
      console.log('   Jalankan: npm run dev');
    }
  }
}

testChartRecommendationAPI();