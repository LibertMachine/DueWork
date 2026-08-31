// ========================================
// DUEWORK QUOTE ENGINE
// Version: 0.1
// ========================================


// ========================================
// PRICING CONFIGURATION
// ========================================

const DUEWORK_RATES = {

  baseJobFee: 8,

  researchUnitRate: 0.12,

  dataRowRate: 0.04,

  documentPageRate: 0.35,

  slideRate: 0.65,

  imageAssetRate: 0.45,

  humanQaMinuteRate: 0.45,

  riskReserveRate: 0.08,

  targetGrossMargin: 0.72,

  minimumQuote: 15

};


// ========================================
// MULTIPLIERS
// ========================================

const AMBIGUITY_MULTIPLIERS = {

  low: 1.00,

  medium: 1.10,

  high: 1.25

};


const VERIFICATION_MULTIPLIERS = {

  low: 1.00,

  medium: 1.12,

  high: 1.30

};


const DEADLINE_MULTIPLIERS = {

  standard: 1.00,

  priority: 1.15,

  rush: 1.35,

  emergency: 1.75

};


// ========================================
// CALCULATE QUOTE
// ========================================

function calculateDueWorkQuote(job = {}) {

  // ------------------------------------
  // NORMALIZE INPUT
  // ------------------------------------

  const jobName =
    job.jobName || "Digital Job";


  const researchUnits =
    Number(job.researchUnits) || 0;


  const dataRows =
    Number(job.dataRows) || 0;


  const documentPages =
    Number(job.documentPages) || 0;


  const slides =
    Number(job.slides) || 0;


  const imageAssets =
    Number(job.imageAssets) || 0;


  const toolCost =
    Number(job.toolCost) || 0;


  const humanQaMinutes =
    Number(job.humanQaMinutes) || 0;


  const ambiguity =
    job.ambiguity || "medium";


  const verification =
    job.verification || "medium";


  const deadline =
    job.deadline || "standard";


  // ====================================
  // DIRECT COSTS
  // ====================================

  const baseCost =
    DUEWORK_RATES.baseJobFee;


  const researchCost =
    researchUnits *
    DUEWORK_RATES.researchUnitRate;


  const dataCost =
    dataRows *
    DUEWORK_RATES.dataRowRate;


  const documentCost =
    documentPages *
    DUEWORK_RATES.documentPageRate;


  const slideCost =
    slides *
    DUEWORK_RATES.slideRate;


  const imageCost =
    imageAssets *
    DUEWORK_RATES.imageAssetRate;


  const humanQaCost =
    humanQaMinutes *
    DUEWORK_RATES.humanQaMinuteRate;


  // ====================================
  // DIRECT FULFILLMENT COST
  // ====================================

  const directCost =
    baseCost +
    researchCost +
    dataCost +
    documentCost +
    slideCost +
    imageCost +
    toolCost +
    humanQaCost;


  // ====================================
  // RISK RESERVE
  // ====================================

  const riskReserve =
    directCost *
    DUEWORK_RATES.riskReserveRate;


  const loadedCost =
    directCost +
    riskReserve;


  // ====================================
  // COMPLEXITY MULTIPLIERS
  // ====================================

  const ambiguityMultiplier =
    AMBIGUITY_MULTIPLIERS[ambiguity] ||
    AMBIGUITY_MULTIPLIERS.medium;


  const verificationMultiplier =
    VERIFICATION_MULTIPLIERS[verification] ||
    VERIFICATION_MULTIPLIERS.medium;


  const complexityAdjustedCost =
    loadedCost *
    ambiguityMultiplier *
    verificationMultiplier;


  // ====================================
  // TARGET PRICE
  // ====================================

  const targetPrice =
    complexityAdjustedCost /
    (
      1 -
      DUEWORK_RATES.targetGrossMargin
    );


  const preDeadlinePrice =
    Math.max(
      targetPrice,
      DUEWORK_RATES.minimumQuote
    );


  // ====================================
  // DEADLINE PREMIUM
  // ====================================

  const deadlineMultiplier =
    DEADLINE_MULTIPLIERS[deadline] ||
    DEADLINE_MULTIPLIERS.standard;


  const rawCustomerPrice =
    preDeadlinePrice *
    deadlineMultiplier;


  // ====================================
  // CUSTOMER-FACING PRICE
  // ====================================

  const customerPrice =
    roundQuote(
      rawCustomerPrice
    );


  // ====================================
  // PROFIT
  // ====================================

  const grossProfit =
    customerPrice -
    loadedCost;


  const grossMargin =
    customerPrice > 0
      ? grossProfit / customerPrice
      : 0;


  // ====================================
  // FULFILLMENT + STATUS
  // ====================================

  const fulfillment =
    determineFulfillment({
      ambiguity,
      verification,
      humanQaMinutes
    });


  const quoteStatus =
    determineQuoteStatus({
      ambiguity,
      verification,
      deadline,
      customerPrice,
      humanQaMinutes
    });


  // ====================================
  // RETURN QUOTE
  // ====================================

  return {

    jobName,

    quoteStatus,

    fulfillment,

    customerPrice,

    costs: {

      baseCost,

      researchCost,

      dataCost,

      documentCost,

      slideCost,

      imageCost,

      toolCost,

      humanQaCost,

      directCost,

      riskReserve,

      loadedCost

    },

    pricing: {

      ambiguityMultiplier,

      verificationMultiplier,

      complexityAdjustedCost,

      targetPrice,

      preDeadlinePrice,

      deadlineMultiplier,

      rawCustomerPrice

    },

    profit: {

      grossProfit,

      grossMargin

    }

  };

}


// ========================================
// QUOTE STATUS
// ========================================

function determineQuoteStatus({

  ambiguity,

  verification,

  deadline,

  customerPrice,

  humanQaMinutes

}) {

  if (
    ambiguity === "high" ||
    verification === "high" ||
    deadline === "emergency" ||
    customerPrice >= 250 ||
    humanQaMinutes >= 45
  ) {

    return "MANUAL_REVIEW";

  }


  return "AUTO_QUOTE";

}


// ========================================
// FULFILLMENT ROUTER
// ========================================

function determineFulfillment({

  ambiguity,

  verification,

  humanQaMinutes

}) {

  if (
    verification === "high" ||
    ambiguity === "high" ||
    humanQaMinutes >= 30
  ) {

    return "AI_PLUS_HUMAN_QA";

  }


  return "AI_FIRST_QA_CHECK";

}


// ========================================
// CUSTOMER PRICE ROUNDING
// ========================================

function roundQuote(price) {

  if (price <= 25) {

    return Math.ceil(price);

  }


  if (price <= 100) {

    return Math.ceil(
      price / 5
    ) * 5;

  }


  if (price <= 500) {

    return Math.ceil(
      price / 10
    ) * 10;

  }


  return Math.ceil(
    price / 25
  ) * 25;

}


// ========================================
// FORMATTING HELPERS
// ========================================

function formatMoney(value) {

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }
  ).format(value);

}


function formatPercent(decimal) {

  return `${(
    decimal * 100
  ).toFixed(1)}%`;

}