
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Replace with your OCR API key - using a free OCR API for demo purposes
const OCR_API_KEY = Deno.env.get('OCR_SPACE_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get form data with the receipt image
    const formData = await req.formData()
    const receiptImage = formData.get('receipt')

    if (!receiptImage || !(receiptImage instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No receipt image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create new FormData for the OCR API
    const ocrFormData = new FormData()
    ocrFormData.append('language', 'eng')
    ocrFormData.append('isOverlayRequired', 'false')
    ocrFormData.append('file', receiptImage)
    ocrFormData.append('detectOrientation', 'true')
    ocrFormData.append('scale', 'true')

    // Send image to OCR API
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': OCR_API_KEY || '',
      },
      body: ocrFormData,
    })

    const ocrData = await ocrResponse.json()

    if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to extract text from receipt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const extractedText = ocrData.ParsedResults[0].ParsedText

    // Basic parsing logic for common receipt formats
    // This is a simplified implementation and might need refinement
    // based on the types of receipts users will scan
    const expenseDetails = {
      description: extractDescription(extractedText),
      amount: extractAmount(extractedText),
      date: extractDate(extractedText),
      category: guessCategory(extractedText),
      paymentMethod: guessPaymentMethod(extractedText),
    }

    console.log("Extracted expense details:", expenseDetails)

    return new Response(
      JSON.stringify({ success: true, expenseDetails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error processing receipt:", error)
    return new Response(
      JSON.stringify({ error: 'Failed to process receipt', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Helper functions for parsing receipt text
function extractDescription(text: string): string {
  // Look for common patterns in receipt items
  // This is a simple implementation - a more sophisticated approach would use NLP
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  
  // Often the store name or first item is a good candidate for description
  const potentialDescriptions = lines.filter(line => 
    !line.match(/total|subtotal|tax|date|time|card|cash|change|thank|price|amount|qty/i)
  )
  
  return potentialDescriptions.length > 0 
    ? potentialDescriptions[0].trim() 
    : "Receipt Expense"
}

function extractAmount(text: string): string {
  // Look for total amount patterns
  const totalMatch = text.match(/total[\s:]*\$?(\d+\.\d{2})/i) || 
                    text.match(/\$\s*(\d+\.\d{2})/i) ||
                    text.match(/(\d+\.\d{2})/i)
  
  return totalMatch ? totalMatch[1] : "0.00"
}

function extractDate(text: string): string {
  // Look for date patterns (MM/DD/YYYY, DD/MM/YYYY, etc.)
  const dateMatch = text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i)
  
  if (dateMatch) {
    return dateMatch[1]
  }
  
  // If no date found, return today's date
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function guessCategory(text: string): string {
  // Simple logic to guess expense category based on keywords
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('grocer') || lowerText.includes('food') || 
      lowerText.includes('market') || lowerText.includes('supermarket')) {
    return 'Food'
  } else if (lowerText.includes('restaurant') || lowerText.includes('cafe') || 
            lowerText.includes('bar') || lowerText.includes('coffee')) {
    return 'Food'
  } else if (lowerText.includes('gas') || lowerText.includes('fuel') || 
            lowerText.includes('transport') || lowerText.includes('taxi')) {
    return 'Transportation'
  } else if (lowerText.includes('cloth') || lowerText.includes('shoe') || 
            lowerText.includes('apparel') || lowerText.includes('mall')) {
    return 'Shopping'
  } else if (lowerText.includes('movie') || lowerText.includes('theater') || 
            lowerText.includes('cinema') || lowerText.includes('event')) {
    return 'Entertainment'
  }
  
  return 'Other'
}

function guessPaymentMethod(text: string): string {
  // Simple logic to guess payment method based on keywords
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('credit') || lowerText.includes('visa') || 
      lowerText.includes('mastercard') || lowerText.includes('card number')) {
    return 'Credit Card'
  } else if (lowerText.includes('debit') || lowerText.includes('checking')) {
    return 'Debit Card'
  } else if (lowerText.includes('cash')) {
    return 'Cash'
  }
  
  return 'Cash'  // Default
}
