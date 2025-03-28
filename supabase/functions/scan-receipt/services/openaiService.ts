
// This service handles the communication with OpenAI's API

// Helper function to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function processReceiptWithOpenAI(file: File, apiKey: string): Promise<any> {
  try {
    console.log(`Processing receipt with OpenAI Vision API: ${file.name} (${file.size} bytes)`);
    
    // Read the file into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert ArrayBuffer to Base64
    const base64Image = bufferToBase64(arrayBuffer);
    
    // Create the prompt for OpenAI
    const prompt = "Extract all information from this receipt. Return the results as valid JSON with the following format: { \"date\": \"YYYY-MM-DD\", \"items\": [ { \"description\": \"item name\", \"amount\": \"0.00\", \"category\": \"category\", \"date\": \"YYYY-MM-DD\", \"paymentMethod\": \"Card\" } ] }. Make sure all fields are there and properly filled. If the receipt doesn't have clear items, create a best guess based on the receipt's context.";
    
    console.log("Sending request to OpenAI API...");
    
    // Call OpenAI's API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using gpt-4o which supports vision
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}): ${errorText}`);
      throw new Error(`OpenAI API responded with status: ${response.status}`);
    }
    
    console.log("OpenAI API response status:", response.status);
    
    const responseData = await response.json();
    const textContent = responseData.choices[0]?.message?.content;
    
    if (!textContent) {
      throw new Error("OpenAI API returned empty response");
    }
    
    // Extract the JSON from the response (it might be wrapped in markdown code blocks)
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       textContent.match(/```\s*([\s\S]*?)\s*```/) || 
                       textContent.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      console.error("Could not extract JSON from response:", textContent);
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const jsonString = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
    
    console.log("Attempting to parse JSON response:", jsonString);
    
    try {
      const parsedData = JSON.parse(jsonString);
      console.log("Successfully parsed response:", parsedData);
      return parsedData;
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "for text:", jsonString);
      
      // Try to find any JSON-like structure in the response
      const lastResortMatch = textContent.match(/{[\s\S]*?}/);
      if (lastResortMatch) {
        try {
          const lastResortJson = JSON.parse(lastResortMatch[0]);
          console.warn("Parsed JSON using fallback method:", lastResortJson);
          return lastResortJson;
        } catch (e) {
          console.error("Last resort parsing also failed");
        }
      }
      
      throw new Error("Failed to parse JSON response from OpenAI");
    }
  } catch (error) {
    console.error("Error processing receipt with OpenAI:", error);
    throw error;
  }
}
