require('dotenv').config({ path: '.env.local' });

async function listGeminiModels() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY not found');
    return;
  }

  console.log('🔍 Listing available Gemini models...');
  console.log('API Key:', apiKey.substring(0, 10) + '...');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n📋 Available models:');
    data.models?.forEach(model => {
      console.log(`- ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });

    // Filter models that support generateContent
    const generateContentModels = data.models?.filter(model => 
      model.supportedGenerationMethods?.includes('generateContent')
    );

    console.log('✅ Models that support generateContent:');
    generateContentModels?.forEach(model => {
      console.log(`- ${model.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listGeminiModels();