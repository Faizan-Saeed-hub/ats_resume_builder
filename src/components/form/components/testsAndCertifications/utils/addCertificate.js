export const addCertificate = (resumeData, setResumeData) => {
  const newCert = {
    name: "",
    issuer: "",
    date: "",
    credentialId: "",
    url: "",
  };
  setResumeData({
    ...resumeData,
    certifications: [...(resumeData.certifications || []), newCert],
  });
};
