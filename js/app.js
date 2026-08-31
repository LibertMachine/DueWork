// ========================================
// DUEWORK QUOTE SIMULATOR
// Version: 0.1
// ========================================


// ========================================
// DOM ELEMENTS
// ========================================

const quoteForm =
  document.getElementById("quoteForm");

const jobRequest =
  document.getElementById("jobRequest");

const characterCount =
  document.getElementById("characterCount");

const analyzeButton =
  document.getElementById("analyzeButton");

const analysisPanel =
  document.getElementById("analysisPanel");

const analysisMessage =
  document.getElementById("analysisMessage");

const analysisProgressBar =
  document.getElementById("analysisProgressBar");

const quoteResult =
  document.getElementById("quoteResult");

const quoteJobName =
  document.getElementById("quoteJobName");

const customerPrice =
  document.getElementById("customerPrice");

const quoteStatus =
  document.getElementById("quoteStatus");

const quoteDeadline =
  document.getElementById("quoteDeadline");

const quoteFulfillment =
  document.getElementById("quoteFulfillment");

const quoteComplexity =
  document.getElementById("quoteComplexity");

const deliverablesList =
  document.getElementById("deliverablesList");

const developerQuoteData =
  document.getElementById("developerQuoteData");

const newQuoteButton =
  document.getElementById("newQuoteButton");

const startJobButton =
  document.getElementById("startJobButton");

const clarificationPanel =
  document.getElementById(
    "clarificationPanel"
  );


const clarificationQuestions =
  document.getElementById(
    "clarificationQuestions"
  );


const editRequestButton =
  document.getElementById(
    "editRequestButton"
  );

  const cannotFulfillPanel =
  document.getElementById(
    "cannotFulfillPanel"
  );


const cannotFulfillReasons =
  document.getElementById(
    "cannotFulfillReasons"
  );


const reviseBlockedRequestButton =
  document.getElementById(
    "reviseBlockedRequestButton"
  );

// ========================================
// CHARACTER COUNTER
// ========================================

jobRequest.addEventListener(
  "input",
  () => {

    const length =
      jobRequest.value.length;

    characterCount.textContent =
      `${length} characters`;

  }
);


// ========================================
// FORM SUBMIT
// ========================================

quoteForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const request =
      jobRequest.value.trim();

    if (!request) {

      jobRequest.focus();

      return;

    }

    const deadline =
      getSelectedDeadline();

    await analyzeAndQuote(
      request,
      deadline
    );

  }
);


// ========================================
// GET SELECTED DEADLINE
// ========================================

function getSelectedDeadline() {

  const selected =
    document.querySelector(
      'input[name="deadline"]:checked'
    );

  return selected
    ? selected.value
    : "standard";

}


// ========================================
// ANALYZE + QUOTE
// ========================================

async function analyzeAndQuote(
  request,
  deadline
) {

  hideQuote();

  showAnalysis();

  analyzeButton.disabled =
    true;

  try {

    await runAnalysisAnimation();

    const analyzedJob =
      analyzeJobRequest(
        request,
        deadline
      );

      const feasibility =
  determineFeasibility(
    request,
    analyzedJob
  );


if (
  !feasibility.canFulfill
) {

  hideAnalysis();

  displayCannotFulfill(
    feasibility,
    analyzedJob
  );

  return;

}

      const clarification =
  determineClarificationNeed(
    analyzedJob
  );


if (
  clarification.needsClarification
) {

  hideAnalysis();

  displayClarification(
    clarification,
    analyzedJob
  );

  return;

}

    const quote =
      calculateDueWorkQuote(
        analyzedJob
      );

    hideAnalysis();

    displayQuote(
      quote,
      analyzedJob
    );

  }

  catch (error) {

    console.error(
      "DueWork quote error:",
      error
    );

    hideAnalysis();

    alert(
      "Something went wrong while analyzing the job."
    );

  }

  finally {

    analyzeButton.disabled =
      false;

  }

}


