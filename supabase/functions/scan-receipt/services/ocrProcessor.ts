
import { parseReceiptText } from "../utils/textParser.ts";
import { createWorker } from "https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/browser/tesseract.min.js";

// Process receipt with Google Cloud Vision API
export async function processReceiptWithOCR(receiptImage: File, apiKey: string) {
  console.log("Processing receipt with Google Vision API")

  try {
    // Convert image to base64
    const arrayBuffer = await receiptImage.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64Image = btoa(String.fromCharCode.apply(null, [...uint8Array]))
    
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
            }
          ],
          imageContext: {
            languageHints: ["en"]
          }
        }
      ]
    }

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
    )

    console.log(`Google Vision API response status: ${response.status}`)
    
    // Handle API response errors
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Google Vision API error: ${response.status} ${response.statusText}`)
      console.error('Error details:', errorText)
      
      // If Google Vision API fails, try with Tesseract instead
      console.log("Falling back to Tesseract OCR")
      return await processReceiptWithTesseract(receiptImage)
    }
    
    const responseData = await response.json()
    
    // Check if we got a successful response with text annotations
    if (!responseData.responses || 
        !responseData.responses[0] || 
        !responseData.responses[0].textAnnotations || 
        responseData.responses[0].textAnnotations.length === 0) {
      console.error("No text annotations in Google Vision response")
      return await processReceiptWithTesseract(receiptImage)
    }

    // Extract the full text from the first annotation
    const extractedText = responseData.responses[0].textAnnotations[0].description
    console.log("Extracted text sample:", extractedText.substring(0, 200) + "...")

    // Parse the text into a structured format with only items, prices, and date
    const parsedItems = parseReceiptText(extractedText)
    console.log("Parsed items:", JSON.stringify(parsedItems))
    
    return parsedItems
  } catch (error) {
    console.error("Error processing with Vision API:", error)
    // Fallback to Tesseract if Vision API fails
    return await processReceiptWithTesseract(receiptImage)
  }
}

// Process receipt with Tesseract OCR (local processing)
export async function processReceiptWithTesseract(receiptImage: File) {
  console.log("Processing receipt with Tesseract OCR")
  
  try {
    // Create a URL for the image
    const imageUrl = URL.createObjectURL(new Blob([await receiptImage.arrayBuffer()], { type: receiptImage.type }))
    
    // Initialize Tesseract worker
    const worker = await createWorker({
      logger: (m) => console.log(m),
    })
    
    // Set the language and image processing options
    await worker.loadLanguage("eng")
    await worker.initialize("eng")
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$.,;:%&()-+/ ',
      preserve_interword_spaces: '1',
    })
    
    // Recognize text from image
    console.log("Starting Tesseract text recognition...")
    const { data } = await worker.recognize(imageUrl)
    
    // Clean up
    URL.revokeObjectURL(imageUrl)
    await worker.terminate()
    
    // Log the extracted text
    const extractedText = data.text
    console.log("Tesseract extracted text sample:", extractedText.substring(0, 200) + "...")
    
    // Parse the text into a structured format
    const parsedItems = parseReceiptText(extractedText)
    console.log("Tesseract parsed items:", JSON.stringify(parsedItems))
    
    return parsedItems
  } catch (error) {
    console.error("Error processing with Tesseract OCR:", error)
    return []
  }
}

