
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEEPL_API_KEY = Deno.env.get('DEEPL_API_KEY');
const DEEPL_API_URL = 'https://api.deepl.com/v2/translate';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, text, sourceLanguage, targetLanguage } = await req.json();

    console.log(`Processing translation job ${jobId}`);
    console.log(`Source language: ${sourceLanguage}, Target language: ${targetLanguage}`);

    // In a real implementation, we would extract text from the document
    // For this demo, we'll use DeepL to translate text directly
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text || "This is a sample document content for translation."],
        source_lang: getDeeplLanguageCode(sourceLanguage),
        target_lang: getDeeplLanguageCode(targetLanguage),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`DeepL API error: ${response.status} - ${errorData}`);
      throw new Error(`DeepL API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Translation successful');

    return new Response(
      JSON.stringify({ 
        success: true, 
        translatedText: data.translations[0].text 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in translate-document function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Helper function to convert our language names to DeepL language codes
function getDeeplLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    'English': 'EN',
    'French': 'FR',
    'German': 'DE',
    'Spanish': 'ES',
    'Italian': 'IT',
    'Portuguese': 'PT',
    'Dutch': 'NL',
    'Polish': 'PL',
    'Russian': 'RU',
    'Japanese': 'JA',
    'Chinese': 'ZH',
    'Korean': 'KO',
    'Arabic': 'AR',
    'Turkish': 'TR'
  };
  
  return languageMap[language] || 'EN'; // Default to English if language not found
}