// ========================================
// STARTER JOB ANALYZER
// ========================================

// ========================================
// JOB ANALYZER V0.2
// ========================================

function analyzeJobRequest(
  request,
  deadline
) {

  const text =
    request.toLowerCase();


  const category =
    classifyJobCategory(text);


  const quantity =
    extractLargestNumber(text);


  let researchUnits = 0;
  let dataRows = 0;
  let documentPages = 0;
  let slides = 0;
  let imageAssets = 0;
  let toolCost = 1;
  let humanQaMinutes = 8;

  let ambiguity =
    estimateAmbiguity(
      request,
      text
    );

  let verification =
    estimateVerification(
      text
    );


  // ====================================
  // CATEGORY-SPECIFIC ESTIMATION
  // ====================================

  switch (category) {

    // ------------------------------------
    // RESEARCH
    // ------------------------------------

    case "research":

      researchUnits =
        quantity
          ? quantity * 3
          : 60;

      humanQaMinutes +=
        10;

      break;


    // ------------------------------------
    // DATA
    // ------------------------------------

    case "data":

      dataRows =
        quantity || 100;

      researchUnits =
        text.includes("research") ||
        text.includes("find")
          ? Math.max(
              30,
              dataRows * 2
            )
          : 10;

      humanQaMinutes +=
        Math.min(
          30,
          Math.ceil(
            dataRows / 100
          ) * 5
        );

      break;


    // ------------------------------------
    // DOCUMENT
    // ------------------------------------

    case "document":

      documentPages =
        quantity &&
        (
          text.includes("page") ||
          text.includes("pages")
        )
          ? quantity
          : 5;

      researchUnits =
        (
          text.includes("research") ||
          text.includes("sources")
        )
          ? 50
          : 10;

      humanQaMinutes +=
        documentPages * 2;

      break;


    // ------------------------------------
    // PRESENTATION
    // ------------------------------------

    case "presentation":

      slides =
        quantity || 10;

      researchUnits =
        (
          text.includes("research") ||
          text.includes("annual report") ||
          text.includes("report")
        )
          ? 50
          : 15;

      humanQaMinutes +=
        slides * 1.5;

      break;


    // ------------------------------------
    // CREATIVE
    // ------------------------------------

    case "creative":

      imageAssets =
        quantity || 1;

      researchUnits =
        5;

      humanQaMinutes +=
        imageAssets * 8;

      break;


    // ------------------------------------
    // CODING
    // ------------------------------------

    case "coding":

      researchUnits =
        25;

      humanQaMinutes +=
        30;

      ambiguity =
        ambiguity === "low"
          ? "medium"
          : ambiguity;

      break;


    // ------------------------------------
    // OTHER
    // ------------------------------------

    default:

      researchUnits =
        20;

      humanQaMinutes +=
        10;

      break;

  }


  // ====================================
  // TOOL COST ESTIMATE
  // ====================================

  toolCost =
    estimateToolCost({
      category,
      researchUnits,
      dataRows,
      slides,
      imageAssets
    });


  // ====================================
  // RETURN STRUCTURED JOB
  // ====================================

  return {

    jobName:
      createJobName(request),

    originalRequest:
      request,

    category,

    quantity,

    researchUnits,

    dataRows,

    documentPages,

    slides,

    imageAssets,

    toolCost,

    humanQaMinutes,

    ambiguity,

    verification,

    deadline

  };

}


// ========================================
// JOB CLASSIFIER
// ========================================

