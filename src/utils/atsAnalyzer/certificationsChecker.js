/**
 * Certifications ATS Checker
 * Evaluates professional certificates and credentials.
 * STRICT RULE: Certifications are COMPLETELY OPTIONAL.
 * Missing certifications must NEVER generate a critical error or harsh penalty.
 * Maximum score: 5 points.
 */

export const checkCertifications = (resumeData = {}) => {
  let score = 0;
  const maxScore = 5;
  const checks = [];
  const issues = [];

  const rawCerts = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
  const validCerts = rawCerts.filter((c) => {
    if (typeof c === "string") return c.trim().length > 0;
    if (typeof c === "object" && c !== null) return (c.name && c.name.trim()) || (c.issuer && c.issuer.trim());
    return false;
  });

  if (validCerts.length > 0) {
    score = 5;
    const firstCert = validCerts[0];
    const certName = typeof firstCert === "string" ? firstCert : firstCert.name || "Certification";
    const issuer = typeof firstCert === "object" && firstCert?.issuer ? ` (${firstCert.issuer})` : "";

    checks.push({
      id: "cert_presence",
      title: "Verified Credentials Included",
      status: "PASS",
      message: `${validCerts.length} certification(s) listed: ${certName}${issuer}.`,
    });

    // Check if issuer or date is provided
    const hasIssuer = validCerts.some((c) => typeof c === "object" && c?.issuer);
    if (!hasIssuer) {
      checks.push({
        id: "cert_issuer",
        title: "Issuing Authority (Optional)",
        status: "OPTIONAL",
        message: "Specifying the issuing body (e.g., AWS, Microsoft, Cisco) reinforces credential validity.",
      });
    }
  } else {
    // Fair credit: award 4/5 base points because certifications are strictly optional
    score = 4;
    checks.push({
      id: "cert_presence",
      title: "Certifications (Optional)",
      status: "OPTIONAL",
      message: "No certifications added. Certifications are optional and depend on your industry and career level.",
    });
    // Add only as an OPTIONAL recommendation, NOT an ISSUE or WARNING
    issues.push({
      id: "opt_cert_add",
      title: "Add Relevant Certifications If Applicable",
      severity: "OPTIONAL",
      section: "Certifications",
      fieldId: "section-certifications",
      description: "No professional licenses or certificates are listed.",
      whyItMatters: "Industry credentials (like AWS Certified, PMP, Scrum Master, or CompTIA) provide instant third-party validation when applicable.",
      suggestedSolution: "If you have completed relevant certifications or professional training, add them in the Tests & Certifications section.",
    });
  }

  return {
    category: "Certifications",
    score: Math.min(maxScore, score),
    maxScore,
    certCount: validCerts.length,
    checks,
    issues,
  };
};
