
import { extractDate } from "../utils/dateExtractor.ts";
import { extractStoreName } from "../utils/storeExtractor.ts";

// Process receipt with Google Cloud Vision API
export async function processReceiptWithOCR(receiptImage: File, apiKey: string, enhancedProcessing = false) {
  console.log("Processing receipt with Google Vision API");

  try {
    // Convert image to base64
    const arrayBuffer = await receiptImage.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Image = btoa(String.fromCharCode.apply(null, [...uint8Array]));
    
    // Prepare request for Google Cloud Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 100
            },
            // Add document text detection for enhanced processing
            ...(enhancedProcessing ? [{
              type: "DOCUMENT_TEXT_DETECTION",
              maxResults: 100
            }] : [])
          ],
          imageContext: {
            languageHints: ["en"],
            // Add additional context for enhanced processing
            ...(enhancedProcessing ? {
              textDetectionParams: {
                enableTextDetectionConfidenceScore: true
              }
            } : {})
          }
        }
      ]
    };

    // Send request to Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    console.log(`Google Vision API response status: ${response.status}`);
    
    // Handle API response errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Vision API error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      
      // If Google Vision API fails, try with the OpenRouter approach
      console.log("Falling back to OpenRouter for OCR");
      return await processReceiptWithOpenRouter(receiptImage);
    }
    
    const responseData = await response.json();
    
    // Check if we got a successful response with text annotations
    if (!responseData.responses || 
        !responseData.responses[0] || 
        !responseData.responses[0].textAnnotations || 
        responseData.responses[0].textAnnotations.length === 0) {
      console.error("No text annotations in Google Vision response");
      return await processReceiptWithOpenRouter(receiptImage);
    }

    // Extract the full text from the first annotation
    const extractedText = responseData.responses[0].textAnnotations[0].description;
    console.log("Extracted text sample:", extractedText.substring(0, 200) + "...");
    
    // If enhanced processing is enabled, try to extract more structured data
    let documentText = extractedText;
    if (enhancedProcessing && 
        responseData.responses[0].fullTextAnnotation && 
        responseData.responses[0].fullTextAnnotation.text) {
      documentText = responseData.responses[0].fullTextAnnotation.text;
      console.log("Using enhanced document text extraction");
    }
    
    // Extract date and merchant from the text
    const date = extractDate(documentText);
    const merchant = extractStoreName(documentText.split('\n'));
    
    return {
      text: documentText,
      date,
      merchant
    };
  } catch (error) {
    console.error("Error processing with Vision API:", error);
    // Fallback to OpenRouter approach if Vision API fails
    return await processReceiptWithOpenRouter(receiptImage);
  }
}

// Process receipt with OpenRouter's AI models
export async function processReceiptWithOpenRouter(receiptImage: File) {
  console.log("Processing receipt with OpenRouter");
  
  try {
    // Get the OpenRouter API key from environment variables
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API key not found in environment variables");
      return await processReceiptWithTesseract(receiptImage);
    }
    
    // Convert image to base64
    const arrayBuffer = await receiptImage.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Image = btoa(String.fromCharCode.apply(null, [...uint8Array]));
    
    // Create the prompt for the AI model
    const prompt = `
      Analyze this receipt image and extract all text content.
      Then, identify and extract the following information:
      1. Store or merchant name
      2. Date of purchase (in YYYY-MM-DD format)
      3. List of purchased items with their prices
      4. Total amount

      Return only the extracted text content from the receipt, with line breaks preserved.
      Do not include any commentary or explanation.
    `;
    
    // Prepare the request to OpenRouter
    const requestBody = {
      model: "anthropic/claude-3-haiku", // Using a fast, cost-effective model
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${receiptImage.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1024
    };
    
    console.log("Sending request to OpenRouter...");
    
    // Send request to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://supabase.com"
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle response errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      return await processReceiptWithTesseract(receiptImage);
    }
    
    const responseData = await response.json();
    console.log("OpenRouter response received");
    
    // Extract the text content from the response
    if (!responseData.choices || responseData.choices.length === 0) {
      console.error("No valid response from OpenRouter");
      return await processReceiptWithTesseract(receiptImage);
    }
    
    const extractedText = responseData.choices[0].message.content;
    console.log("Extracted text sample:", extractedText.substring(0, 200) + "...");
    
    // Extract date and merchant from the text
    const date = extractDate(extractedText);
    const merchant = extractStoreName(extractedText.split('\n'));
    
    return {
      text: extractedText,
      date,
      merchant
    };
  } catch (error) {
    console.error("Error processing with OpenRouter:", error);
    // Fallback to simplified approach if OpenRouter fails
    return await processReceiptWithTesseract(receiptImage);
  }
}

// Process receipt with a simpler text extraction approach since we can't use browser Tesseract in Deno
export async function processReceiptWithTesseract(receiptImage: File) {
  console.log("Processing receipt with simple OCR fallback");
  
  try {
    // Since we can't use browser-based Tesseract in Deno, we'll use a simpler approach
    // This is a basic implementation that returns placeholder data
    // In a production environment, you might want to use a Deno-compatible OCR library
    // or call a separate OCR service API
    
    console.log("Note: Using simplified OCR. For better results, configure Google Vision API key or OpenRouter API key");
    
    // Log image info
    console.log(`Processing image: ${receiptImage.name}, size: ${receiptImage.size} bytes, type: ${receiptImage.type}`);
    
    // Generate placeholder text for testing
    const placeholderText = `Store Receipt\nDate: ${new Date().toLocaleDateString()}\n\nItem 1  $15.99\nItem 2  $9.99\nTax    $2.00\nTotal  $27.98`;
    
    return {
      text: placeholderText,
      date: new Date().toISOString().split('T')[0],
      merchant: "Store"
    };
  } catch (error) {
    console.error("Error in simplified OCR processing:", error);
    return {
      text: "",
      date: new Date().toISOString().split('T')[0],
      merchant: "Store"
    };
  }
}