function classifyJobCategory(text) {

  const scores = {

    research: 0,

    data: 0,

    document: 0,

    presentation: 0,

    creative: 0,

    coding: 0

  };


  // ------------------------------------
  // RESEARCH SIGNALS
  // ------------------------------------

  if (
    text.includes("research")
  ) {

    scores.research += 3;

  }


  if (
    text.includes("find")
  ) {

    scores.research += 2;

  }


  if (
    text.includes("compare")
  ) {

    scores.research += 2;

  }


  if (
    text.includes("competitors") ||
    text.includes("companies") ||
    text.includes("businesses") ||
    text.includes("prospects")
  ) {

    scores.research += 2;

  }


  // ------------------------------------
  // DATA SIGNALS
  // ------------------------------------

  if (
    text.includes("excel") ||
    text.includes("spreadsheet") ||
    text.includes("csv")
  ) {

    scores.data += 4;

  }


  if (
    text.includes("data")
  ) {

    scores.data += 2;

  }


  if (
    text.includes("clean") ||
    text.includes("dedupe") ||
    text.includes("rows")
  ) {

    scores.data += 3;

  }


  if (
    text.includes("list")
  ) {

    scores.data += 1;

  }


  // ------------------------------------
  // DOCUMENT SIGNALS
  // ------------------------------------

  if (
    text.includes("report") ||
    text.includes("proposal") ||
    text.includes("document")
  ) {

    scores.document += 3;

  }


  if (
    text.includes("pdf")
  ) {

    scores.document += 2;

  }


  if (
    text.includes("handbook") ||
    text.includes("summary")
  ) {

    scores.document += 2;

  }


  // ------------------------------------
  // PRESENTATION SIGNALS
  // ------------------------------------

  if (
    text.includes("presentation") ||
    text.includes("powerpoint") ||
    text.includes("slide deck") ||
    text.includes("slides")
  ) {

    scores.presentation += 5;

  }


  // ------------------------------------
  // CREATIVE SIGNALS
  // ------------------------------------

  if (
    text.includes("logo") ||
    text.includes("graphic") ||
    text.includes("image") ||
    text.includes("visual")
  ) {

    scores.creative += 4;

  }


  if (
    text.includes("social post") ||
    text.includes("social media")
  ) {

    scores.creative += 2;

  }


  // ------------------------------------
  // CODING SIGNALS
  // ------------------------------------

  if (
    text.includes("website") ||
    text.includes("web page") ||
    text.includes("landing page")
  ) {

    scores.coding += 3;

  }


  if (
    text.includes("code") ||
    text.includes("javascript") ||
    text.includes("python") ||
    text.includes("html") ||
    text.includes("css")
  ) {

    scores.coding += 4;

  }


  if (
    text.includes("api") ||
    text.includes("integration") ||
    text.includes("app")
  ) {

    scores.coding += 3;

  }


  // ------------------------------------
  // FIND HIGHEST SCORE
  // ------------------------------------

  let winner =
    "other";


  let highestScore =
    0;


  Object.entries(
    scores
  ).forEach(
    ([category, score]) => {

      if (
        score > highestScore
      ) {

        winner =
          category;

        highestScore =
          score;

      }

    }
  );


  return winner;

}


// ========================================
// AMBIGUITY ESTIMATOR
// ========================================

function estimateAmbiguity(
  request,
  text
) {

  let score =
    0;


  if (
    request.length < 40
  ) {

    score +=
      2;

  }


  if (
    request.length > 120
  ) {

    score -=
      1;

  }


  if (
    !extractLargestNumber(text)
  ) {

    score +=
      1;

  }


  if (
    text.includes("whatever") ||
    text.includes("something") ||
    text.includes("anything") ||
    text.includes("etc")
  ) {

    score +=
      2;

  }


  if (
    text.includes("excel") ||
    text.includes("pdf") ||
    text.includes("presentation") ||
    text.includes("csv") ||
    text.includes("website")
  ) {

    score -=
      1;

  }


  if (
    score >= 3
  ) {

    return "high";

  }


  if (
    score <= 0
  ) {

    return "low";

  }


  return "medium";

}


// ========================================
// VERIFICATION ESTIMATOR
// ========================================

