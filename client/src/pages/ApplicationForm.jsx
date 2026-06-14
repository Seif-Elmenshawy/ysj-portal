import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ALLOWED_FILE_TYPES = {
  researchFiles: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  commentedFiles: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  additionalFiles: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FORM_SECTIONS = [
  { id: 0, name: 'Overview', icon: 'fas fa-info-circle' },
  { id: 1, name: 'Personal & Contact', icon: 'fas fa-user' },
  { id: 2, name: 'Education', icon: 'fas fa-school' },
  { id: 3, name: 'Essays', icon: 'fas fa-file-alt' },
  { id: 4, name: 'Experience', icon: 'fas fa-lightbulb' },
  { id: 5, name: 'Time Commitments', icon: 'fas fa-hourglass-half' },
  { id: 6, name: 'Review & Submit', icon: 'fas fa-paper-plane' }
];

const ACADEMIC_FIELDS = ['Architecture','Astronomy & Astrophysics','Biology','Business & Economics','Chemistry','Computer Science','Engineering','Environmental Studies','Mathematics','Medicine & Health Sciences','Neuroscience','Physics','Psychology'];

export default function ApplicationForm() {
  const { user, submitApplication } = useAuth();
  const { step } = useParams();
  const navigate = useNavigate();
  
  useEffect(()=> {
    if (user.applicationSubmitted == true) {
      navigate("/")
    }
  }, [])

  const parseStep = (s) => {
    const n = parseInt(s);
    if (!isNaN(n) && FORM_SECTIONS.find(sec => sec.id === n)) return n;
    return FORM_SECTIONS[0].id;
  };

  const initialStep = step ? parseStep(step) : FORM_SECTIONS[0].id;
  const [currentSection, setCurrentSection] = useState(initialStep);
  const [completedSections, setCompletedSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: '', agreement: false,
    fullName: '', phone: '', country: '', gender: '', birthDate: '',
    schoolName: '', gradeYear: '', /* preferredPlaces: array of 4 ordered by priority */ preferredPlaces: [
      { field: '' },
      { field: '' },
      { field: '' },
      { field: '' }
    ],
    previousGrades: '', extracurricular: '',
    essay1: '', essay2: '', essay3: '',
    researchExperience: '',
    majorCommitments: '', hoursAvailable: '', hearAbout: '',
    additionalInfo: '',
    otherArea: ''
  });

  const [files, setFiles] = useState({
    researchFiles: [], commentedFiles: [], additionalFiles: []
  });

  const [fileDisplay, setFileDisplay] = useState({
    researchFiles: [], commentedFiles: [], additionalFiles: []
  });

  useEffect(() => {
    loadSavedDraft();
  }, []);

  const loadSavedDraft = () => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Merge loaded draft with default values to ensure all fields exist
        const defaultFormData = {
          email: '', agreement: false,
          fullName: '', phone: '', country: '', gender: '', birthDate: '',
          schoolName: '', gradeYear: '', preferredPlaces: [
            { field: '' },
            { field: '' },
            { field: '' },
            { field: '' }
          ],
          previousGrades: '', extracurricular: '',
          essay1: '', essay2: '', essay3: '',
          researchExperience: '',
          majorCommitments: '', hoursAvailable: '', hearAbout: '',
          additionalInfo: '',
          otherArea: ''
        };
        setFormData({ ...defaultFormData, ...(draft.formData || {}) });
        setFileDisplay(draft.files || fileDisplay);
        setCompletedSections(draft.completedSections || []);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  };

  // Helper: count words in a string
  const wordCount = (text = '') => {
    return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
  };

  const saveDraft = () => {
    const draft = { formData, files: fileDisplay, completedSections };
    localStorage.setItem('applicationDraft', JSON.stringify(draft));
    setSuccess('Draft saved successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const validateFile = (file, fieldName) => {
    const allowedTypes = ALLOWED_FILE_TYPES[fieldName] || [];
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `Invalid file type`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File exceeds 10MB`;
    }
    return null;
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setError('');

    if (fileList.length > 0) {
      const newFiles = Array.from(fileList);
      const errors = [];

      for (let file of newFiles) {
        const error = validateFile(file, name);
        if (error) errors.push(error);
      }

      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }

      setFiles(prev => ({
        ...prev,
        [name]: [...(prev[name] || []), ...newFiles]
      }));

      setFileDisplay(prev => ({
        ...prev,
        [name]: [...(prev[name] || []), ...newFiles.map(f => ({ name: f.name, size: f.size }))]
      }));
    }
  };

  const removeFile = (fieldName, index) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));

    setFileDisplay(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  // Helpers to enforce English-only input and phone formatting
  const sanitizeEnglish = (text = '') => {
    return text.replace(/[^	\n\r\x20-\x7E]/g, '');
  };

  const sanitizePhone = (text = '') => {
    // allow digits, plus, spaces, dashes, parentheses
    return text.replace(/[^+0-9\s\-()]/g, '');
  };

  // Generic input change handler with sanitization
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === 'phone') {
      val = sanitizePhone(val);
    } else if (name === 'schoolName') {
      // Allow school names in any language (preserve Unicode characters)
      val = value;
    } else if ([
      'fullName','country','previousGrades','extracurricular','essay1','essay2','essay3',
      'researchExperience','majorCommitments','hearAbout','additionalInfo','otherArea'
    ].includes(name)) {
      val = sanitizeEnglish(val);
    } else if (name === 'email') {
      // emails should be ASCII only
      val = val.replace(/[^\x00-\x7F]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: val }));
    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handlePlaceChange = (index, field, value) => {
    setFormData(prev => {
      const places = Array.isArray(prev.preferredPlaces) ? [...prev.preferredPlaces] : [
        { place: '', field: '' },{ place: '', field: '' },{ place: '', field: '' },{ place: '', field: '' }
      ];
      places[index] = { ...places[index], [field]: value };
      return { ...prev, preferredPlaces: places };
    });
    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy[`preferredPlaces.${index}.${field}`];
      return copy;
    });
  };

  const handleCheckboxToggle = (field, val) => {
    setFormData(prev => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      if (current.includes(val)) {
        return { ...prev, [field]: current.filter(x => x !== val) };
      }
      return { ...prev, [field]: [...current, val] };
    });
  };

  const isSectionComplete = (sectionId) => {
    switch (sectionId) {
      case 1:
        return formData.email && formData.agreement && formData.fullName && 
               formData.phone && formData.country && formData.gender && formData.birthDate;
      case 2:
        return formData.schoolName && formData.gradeYear &&
               (formData.preferredPlaces && formData.preferredPlaces[0] && formData.preferredPlaces[0].field) &&
               (formData.preferredPlaces && formData.preferredPlaces[1] && formData.preferredPlaces[1].field) &&
               formData.previousGrades && formData.extracurricular;
      case 3:
        // Ensure essays meet minimum/required word counts
        return wordCount(formData.essay1) >= 150 && wordCount(formData.essay2) >= 200 && wordCount(formData.essay2) <= 300 && wordCount(formData.essay3) >= 250 && wordCount(formData.essay3) <= 300;
      case 4:
        return formData.researchExperience;
      case 5:
        return formData.majorCommitments && formData.hoursAvailable && formData.hearAbout;
      case 6:
        return [1, 2, 3, 4, 5].every(id => isSectionComplete(id));
      default:
        return false;
    }
  };

  const validateSection = (sectionId) => {
    const errors = {};

    if (sectionId === 1) {
      if (!formData.email) errors.email = 'Required';
      if (!formData.agreement) errors.agreement = 'You must agree to the terms';
      if (!formData.fullName) errors.fullName = 'Required';
      if (!formData.phone) errors.phone = 'Required';
      if (!formData.country) errors.country = 'Required';
      if (!formData.gender) errors.gender = 'Required';
      if (!formData.birthDate) errors.birthDate = 'Required';

      // Email pattern validation (basic)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
      if (formData.email && !emailRegex.test(formData.email)) errors.email = 'Invalid email format';

      // Phone must include country code (e.g. +123...); allow spaces in display but strip before testing
      const phoneDigits = (formData.phone || '').replace(/\s+/g, '');
      const phoneRegex = /^\+[0-9]{7,15}$/;
      if (formData.phone && !phoneRegex.test(phoneDigits)) errors.phone = 'Include country code, e.g. +201234567890';
    }

    if (sectionId === 2) {
      if (!formData.schoolName) errors.schoolName = 'Required';
      if (!formData.gradeYear) errors.gradeYear = 'Required';
      // Require at least the first two prioritized places and their fields
      if (!formData.preferredPlaces || !formData.preferredPlaces[0] || !formData.preferredPlaces[0].field) errors['preferredPlaces.0.field'] = 'First field selection is required';
      if (!formData.preferredPlaces || !formData.preferredPlaces[1] || !formData.preferredPlaces[1].field) errors['preferredPlaces.1.field'] = 'Second field selection is required';
      if (!formData.previousGrades) errors.previousGrades = 'Required';
      if (!formData.extracurricular) errors.extracurricular = 'Required';
    }

    if (sectionId === 3) {
      const e1 = wordCount(formData.essay1);
      const e2 = wordCount(formData.essay2);
      const e3 = wordCount(formData.essay3);

      if (e1 < 150) errors.essay1 = 'Minimum 150 words required';
      if (e2 < 200) errors.essay2 = 'Minimum 200 words required';
      if (e2 > 300) errors.essay2 = 'Maximum 300 words allowed';
      if (e3 < 250) errors.essay3 = 'Minimum 250 words required';
      if (e3 > 300) errors.essay3 = 'Maximum 300 words allowed';
    }

    if (sectionId === 4) {
      if (!formData.researchExperience) errors.researchExperience = 'Required';
    }

    if (sectionId === 5) {
      if (!formData.majorCommitments) errors.majorCommitments = 'Required';
      if (!formData.hoursAvailable) errors.hoursAvailable = 'Required';
      if (!formData.hearAbout) errors.hearAbout = 'Required';
    }

    // No special validation for review/final step

    return errors;
  };

  const handleNext = () => {
    const errors = validateSection(currentSection);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please complete all fields in this section');
      return;
    }

    setFieldErrors({});
    setError('');

    if (currentSection !== FORM_SECTIONS[0].id && !completedSections.includes(currentSection)) {
      const newCompleted = [...completedSections, currentSection];
      setCompletedSections(newCompleted);
      localStorage.setItem('applicationDraft', JSON.stringify({ formData, files: fileDisplay, completedSections: newCompleted }));
    }

    const idx = FORM_SECTIONS.findIndex(s => s.id === currentSection);
    if (idx >= 0 && idx < FORM_SECTIONS.length - 1) {
      const nextId = FORM_SECTIONS[idx + 1].id;
      setCurrentSection(nextId);
      navigate(`/application/${nextId}`);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    const idx = FORM_SECTIONS.findIndex(s => s.id === currentSection);
    if (idx > 0) {
      const prevId = FORM_SECTIONS[idx - 1].id;
      setCurrentSection(prevId);
      navigate(`/application/${prevId}`);
      setError('');
      setFieldErrors({});
      window.scrollTo(0, 0);
    }
  };

  const goToSection = (sectionId) => {
    setCurrentSection(sectionId);
    navigate(`/application/${sectionId}`);
    setError('');
    setFieldErrors({});
    window.scrollTo(0, 0);
  };

  const handleClearForm = () => {
    if (window.confirm('Clear all data? This cannot be undone.')) {
      setFormData({
        email: '', agreement: false,
        fullName: '', phone: '', country: '', gender: '', birthDate: '',
        schoolName: '', gradeYear: '', preferredPlaces: [
          { field: '' },{ field: '' },{ field: '' },{ field: '' }
        ], previousGrades: '', extracurricular: '',
        essay1: '', essay2: '', essay3: '',
        researchExperience: '',
        majorCommitments: '', hoursAvailable: '', hearAbout: '',
        additionalInfo: '',
        otherArea: ''
      });
      setFiles({ researchFiles: [], commentedFiles: [], additionalFiles: [] });
      setFileDisplay({ researchFiles: [], commentedFiles: [], additionalFiles: [] });
      setCompletedSections([]);
      setCurrentSection(1);
      navigate('/application/1');
      localStorage.removeItem('applicationDraft');
      setError('');
      setSuccess('');
      setFieldErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = {};
    const reviewSection = FORM_SECTIONS.find(s => s.name.toLowerCase().includes('review'));
    const overviewId = FORM_SECTIONS[0].id;
    for (const section of FORM_SECTIONS) {
      if (section.id === reviewSection.id || section.id === overviewId) continue;
      const sectionErrors = validateSection(section.id);
      Object.assign(allErrors, sectionErrors);
    }

    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setError('Please complete all sections');
      const firstIncomplete = FORM_SECTIONS.find(s => s.id !== overviewId && s.id !== reviewSection.id && Object.keys(validateSection(s.id)).length > 0);
      if (firstIncomplete) {
        setCurrentSection(firstIncomplete.id);
        navigate(`/application/${firstIncomplete.id}`);
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare application data - Note: File uploads will be handled separately
      const applicationSubmissionData = {
        ...formData,
        gpa: parseFloat(formData.gpa),
        // Send preferredFields as ordered array of selected field names
        preferredFields: (formData.preferredPlaces || []).map(p => p.field).filter(Boolean),
        researchFiles: fileDisplay.researchFiles.map(f => f.name),
        commentedFiles: fileDisplay.commentedFiles.map(f => f.name),
        additionalFiles: fileDisplay.additionalFiles.map(f => f.name)
      };

      // Submit via AuthContext so local user is updated with returned application
      await submitApplication(applicationSubmissionData);

      setSuccess('Application submitted successfully!');
      localStorage.removeItem('applicationDraft');
      setTimeout(() => window.location.href = '/applicant-dashboard', 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Submission failed. Please try again.';
      setError(errorMessage);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    const reviewSection = FORM_SECTIONS.find(s => s.name.toLowerCase().includes('review'));
    const overviewId = FORM_SECTIONS[0].id;

    if (currentSection === overviewId) {
      return (
        <div className="form-section">
          <h2 style={{ marginBottom: '12px' }}><i className="fas fa-info-circle"></i> Overview</h2>
          <div style={{ maxWidth: '820px', margin: '0', lineHeight: 1.7, fontSize: '15px', color: '#333' }}>
            <p style={{ marginTop: 0 }}>YSJ's Junior Research Program is a student research program designed to help high school students learn research from choosing a research question to publishing a full paper and become part of a community of passionate researchers.</p>

            <p style={{ fontWeight: 600 }}>Throughout the program, participants will have opportunities to:</p>
            <ul style={{ marginTop: 6, marginBottom: 8, paddingLeft: 20 }}>
              <li>Explore the foundations of academic research</li>
              <li>Learn how researchers investigate questions and evaluate evidence</li>
              <li>Engage with peers who share similar academic interests</li>
            </ul>

            <h4 style={{ marginTop: 14, marginBottom: 8 }}>Selection Criteria</h4>
            <p style={{ marginTop: 0 }}>YSJ seeks Juniors with strong potential for growth rather than extensive prior achievements. When reviewing applications, we place particular emphasis on:</p>
            <ul style={{ marginTop: 6, marginBottom: 8, paddingLeft: 20 }}>
              <li>Intellectual curiosity</li>
              <li>Initiative and self-motivation</li>
              <li>Commitment to learning</li>
              <li>Alignment with the values of the program</li>
            </ul>
            <p style={{ marginTop: 0, fontStyle: 'italic' }}>Previous research experience is not required.</p>

            <h4 style={{ marginTop: 14, marginBottom: 8 }}>Application Process</h4>
            <ol style={{ marginTop: 6, marginBottom: 8, paddingLeft: 20 }}>
              <li><strong>Stage 1: Application Review</strong> — Applicants complete the application form, including written responses designed to help us understand their personalities and experiences.</li>
              <li><strong>Stage 2: Interview</strong> — Selected applicants will be invited to an interview where they will discuss their applications.</li>
              <li><strong>Stage 3: Final Decisions</strong> — Successful applicants will receive an admission decision following the completion of the selection process.</li>
            </ol>

            <h4 style={{ marginTop: 14, marginBottom: 8 }}>Terms of Agreement</h4>
            <ul style={{ marginTop: 6, marginBottom: 8, paddingLeft: 20 }}>
              <li>Juniors should participate actively in program activities.</li>
              <li>Juniors are expected to be open to feedback from the YSJ Seniors.</li>
              <li>Juniors are required to demonstrate professionalism and respectful communication.</li>
              <li>Juniors should complete assigned tasks and responsibilities on time.</li>
              <li>Juniors are required to demonstrate willingness to collaborate within a team and genuine commitment to the journal's mission.</li>
              <li>Failure to meet set expectations will result in penalties and could lead up to expulsion in case of repetition.</li>
              <li>Juniors are provided with a certificate detailing their progress and the hours committed, along with their performance ratings, at the end of the specified duration (Mid-October 2026).</li>
              <li style={{ marginTop: 6 }}><strong style={{ color: '#a31313' }}>AI usage in any part through the form or during any tasks in case of acceptance will not be tolerated.</strong></li>
            </ul>

            <p style={{ fontWeight: 600, marginTop: 12 }}>Note: Applications will be reviewed on a rolling basis, so apply now to secure your seat!</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#a31313', marginTop: 6 }}>DEADLINE: 11th July 2026, 23:59 EEST (UTC+3)</p>
          </div>
        </div>
      );
    }
    if (currentSection === 1) {
      return (
        <div className="form-section">
          <h2><i className="fas fa-user"></i> Personal & Contact</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Your personal and contact information</p>

          <div className="form-group">
            <label>Email * {fieldErrors.email && <span style={{color: 'red'}}>{fieldErrors.email}</span>}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$" title="Enter a valid email address" />
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>
              <input type="checkbox" name="agreement" checked={formData.agreement} onChange={(e) => setFormData(prev => ({ ...prev, agreement: e.target.checked }))} />{' '}
              Yes, I agree to the Terms of Agreement *
            </label>
            {fieldErrors.agreement && <div style={{ color: 'red' }}>{fieldErrors.agreement}</div>}
          </div>

          <div className="two-col mt-3">
            <div className="form-group">
              <label>Full Name * {fieldErrors.fullName && <span style={{color: 'red'}}>{fieldErrors.fullName}</span>}</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number (including country code) * {fieldErrors.phone && <span style={{color: 'red'}}>{fieldErrors.phone}</span>}</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Example: +20 123456789" pattern="^\+[0-9\s\-()]{7,}$" title="Include country code, e.g. +201234567890" />
            </div>
            <div className="form-group">
              <label>Country of Nationality * {fieldErrors.country && <span style={{color: 'red'}}>{fieldErrors.country}</span>}</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender * {fieldErrors.gender && <span style={{color: 'red'}}>{fieldErrors.gender}</span>}</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth * {fieldErrors.birthDate && <span style={{color: 'red'}}>{fieldErrors.birthDate}</span>}</label>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
            </div>
          </div>
        </div>
      );
    }

    if (currentSection === 2) {
      return (
        <div className="form-section">
          <h2><i className="fas fa-school"></i> Education</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Your academic information</p>
          <div className="two-col">
            <div className="form-group">
              <label>School Name * {fieldErrors.schoolName && <span style={{color: 'red'}}>{fieldErrors.schoolName}</span>}</label>
              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Educational Grade (as of the 2026-2027 Academic Year) * {fieldErrors.gradeYear && <span style={{color: 'red'}}>{fieldErrors.gradeYear}</span>}</label>
              <select name="gradeYear" value={formData.gradeYear} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Grade 10 (High School Sophomore)">Grade 10 (High School Sophomore)</option>
                <option value="Grade 11 (High School Junior)">Grade 11 (High School Junior)</option>
                <option value="Grade 12 (High School Senior)">Grade 12 (High School Senior)</option>
                <option value="Gap Year Student">Gap Year Student</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '16px' }} className="form-group">
            <label>Your prioritized placements (4) — first two are required * {fieldErrors.preferredPlaces && <span style={{color: 'red'}}>{fieldErrors.preferredPlaces}</span>}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>List up to 4 places in priority order. For each place, select the academic field you would like to pursue there. Only the first two places place are required. It is advised to choose more fields, as this will increase acceptance chance.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {(formData.preferredPlaces || [{},{},{},{}]).map((p, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', alignItems: 'center' }}>
                  <div>
                    <label>Place {idx + 1} {(idx === 0 || idx === 1) ? '*' : <span>&nbsp;</span>} {fieldErrors[`preferredPlaces.${idx}.field`] && <span style={{color:'red'}}>{fieldErrors[`preferredPlaces.${idx}.field`]}</span>}</label>
                    <select value={p.field || ''} onChange={(e) => handlePlaceChange(idx, 'field', e.target.value)}>
                      <option value="">Select field</option>
                      {ACADEMIC_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '12px' }} className="form-group">
            <label>Grade of each respective field in previous academic years (if applicable) * {fieldErrors.previousGrades && <span style={{color: 'red'}}>{fieldErrors.previousGrades}</span>}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Please mention the highest value that can be attained (e.g. 3.7/4.0, 92%, etc.)</p>
            <input type="text" name="previousGrades" value={formData.previousGrades} onChange={handleChange} />
          </div>
          <div style={{ marginTop: '12px' }} className="form-group">
            <label>What extracurricular activities and achievements have you pursued in your area of academic interest? * {fieldErrors.extracurricular && <span style={{color: 'red'}}>{fieldErrors.extracurricular}</span>}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>List relevant courses, certifications, online programs, workshops, bootcamps, or training experiences.</p>
            <textarea name="extracurricular" value={formData.extracurricular} onChange={handleChange} rows="4" placeholder="Include a brief description if applicable"></textarea>
          </div>
        </div>
      );
    }

    if (currentSection === 3) {
      return (
        <div className="form-section">
          <h2><i className="fas fa-file-alt"></i> Essays</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Answer the following essay questions</p>
          <div className="form-group">
            <label>Why do you want to join YSJ Junior, and what do you hope to gain from the experience? * {fieldErrors.essay1 && <span style={{color: 'red'}}>{fieldErrors.essay1}</span>}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Please respond in at least 150 words.</p>
            <textarea name="essay1" value={formData.essay1} onChange={handleChange} rows="5" placeholder="Your response..."></textarea>
            <div style={{ fontSize: '12px', color: wordCount(formData.essay1) < 150 ? '#a31313' : '#155724', marginTop: '6px' }}>
              Words: {wordCount(formData.essay1)} (minimum 150)
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Tell us about something you learned purely because you were curious, not because it was required for school. What interested you about it, and what did you learn? * {fieldErrors.essay2 && <span style={{color: 'red'}}>{fieldErrors.essay2}</span>}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Please respond in 200-300 words.</p>
            <textarea name="essay2" value={formData.essay2} onChange={handleChange} rows="5" placeholder="Your response..."></textarea>
            <div style={{ fontSize: '12px', color: wordCount(formData.essay2) < 200 || wordCount(formData.essay2) > 300 ? '#a31313' : '#155724', marginTop: '6px' }}>
              Words: {wordCount(formData.essay2)} (200-300)
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>A study finds that students who spend more time reading books tend to earn higher grades. Does this mean reading books causes higher grades? Why or why not? What additional information would you want before reaching a conclusion? * {fieldErrors.essay3 && <span style={{color: 'red'}}>{fieldErrors.essay3}</span>}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Please respond in 250-300 words.</p>
            <textarea name="essay3" value={formData.essay3} onChange={handleChange} rows="5" placeholder="Your response..."></textarea>
            <div style={{ fontSize: '12px', color: wordCount(formData.essay3) < 250 || wordCount(formData.essay3) > 300 ? '#a31313' : '#155724', marginTop: '6px' }}>
              Words: {wordCount(formData.essay3)} (250-300)
            </div>
          </div>
        </div>
      );
    }

    if (currentSection === 4) {
      return (
        <div className="form-section">
          <h2><i className="fas fa-lightbulb"></i> Experience</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Tell us about your research experience</p>
          <div className="form-group">
            <label>Please describe your research experience * {fieldErrors.researchExperience && <span style={{color: 'red'}}>{fieldErrors.researchExperience}</span>}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>This experience does not need to be limited to professional or formal settings. We are looking for evidence of your capacity to learn and engage with research methodologies. You may include independent work, such as writing small articles, analyzing academic papers, participating in research programs and workshops, or any other suitable and meaningful ordeals.</p>
            <textarea name="researchExperience" value={formData.researchExperience} onChange={handleChange} rows="6" placeholder="Describe your research experience..."></textarea>
          </div>
        </div>
      );
    }

    if (currentSection === 5) {
      return (
        <div className="form-section">
          <h2><i className="fas fa-hourglass-half"></i> Time Commitments</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Your availability and commitments</p>
          <div className="form-group">
            <label>Kindly provide a list of your major academic, professional, or personal commitments between August 2026 and October 2026 * {fieldErrors.majorCommitments && <span style={{color: 'red'}}>{fieldErrors.majorCommitments}</span>}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>For each commitment, please estimate the average number of hours per week you expect to spend on it.</p>
            <textarea name="majorCommitments" value={formData.majorCommitments} onChange={handleChange} rows="4" placeholder="List your commitments and estimated hours per week for each"></textarea>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>How much time (hours per week) will you be able to commit to YSJ? * {fieldErrors.hoursAvailable && <span style={{color: 'red'}}>{fieldErrors.hoursAvailable}</span>}</label>
            <input type="number" name="hoursAvailable" value={formData.hoursAvailable} onChange={handleChange} min="0" />
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Where did you hear about us? * {fieldErrors.hearAbout && <span style={{color: 'red'}}>{fieldErrors.hearAbout}</span>}</label>
            <input type="text" name="hearAbout" value={formData.hearAbout} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Anything else we should know?</label>
            <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} rows="4" placeholder="Optional: Share any additional information"></textarea>
          </div>
        </div>
      );
    }

    if (currentSection === reviewSection.id) {
      return (
        <div className="form-section">
          <h2><i className="fas fa-clipboard-check"></i> Review & Submit</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Review before submitting</p>

          <div className="two-col mb-3">
            {FORM_SECTIONS.filter(s => s.id !== overviewId && s.id !== reviewSection.id).map(section => (
              <div key={section.id} style={{ padding: '15px', backgroundColor: completedSections.includes(section.id) ? '#d4edda' : '#f5f5f5', borderRadius: '4px', border: `2px solid ${completedSections.includes(section.id) ? '#28a745' : '#ddd'}`, cursor: 'pointer' }} onClick={() => goToSection(section.id)}>
                <h4><i className={section.icon}></i> {section.name}</h4>
                <p style={{ marginBottom: 0, fontSize: '12px', color: completedSections.includes(section.id) ? '#155724' : '#666' }}>
                  {completedSections.includes(section.id) ? 'Completed' : 'Pending'}
                </p>
              </div>
            ))}
          </div>

          <div style={{ padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px', borderLeft: '4px solid #2196F3', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}><i className="fas fa-info-circle"></i> Summary</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Full Name:</strong> {formData.fullName || 'Not provided'}</li>
              <li><strong>Email:</strong> {formData.email || 'Not provided'}</li>
              <li><strong>School:</strong> {formData.schoolName || 'Not provided'}</li>
              <li><strong>Grade:</strong> {formData.gradeYear || 'Not provided'}</li>
              <li><strong>Preferred placements:</strong> {(formData.preferredPlaces || []).map((p, i) => p.field ? `${i+1}. ${p.field}` : null).filter(Boolean).join(' | ') || 'Not provided'}</li>
              <li><strong>Extracurriculars:</strong> {formData.extracurricular || 'Not provided'}</li>
              <li><strong>Available Hours/Week:</strong> {formData.hoursAvailable || 'Not provided'}</li>
              <li><strong>Anything else:</strong> {formData.additionalInfo || 'Not provided'}</li>
            </ul>
          </div>

          <p style={{ color: '#999', fontSize: '12px' }}>By submitting, you confirm all information is accurate.</p>
        </div>
      );
    }
  };

  return (
    <div className="page-enter form-page">
      <div className="card">
        <div className="card-header">
          <h2><i className="fas fa-pencil-alt"></i> YSJ Junior Program Application</h2>
        </div>

        {/* Overview shown as a dedicated section via renderer */}

        {/* Navigation Tabs with Completion Status */}
        <div className="section-tabs">
          {FORM_SECTIONS.map((section) => {
            const isComplete = isSectionComplete(section.id);
            
            return (
              <button
                key={section.id}
                onClick={() => goToSection(section.id)}
                style={{
                  flex: 1,
                  padding: '15px 10px',
                  textAlign: 'center',
                  backgroundColor: currentSection === section.id ? 'var(--primary-color)' : isComplete ? '#d4edda' : 'transparent',
                  color: currentSection === section.id ? 'white' : isComplete ? '#155724' : '#333',
                  border: 'none',
                  borderRadius: '0',
                  cursor: 'pointer',
                  opacity: 1,
                  fontSize: '12px',
                  fontWeight: currentSection === section.id ? 'bold' : 'normal',
                  transition: 'all 0.3s ease'
                }}
                title={isComplete ? 'Section complete' : 'Section incomplete'}
              >
                <div style={{ fontSize: '18px', marginBottom: '5px' }}><i className={section.icon}></i></div>
                <div>{section.name}</div>
              </button>
            );
          })}
        </div>

        <div className="card-body">
          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
          {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}

          <form onSubmit={handleSubmit}>
            {renderSection()}

            {/* Navigation Buttons */}
            <div className="form-actions">
              <div className="form-actions-group">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-trash"></i> Clear
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  className="btn btn-primary"
                >
                  <i className="fas fa-save"></i> Save Draft
                </button>
              </div>

              <div className="form-actions-group">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={FORM_SECTIONS.findIndex(s => s.id === currentSection) === 0}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-arrow-left"></i> Previous
                </button>

                {FORM_SECTIONS.findIndex(s => s.id === currentSection) < FORM_SECTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success"
                  >
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</> : <><i className="fas fa-paper-plane"></i> Submit</>}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
