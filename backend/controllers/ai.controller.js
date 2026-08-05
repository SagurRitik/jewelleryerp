import axios from "axios";

/**
 * @desc    Parse an uploaded bill/invoice image using Gemini API
 * @route   POST /api/ai/parse-bill
 * @access  Private (Admin/Superadmin/Salesperson)
 */
export const parseBillImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        message: "GEMINI_API_KEY is not configured in the backend .env file. Please add your key to continue."
      });
    }

    // Convert file buffer to base64
    const base64Data = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const promptText = `
You are an expert OCR and Invoice Parser AI for a jewellery ERP system. Analyze the provided jewellery bill, invoice, receipt, purchase slip, or estimate image and extract ALL visible details into structured JSON.

The output MUST be a single, valid JSON object. Do NOT wrap the JSON in markdown blocks (no \`\`\`json). Output raw JSON only.

JSON Schema:
{
  "invoiceNo": "string or null",
  "date": "string in YYYY-MM-DD format or null",
  "partyDetails": {
    "name": "string (Customer or Buyer name) or null",
    "mobile": "string (10-digit mobile number) or null",
    "email": "string (email address) or null",
    "gstin": "string (GST Identification Number, 15 chars) or null",
    "address": "string (full address on one line) or null",
    "stateCode": "string (2-digit state code, e.g. '23' for MP, '27' for MH) or null"
  },
  "items": [
    {
      "description": "string (product name e.g. Solitaire Studs, Ring, Chain)",
      "hsnCode": "string (HSN/SAC code if visible on bill) or null",
      "metalType": "exactly one of: Gold, Silver, Platinum",
      "purity": "string (e.g. 18KT, 22KT, 14KT, 925, 999) or null",
      "grossWeight": "number in grams (gross weight with stones) or null",
      "netWeight": "number in grams (net metal weight without stones) or null",
      "metalRate": "number (metal rate per gram, e.g. 12318.84) or null",
      "makingRate": "number (making charge per gram) or null",
      "makingCharge": "number (total making charges for this item) or null",
      "amount": "number (total item amount) or null",
      "diamonds": [
        {
          "qty": "number (quantity of diamonds) or null",
          "grossWeight": "number in carats (total/gross carat weight of diamonds) or null",
          "netWeight": "number in carats (individual or net carat weight) or null",
          "rate": "number (rate per carat) or null"
        }
      ],
      "stones": [
        {
          "qty": "number (quantity of stones) or null",
          "grossWeight": "number (total weight of stones in carats or grams) or null",
          "netWeight": "number (net weight of stones) or null",
          "rate": "number (rate per unit/carat) or null"
        }
      ],
      "accessories": [
        {
          "description": "string (accessory/belt description) or null",
          "qty": "number or null",
          "rate": "number or null"
        }
      ]
    }
  ],
  "pricing": {
    "subtotal": "number (taxable amount before GST) or null",
    "gstRate": "number (total GST %, typically 3) or null",
    "cgst": "number or null",
    "sgst": "number or null",
    "igst": "number or null",
    "totalAmount": "number (grand total) or null"
  }
}

Strict Rules:
1. "metalType" MUST be exactly "Gold", "Silver", or "Platinum". Default to "Gold" if unclear.
2. Remove ALL currency symbols (₹, $, etc.) — return only plain numbers for weights, rates, amounts.
3. stateCode: extract first 2 digits from GSTIN if available, else try to match state name (e.g. "Madhya Pradesh" → "23", "Maharashtra" → "27").
4. diamonds array: if the bill shows diamond details (weight in ct/carats, rate), fill the diamonds array. Use grossWeight for the total carat weight column, netWeight for the individual/per-piece carat weight.
5. stones array: if the bill shows stone/gemstone details separately from diamonds, fill the stones array.
6. accessories array: fill if the bill shows belt, clasp, accessory line items.
7. If makingRate is not listed but makingCharge and netWeight are available, calculate makingRate = makingCharge / netWeight (rounded to 2 decimals).
8. Extract ALL line items from the bill table — do not skip any row.
9. Set any field to null if not visible or not available in the image.
10. Purity formats: "18KT", "22KT", "14KT", "925", "999", "950" as applicable.
`;


    // Make request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      return res.status(500).json({ message: "No response from AI model" });
    }

    const textResponse = candidates[0]?.content?.parts[0]?.text;
    if (!textResponse) {
      return res.status(500).json({ message: "Empty response from AI model" });
    }

    // Parse the JSON returned by Gemini
    let parsedData;
    try {
      parsedData = JSON.parse(textResponse.trim());
    } catch (parseErr) {
      console.error("Error parsing Gemini JSON response:", textResponse);
      return res.status(500).json({
        message: "Failed to parse AI response into structured JSON",
        rawResponse: textResponse
      });
    }

    return res.status(200).json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("AI Bill Parsing Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "An error occurred while parsing the bill image with AI",
      error: error.response?.data || error.message
    });
  }
};