function estimateVerification(text) {

  if (
    text.includes("verify") ||
    text.includes("verified") ||
    text.includes("fact check") ||
    text.includes("sources") ||
    text.includes("citations") ||
    text.includes("accurate")
  ) {

    return "high";

  }


  if (
    text.includes("research") ||
    text.includes("compare") ||
    text.includes("find") ||
    text.includes("competitor")
  ) {

    return "medium";

  }


  return "low";

}

// ========================================
// CLARIFICATION CHECK
// ========================================

function determineClarificationNeed(job) {

  const questions = [];


  if (
    job.ambiguity === "high"
  ) {

    questions.push(
      "Can you provide a little more detail about the expected deliverable?"
    );

  }


  if (
    !job.quantity &&
    (
      job.category === "data" ||
      job.category === "presentation" ||
      job.category === "creative"
    )
  ) {

    questions.push(
      "Approximately how many items, rows, slides, or assets do you need?"
    );

  }


  if (
    job.category === "other"
  ) {

    questions.push(
      "What format should the finished work be delivered in?"
    );

  }


  if (
    job.category === "coding" &&
    job.ambiguity !== "low"
  ) {

    questions.push(
      "What specifically should the website, app, or code accomplish?"
    );

  }


  return {

    needsClarification:
      questions.length > 0,

    questions:
      questions.slice(0, 3)

  };

}

// ========================================
// FEASIBILITY CHECK
// ========================================

function determineFeasibility(
  request,
  analyzedJob
) {

  const text =
    request.toLowerCase();


  const blockedReasons = [];


  // ------------------------------------
  // ACCOUNT / MONEY ACTIONS
  // ------------------------------------

  if (
    text.includes("log into my bank") ||
    text.includes("access my bank") ||
    text.includes("pay my bills") ||
    text.includes("transfer money") ||
    text.includes("send money") ||
    text.includes("wire money")
  ) {

    blockedReasons.push(
      "DueWork cannot perform financial transactions or access financial accounts."
    );

  }


  // ------------------------------------
  // CREDENTIAL / PASSWORD REQUESTS
  // ------------------------------------

  if (
    text.includes("password") ||
    text.includes("login credentials") ||
    text.includes("my login") ||
    text.includes("my username and password")
  ) {

    blockedReasons.push(
      "DueWork cannot accept or use sensitive login credentials."
    );

  }


  // ------------------------------------
  // HIGH-RISK PROFESSIONAL ADVICE
  // ------------------------------------

  if (
    text.includes("legal advice") ||
    text.includes("legally safe") ||
    text.includes("medical diagnosis") ||
    text.includes("diagnose me") ||
    text.includes("investment advice") ||
    text.includes("what stock should i buy")
  ) {

    blockedReasons.push(
      "This request requires regulated or high-risk professional judgment."
    );

  }


  // ------------------------------------
  // EXTREME SOFTWARE SCOPE
  // ------------------------------------

  if (
    analyzedJob.category === "coding" &&
    (
      text.includes("like uber") ||
      text.includes("like facebook") ||
      text.includes("like amazon") ||
      text.includes("full saas") ||
      text.includes("entire platform") ||
      text.includes("complete app")
    )
  ) {

    blockedReasons.push(
      "This software project is too large for DueWork's instant-production workflow."
    );

  }


  return {

    canFulfill:
      blockedReasons.length === 0,

    reasons:
      blockedReasons

  };

}


// ========================================
// TOOL COST ESTIMATOR
// ========================================

function estimateToolCost({

  category,

  researchUnits,

  dataRows,

  slides,

  imageAssets

}) {

  let cost =
    1;


  cost +=
    researchUnits *
    0.012;


  cost +=
    dataRows *
    0.005;


  cost +=
    slides *
    0.03;


  cost +=
    imageAssets *
    0.15;


  if (
    category === "coding"
  ) {

    cost +=
      2;

  }


  return Number(
    cost.toFixed(2)
  );

}


// ========================================
// EXTRACT LARGEST NUMBER
// ========================================

function extractLargestNumber(text) {

  const numbers =
    text.match(/\d+/g);

  if (!numbers) {

    return null;

  }

  const numericValues =
    numbers.map(Number);

  return Math.max(
    ...numericValues
  );

}


