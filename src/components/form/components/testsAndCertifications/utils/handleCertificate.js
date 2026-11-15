export const handleCertificate = (resumeData, setResumeData, fieldOrEvent, valueOrIndex, indexOptional) => {
  const newCerts = [...(resumeData.certifications || [])];
  
  // Support both (resumeData, setResumeData, field, value, index) and legacy (resumeData, setResumeData, e, index)
  let field = "name";
  let value = "";
  let targetIndex = 0;

  if (typeof fieldOrEvent === "string") {
    field = fieldOrEvent;
    value = valueOrIndex;
    targetIndex = indexOptional;
  } else {
    const e = fieldOrEvent;
    targetIndex = valueOrIndex;
    field = e.target.name || "name";
    value = e.target.value;
  }

  const currentItem = newCerts[targetIndex];
  if (typeof currentItem === "object" && currentItem !== null) {
    newCerts[targetIndex] = {
      ...currentItem,
      [field]: value,
    };
  } else {
    newCerts[targetIndex] = {
      name: typeof currentItem === "string" ? currentItem : "",
      issuer: "",
      date: "",
      credentialId: "",
      url: "",
      [field]: value,
    };
  }

  setResumeData({ ...resumeData, certifications: newCerts });
};
