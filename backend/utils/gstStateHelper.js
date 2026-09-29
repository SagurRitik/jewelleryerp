/**
 * GST State Code and Place of Supply (POS) Helper
 */

export const STORE_GSTIN = "23AAKCN6666JIZO";
export const STORE_GST_STATE_CODE = "23"; // Madhya Pradesh

export const INDIAN_STATE_CODES = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman & Diu",
  "26": "Dadra & Nagar Haveli",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (Old)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh"
};

/**
 * Normalizes a 2-digit state code string (e.g., "7" -> "07", "27" -> "27")
 */
export const normalizeStateCode = (code) => {
  if (!code) return "";
  const cleaned = String(code).trim();
  if (/^\d$/.test(cleaned)) return `0${cleaned}`;
  if (/^\d{2}$/.test(cleaned)) return cleaned;
  return cleaned;
};

/**
 * Extracts state code from GSTIN or explicit stateCode field.
 */
export const extractStateCode = (customer = {}) => {
  if (!customer) return STORE_GST_STATE_CODE;

  // 1. Explicit stateCode
  if (customer.stateCode) {
    const norm = normalizeStateCode(customer.stateCode);
    if (INDIAN_STATE_CODES[norm]) return norm;
  }

  // 2. First 2 digits of GSTIN
  if (customer.gstin) {
    const gstinClean = customer.gstin.trim();
    if (gstinClean.length >= 2) {
      const codeFromGstin = gstinClean.slice(0, 2);
      if (INDIAN_STATE_CODES[codeFromGstin]) return codeFromGstin;
    }
  }

  // Default to Store State Code if Intra-State walk-in
  return STORE_GST_STATE_CODE;
};

/**
 * Determines whether the sale is Inter-State (IGST) or Intra-State (CGST + SGST).
 * Allows explicit override ("INTER_STATE", "INTRA_STATE", or "AUTO").
 */
export const determineTaxType = (customer = {}, overrideTaxType = "AUTO") => {
  if (overrideTaxType === "INTER_STATE") {
    const code = extractStateCode(customer) || "99";
    return {
      isInterState: true,
      taxType: "INTER_STATE",
      stateCode: code,
      stateName: INDIAN_STATE_CODES[code] || "Other State",
      posLabel: `${INDIAN_STATE_CODES[code] || "Other State"} (${code})`
    };
  }

  if (overrideTaxType === "INTRA_STATE") {
    return {
      isInterState: false,
      taxType: "INTRA_STATE",
      stateCode: STORE_GST_STATE_CODE,
      stateName: INDIAN_STATE_CODES[STORE_GST_STATE_CODE] || "Madhya Pradesh",
      posLabel: `Indore (${INDIAN_STATE_CODES[STORE_GST_STATE_CODE]} - ${STORE_GST_STATE_CODE})`
    };
  }

  // Auto-detection
  const stateCode = extractStateCode(customer);
  const isInterState = stateCode !== STORE_GST_STATE_CODE;
  const stateName = INDIAN_STATE_CODES[stateCode] || (isInterState ? "Other State" : "Madhya Pradesh");

  return {
    isInterState,
    taxType: isInterState ? "INTER_STATE" : "INTRA_STATE",
    stateCode,
    stateName,
    posLabel: isInterState ? `${stateName} (${stateCode})` : `Indore (${stateName} - ${STORE_GST_STATE_CODE})`
  };
};

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const validateGSTIN = (rawGstin = "", selectedStateCode = "") => {
  const gstin = String(rawGstin || "").trim().toUpperCase();
  const normStateCode = normalizeStateCode(selectedStateCode);

  if (!gstin) {
    return {
      isEmpty: true,
      isValid: true,
      isFormatValid: true,
      stateMismatch: false,
      stateCode: "",
      stateName: "",
      pan: "",
      error: null
    };
  }

  const stateCode = gstin.slice(0, 2);
  const stateName = INDIAN_STATE_CODES[stateCode] || "";
  const pan = gstin.length >= 12 ? gstin.slice(2, 12) : "";

  // Check length
  if (gstin.length !== 15) {
    return {
      isEmpty: false,
      isValid: false,
      isFormatValid: false,
      stateMismatch: normStateCode && stateCode ? normStateCode !== stateCode : false,
      stateCode,
      stateName,
      pan,
      error: `GSTIN must be exactly 15 characters (currently ${gstin.length}/15)`
    };
  }

  // Check valid state code
  if (!stateName) {
    return {
      isEmpty: false,
      isValid: false,
      isFormatValid: false,
      stateMismatch: true,
      stateCode,
      stateName: "Unknown State",
      pan,
      error: `Invalid state code '${stateCode}' in GSTIN`
    };
  }

  // Check 14th character
  if (gstin[13] !== "Z") {
    return {
      isEmpty: false,
      isValid: false,
      isFormatValid: false,
      stateMismatch: false,
      stateCode,
      stateName,
      pan,
      error: `14th character of GSTIN must be 'Z' (found '${gstin[13]}')`
    };
  }

  // Full Regex Test
  if (!GSTIN_REGEX.test(gstin)) {
    return {
      isEmpty: false,
      isValid: false,
      isFormatValid: false,
      stateMismatch: false,
      stateCode,
      stateName,
      pan,
      error: "Invalid GSTIN format (must be 2 digits state + 10 chars PAN + 1 entity + Z + 1 checksum)"
    };
  }

  // Check state code matching
  const hasMismatch = Boolean(normStateCode && normStateCode !== stateCode);
  if (hasMismatch) {
    const selectedName = INDIAN_STATE_CODES[normStateCode] || normStateCode;
    return {
      isEmpty: false,
      isValid: false,
      isFormatValid: true,
      stateMismatch: true,
      stateCode,
      stateName,
      pan,
      error: `State mismatch: GSTIN starts with ${stateCode} (${stateName}), but selected state is ${normStateCode} (${selectedName})`
    };
  }

  return {
    isEmpty: false,
    isValid: true,
    isFormatValid: true,
    stateMismatch: false,
    stateCode,
    stateName,
    pan,
    error: null
  };
};
