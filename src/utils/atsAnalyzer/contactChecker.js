/**
 * Contact & Personal Information ATS Checker
 * Evaluates contact readiness, email validity, phone presence, and social profiles.
 * Strict rules: Name & Email are required; Phone, Location, LinkedIn recommended;
 * GitHub and Portfolio are COMPLETELY OPTIONAL.
 */

export const checkContactInfo = (resumeData = {}) => {
  let score = 0;
  const maxScore = 15;
  const checks = [];
  const issues = [];

  const name = (resumeData.name || "").trim();
  const email = (resumeData.email || "").trim();
  const phone = (resumeData.contactInformation || "").trim();
  const location = (resumeData.address || "").trim();
  const socialList = Array.isArray(resumeData.socialMedia) ? resumeData.socialMedia : [];

  // Helper to find social profile by network name or URL substring
  const findSocial = (needle) => {
    return socialList.find((s) => {
      const net = (s?.socialMedia || "").toLowerCase();
      const link = (s?.link || "").toLowerCase();
      return net.includes(needle) || link.includes(needle);
    });
  };

  const linkedinEntry = findSocial("linkedin");
  const githubEntry = findSocial("github");
  const portfolioEntry = findSocial("portfolio") || findSocial("website") || socialList.find((s) => {
    const n = (s?.socialMedia || "").toLowerCase();
    return !n.includes("linkedin") && !n.includes("github") && s?.link;
  });

  // 1. Full Name (Required: 4 pts)
  if (name.length >= 2) {
    score += 4;
    checks.push({
      id: "contact_name",
      title: "Full Name Provided",
      status: "PASS",
      message: `Full name detected: "${name}"`,
    });
  } else {
    checks.push({
      id: "contact_name",
      title: "Missing Full Name",
      status: "ISSUE",
      message: "Candidate full name is required for ATS indexing and recruiter outreach.",
    });
    issues.push({
      id: "issue_contact_name",
      title: "Full Name is Missing",
      severity: "ISSUE",
      section: "Personal Information",
      fieldId: "input-name",
      description: "No candidate name has been entered.",
      whyItMatters: "Applicant Tracking Systems use your name as the primary unique candidate identifier.",
      suggestedSolution: "Enter your legal first and last name in the Personal Information section.",
    });
  }

  // 2. Email Address (Required: 4 pts)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email && emailRegex.test(email)) {
    score += 4;
    checks.push({
      id: "contact_email",
      title: "Valid Professional Email",
      status: "PASS",
      message: `Email verified: "${email}"`,
    });
  } else if (email) {
    score += 1;
    checks.push({
      id: "contact_email",
      title: "Malformed Email Address",
      status: "ISSUE",
      message: "Email format appears invalid (missing @ or valid domain).",
    });
    issues.push({
      id: "issue_contact_email_invalid",
      title: "Invalid Email Address Format",
      severity: "ISSUE",
      section: "Personal Information",
      fieldId: "input-email",
      description: `"${email}" does not match standard email patterns (e.g., name@domain.com).`,
      whyItMatters: "Automated ATS interview invites and notifications will fail if your email address is malformed.",
      suggestedSolution: "Correct the email syntax to standard name@domain.com format.",
    });
  } else {
    checks.push({
      id: "contact_email",
      title: "Missing Email Address",
      status: "ISSUE",
      message: "An email address is mandatory for job applications.",
    });
    issues.push({
      id: "issue_contact_email_missing",
      title: "Email Address is Missing",
      severity: "ISSUE",
      section: "Personal Information",
      fieldId: "input-email",
      description: "No contact email address has been specified.",
      whyItMatters: "99% of corporate recruiters contact applicants via email first.",
      suggestedSolution: "Enter an active, professional email address.",
    });
  }

  // 3. Phone Number (Recommended: 3 pts)
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length >= 7) {
    score += 3;
    const hasCountryCode = /^\+/.test(phone) || digitsOnly.length > 10;
    checks.push({
      id: "contact_phone",
      title: "Contact Phone Number",
      status: "PASS",
      message: hasCountryCode
        ? `Phone number provided with international code: "${phone}"`
        : `Phone number provided: "${phone}"`,
    });
  } else if (phone.length > 0) {
    score += 1;
    checks.push({
      id: "contact_phone",
      title: "Short Phone Number",
      status: "WARNING",
      message: "Phone number appears too short (fewer than 7 digits).",
    });
    issues.push({
      id: "issue_contact_phone_short",
      title: "Phone Number Appears Incomplete",
      severity: "WARNING",
      section: "Personal Information",
      fieldId: "input-contactInformation",
      description: `"${phone}" contains fewer than 7 numeric digits.`,
      whyItMatters: "Recruiters cannot schedule phone screenings without a complete dialable phone number.",
      suggestedSolution: "Enter your full telephone number, ideally with area code or international prefix (+1, +44, etc.).",
    });
  } else {
    checks.push({
      id: "contact_phone",
      title: "Missing Phone Number",
      status: "WARNING",
      message: "A phone number is strongly recommended for recruiter phone screenings.",
    });
    issues.push({
      id: "issue_contact_phone_missing",
      title: "Phone Number is Recommended",
      severity: "WARNING",
      section: "Personal Information",
      fieldId: "input-contactInformation",
      description: "No phone number has been provided.",
      whyItMatters: "Hiring managers and recruiters frequently conduct initial phone screenings.",
      suggestedSolution: "Add a mobile number including your area or country code.",
    });
  }

  // 4. Location / Address (Recommended: 2 pts)
  if (location.length >= 3) {
    score += 2;
    checks.push({
      id: "contact_location",
      title: "Location / City, Country",
      status: "PASS",
      message: `Location specified: "${location}"`,
    });
  } else {
    checks.push({
      id: "contact_location",
      title: "Location / City Not Specified",
      status: "WARNING",
      message: "ATS systems filter candidates by geographic radius or country eligibility.",
    });
    issues.push({
      id: "issue_contact_location",
      title: "Location is Recommended",
      severity: "WARNING",
      section: "Personal Information",
      fieldId: "input-address",
      description: "No city or country/state has been specified.",
      whyItMatters: "Many ATS search filters filter by geographic location or commute radius. (Street address is not needed, City & State/Country is sufficient).",
      suggestedSolution: "Add your city and country (e.g., 'San Francisco, CA' or 'London, UK').",
    });
  }

  // 5. LinkedIn Profile (Recommended: 2 pts)
  if (linkedinEntry && linkedinEntry.link) {
    score += 2;
    const hasValidLink = /linkedin\.com/i.test(linkedinEntry.link);
    checks.push({
      id: "contact_linkedin",
      title: "LinkedIn Profile Included",
      status: hasValidLink ? "PASS" : "WARNING",
      message: hasValidLink
        ? "LinkedIn URL verified."
        : "LinkedIn link provided, but does not contain 'linkedin.com'.",
    });
  } else {
    checks.push({
      id: "contact_linkedin",
      title: "LinkedIn Profile (Recommended)",
      status: "OPTIONAL",
      message: "Adding a LinkedIn profile allows recruiters to quickly review your verified professional network.",
    });
    issues.push({
      id: "issue_contact_linkedin",
      title: "Consider Adding LinkedIn Profile",
      severity: "OPTIONAL",
      section: "Social Media",
      fieldId: "section-social-media",
      description: "No LinkedIn URL was found in your social media links.",
      whyItMatters: "Over 87% of corporate recruiters review a candidate's LinkedIn profile during resume review.",
      suggestedSolution: "Add a social link with 'LinkedIn' and your profile URL in the Social Media section.",
    });
  }

  // 6. GitHub Profile (COMPLETELY OPTIONAL - 0 penalty)
  if (githubEntry && githubEntry.link) {
    const isGithubUrl = /github\.com/i.test(githubEntry.link);
    checks.push({
      id: "contact_github",
      title: "GitHub Profile",
      status: "PASS",
      message: isGithubUrl ? "GitHub profile link active." : "GitHub profile link provided.",
    });
  } else {
    checks.push({
      id: "contact_github",
      title: "GitHub Profile (Optional)",
      status: "OPTIONAL",
      message: "GitHub is optional; primarily valuable for software engineering and open-source roles.",
    });
  }

  // 7. Portfolio / Personal Website (COMPLETELY OPTIONAL - 0 penalty)
  if (portfolioEntry && portfolioEntry.link) {
    checks.push({
      id: "contact_portfolio",
      title: "Portfolio / Personal Website",
      status: "PASS",
      message: "Personal portfolio/website link detected.",
    });
  } else {
    checks.push({
      id: "contact_portfolio",
      title: "Portfolio / Website (Optional)",
      status: "OPTIONAL",
      message: "Portfolio is optional; primarily valuable for designers, creatives, and architects.",
    });
  }

  return {
    category: "Contact Information",
    score: Math.min(maxScore, score),
    maxScore,
    checks,
    issues,
  };
};
