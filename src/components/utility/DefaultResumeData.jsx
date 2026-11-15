/**
 * Default Blank Resume Data Schema
 * Mandatory Requirement: On initial load and after Reset, the CV is completely blank.
 * Sample data is only loaded when explicitly clicking "Sample Data".
 */
const DefaultResumeData = {
  name: "",
  position: "",
  contactInformation: "",
  email: "",
  address: "",
  profilePicture: "",
  socialMedia: [],
  summary: "",
  education: [],
  workExperience: [],
  projects: [],
  skills: [],
  languages: [],
  certifications: [],
  profilePhotoStyle: "circle",
  showProfilePhoto: true,
  selectedTemplate: "modern-professional",
};

export default DefaultResumeData;