// ========================================
// CREATE JOB NAME
// ========================================

function createJobName(request) {

  const cleaned =
    request
      .replace(/\s+/g, " ")
      .trim();

  if (cleaned.length <= 55) {

    return cleaned;

  }

  return (
    cleaned.substring(0, 52) +
    "..."
  );

}


// ========================================
// ANALYSIS ANIMATION
// ========================================

async function runAnalysisAnimation() {

  const stages = [

    {
      message:
        "Understanding scope...",
      progress:
        20
    },

    {
      message:
        "Identifying deliverables...",
      progress:
        40
    },

    {
      message:
        "Estimating production requirements...",
      progress:
        65
    },

    {
      message:
        "Calculating risk and verification...",
      progress:
        82
    },

    {
      message:
        "Building your quote...",
      progress:
        100
    }

  ];

  for (const stage of stages) {

    analysisMessage.textContent =
      stage.message;

    analysisProgressBar.style.width =
      `${stage.progress}%`;

    await wait(350);

  }

}


// ========================================
// WAIT
// ========================================

function wait(milliseconds) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  );

}


// ========================================
// DISPLAY QUOTE
// ========================================

function displayQuote(
  quote,
  analyzedJob
) {

  quoteResult.classList.remove(
    "hidden"
  );

  quoteJobName.textContent =
    quote.jobName;

  customerPrice.textContent =
    formatMoney(
      quote.customerPrice
    );

  quoteDeadline.textContent =
    formatDeadline(
      analyzedJob.deadline
    );

  quoteFulfillment.textContent =
    formatFulfillment(
      quote.fulfillment
    );

  quoteComplexity.textContent =
    formatComplexity(
      analyzedJob
    );

  updateQuoteStatus(
    quote.quoteStatus
  );

  renderDeliverables(
    analyzedJob
  );

  developerQuoteData.textContent =
    JSON.stringify(
      {
        analyzedJob,
        quote
      },
      null,
      2
    );

  if (
    quote.quoteStatus ===
    "AUTO_QUOTE"
  ) {

    startJobButton.textContent =
      `Start Job — ${formatMoney(
        quote.customerPrice
      )}`;

  }

  quoteResult.scrollIntoView({
    behavior:
      "smooth",

    block:
      "start"
  });

}

// ========================================
// DISPLAY CLARIFICATION
// ========================================

function displayClarification(
  clarification,
  analyzedJob
) {

  clarificationPanel.classList.remove(
    "hidden"
  );


  clarificationQuestions.innerHTML =
    "";


  clarification.questions.forEach(
    question => {

      const item =
        document.createElement("div");


      item.className =
        "clarification-question";


      item.textContent =
        question;


      clarificationQuestions.appendChild(
        item
      );

    }
  );


  console.log(
    "Clarification required:",
    {
      analyzedJob,
      clarification
    }
  );


  clarificationPanel.scrollIntoView({
    behavior:
      "smooth",

    block:
      "start"
  });

}

// ========================================
// DISPLAY CANNOT FULFILL
// ========================================

