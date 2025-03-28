
// This service handles the communication with OpenAI's API

export async function processReceiptWithOpenAI(file: File, apiKey: string): Promise<any> {
  try {
    console.log("Processing receipt with OpenAI Vision API");
    
    // Read the file into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert ArrayBuffer to Base64
    const base64Image = bufferToBase64(arrayBuffer);
    
    // Create the prompt for OpenAI
    const prompt = "Extract all information from this receipt. Return the results as valid JSON with the following format: { \"date\": \"YYYY-MM-DD\", \"items\": [ { \"description\": \"item name\", \"amount\": \"0.00\", \"category\": \"category\", \"date\": \"YYYY-MM-DD\", \"paymentMethod\": \"Card\" } ] }. Make sure all fields are there and properly filled. If the receipt doesn't have clear items, create a best guess based on the receipt's context.";
    
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
      throw new Error(`OpenAI API responded with status: ${response.status}`);
    }
    
    console.log("OpenAI API response status:", response.status);
    
    const responseData = await response.json();
    const textContent = responseData.choices[0]?.message?.content;
    
    if (!textContent) {
      throw new Error("OpenAI API returned empty response");
    }
    
    // Extract the JSON from the response (it might be wrapped in markdown code blocks)
    const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                      textContent.match(/```([\s\S]*?)```/) ||
                      [null, textContent];
    
    const jsonString = jsonMatch[1]?.trim() || textContent;
    
    try {
      const parsedData = JSON.parse(jsonString);
      console.log("Successfully parsed response:", parsedData);
      return parsedData;
    } catch (parseError) {
      console.error("Invalid JSON response from OpenAI:", textContent);
      
      // Create fallback data if JSON parsing fails
      return {
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            description: "Receipt Item",
            amount: "0.00",
            category: "Other",
            date: new Date().toISOString().split('T')[0],
            paymentMethod: "Card"
          }
        ]
      };
    }
  } catch (error) {
    console.error("Error in OCR processing:", error);
    throw error;
  }
}

// Helper function to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