function displayCannotFulfill(
  feasibility,
  analyzedJob
) {

  cannotFulfillPanel.classList.remove(
    "hidden"
  );


  cannotFulfillReasons.innerHTML =
    "";


  feasibility.reasons.forEach(
    reason => {

      const item =
        document.createElement("div");


      item.className =
        "clarification-question";


      item.textContent =
        reason;


      cannotFulfillReasons.appendChild(
        item
      );

    }
  );


  console.log(
    "Cannot fulfill:",
    {
      analyzedJob,
      feasibility
    }
  );


  cannotFulfillPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ========================================
// QUOTE STATUS
// ========================================

function updateQuoteStatus(status) {

  if (
    status === "AUTO_QUOTE"
  ) {

    quoteStatus.textContent =
      "INSTANT QUOTE";

    quoteStatus.style.background =
      "#dcfce7";

    quoteStatus.style.color =
      "#15803d";

    startJobButton.disabled =
      false;

  }

  else {

    quoteStatus.textContent =
      "REVIEW REQUIRED";

    quoteStatus.style.background =
      "#fef3c7";

    quoteStatus.style.color =
      "#b45309";

    startJobButton.disabled =
      true;

    startJobButton.textContent =
      "Request Manual Review";

  }

}


// ========================================
// DELIVERABLES
// ========================================

function renderDeliverables(job) {

  const deliverables = [];

  if (job.dataRows > 0) {

    deliverables.push(
      "Structured data file"
    );

  }

  if (job.documentPages > 0) {

    deliverables.push(
      "Completed document"
    );

  }

  if (job.slides > 0) {

    deliverables.push(
      `${job.slides} slide presentation`
    );

  }

  if (job.imageAssets > 0) {

    deliverables.push(
      "Finished visual assets"
    );

  }

  if (job.researchUnits > 0) {

    deliverables.push(
      "Research and source gathering"
    );

  }

  deliverables.push(
    "DueWork quality review"
  );

  deliverables.push(
    "Completed digital delivery"
  );

  deliverablesList.innerHTML = "";

  deliverables.forEach(
    item => {

      const row =
        document.createElement("div");

      row.className =
        "deliverable-item";

      row.innerHTML =
        `
          <span class="deliverable-check">
            ✓
          </span>

          <span>
            ${item}
          </span>
        `;

      deliverablesList.appendChild(
        row
      );

    }
  );

}


// ========================================
// COMPLEXITY LABEL
// ========================================

function formatComplexity(job) {

  if (
    job.ambiguity === "high" ||
    job.verification === "high"
  ) {

    return "Complex";

  }

  if (
    job.researchUnits > 150 ||
    job.humanQaMinutes >= 30
  ) {

    return "Advanced";

  }

  return "Standard";

}


// ========================================
// DEADLINE LABEL
// ========================================

function formatDeadline(deadline) {

  const labels = {

    standard:
      "Standard",

    priority:
      "Priority",

    rush:
      "Rush",

    emergency:
      "Emergency"

  };

  return (
    labels[deadline] ||
    "Standard"
  );

}


// ========================================
// FULFILLMENT LABEL
// ========================================

function formatFulfillment(type) {

  if (
    type === "AI_PLUS_HUMAN_QA"
  ) {

    return "AI + Human QA";

  }

  return "AI + QA Check";

}


// ========================================
// ANALYSIS UI
// ========================================

function showAnalysis() {

  analysisPanel.classList.remove(
    "hidden"
  );

  analysisProgressBar.style.width =
    "0%";

}


function hideAnalysis() {

  analysisPanel.classList.add(
    "hidden"
  );

}


function hideQuote() {

  quoteResult.classList.add(
    "hidden"
  );


  clarificationPanel.classList.add(
    "hidden"
  );


  cannotFulfillPanel.classList.add(
    "hidden"
  );

}


// ========================================
// NEW QUOTE
// ========================================

newQuoteButton.addEventListener(
  "click",
  () => {

    hideQuote();

    jobRequest.value = "";

    characterCount.textContent =
      "0 characters";

    jobRequest.focus();

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth"
    });

  }
);

editRequestButton.addEventListener(
  "click",
  () => {

    clarificationPanel.classList.add(
      "hidden"
    );


    jobRequest.focus();


    jobRequest.scrollIntoView({
      behavior:
        "smooth",

      block:
        "center"
    });

  }
);


// ========================================
// START JOB
// ========================================

startJobButton.addEventListener(
  "click",
  () => {

    alert(
      "Checkout comes next 👀"
    );

  }
);

reviseBlockedRequestButton.addEventListener(
  "click",
  () => {

    cannotFulfillPanel.classList.add(
      "hidden"
    );


    jobRequest.focus();


    jobRequest.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }
);