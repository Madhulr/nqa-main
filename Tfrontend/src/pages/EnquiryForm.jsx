
import React, { useState } from 'react';
import {
  TextField, RadioGroup, FormControlLabel, FormLabel, Checkbox,
  FormHelperText, FormControl, Radio
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import 'react-toastify/dist/ReactToastify.css';
import './EnquiryForm.css';
import axios from 'axios';

const modules = [
  'Professional Starter Testing', 'Cypress', 'Professional Experts with Java Automation', 'Python Development Full Stack',
  'Professional Experts with Python Automation', 'Java Full Stack Development', 'Professional Experts with Mobile Automation',
  'MERN Stack', 'Professional Experts with API Automation', 'UI/UX Designing', 'SDET Xpert', 'AI/ML Engineering',
  'Individual Courses', 'Data Analytics', 'AI Testing', 'Diploma in Software Engineering at Testina',
  'Playwright', 'Diploma in Software Engineering of Development', 'Other'
];

const EnquiryForm = ({ isSidebarOpen }) => {
  const initialFormData = {
    name: '',
    phone: '',
    email: '',
    location: '',
    module: '',
    timing: '',
    trainingTime: '',
    profession: '',
    qualification: '',
    experience: '',
    referral: '',
    consent: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [lastClicked, setLastClicked] = useState({});
  const [otherValues, setOtherValues] = useState({
    module: '',
    profession: '',
    referral: '',
    qualification: ''
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    ['name', 'phone', 'email', 'location', 'module', 'timing', 'trainingTime', 'profession', 'qualification', 'experience'].forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field} is required`;
        valid = false;
      }
    });

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailPattern.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }

    // Phone number validation
    const phonePattern = /^\d{10}$/;
    if (formData.phone && !phonePattern.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
      valid = false;
    }

    if (!formData.consent) {
      newErrors.consent = 'Consent is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'radio') {
      if (lastClicked[name] === value) {
        setFormData(prev => ({ ...prev, [name]: '' }));
        setLastClicked(prev => ({ ...prev, [name]: '' }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
        setLastClicked(prev => ({ ...prev, [name]: value }));
      }

      if (value === 'Other') {
        // Reset value to previously typed "Other" value
        setFormData(prev => ({ ...prev, [name]: otherValues[name] }));
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOtherChange = (field, value) => {
    setOtherValues(prev => ({ ...prev, [field]: value }));
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    console.log(formData)

    try {
      const response = await axios.post('http://localhost:5000/api/enquiries', formData);

      if (response.status === 200) {
        toast.success('Enquiry submitted successfully');
        setFormData({ ...initialFormData });
        setOtherValues({ module: '', profession: '', referral: '', qualification: '' });
        setLastClicked({});
      } else {
        toast.error('Failed to submit enquiry');
      }
    } catch (error) {
      toast.error('Server error. Please try again later.');
    }
  };

  const handleClear = () => {
    setFormData({ ...initialFormData });
    setErrors({});
    setOtherValues({ module: '', profession: '', referral: '', qualification: '' });
    setLastClicked({});
  };

  const middleIndex = Math.ceil(modules.length / 2);
  const column1 = modules.slice(0, middleIndex);
  const column2 = modules.slice(middleIndex);

  return (
    <div className="enquiry-page">
      <div className={`enquiry-form-container ${isSidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
        <div className="title-container">
          <h2>Student Enquiry Form</h2>
        </div>

        <form className="enquiry-form" onSubmit={handleSubmit}>
          {['name', 'phone', 'email', 'location'].map((field) => (
            <div className="form-container" key={field}>
              <TextField
                required
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                variant="standard"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                fullWidth
                error={!!errors[field]}
                helperText={errors[field]}
              />
            </div>
          ))}

          {/* Module */}
          <div className="form-container">
            <FormControl required error={!!errors.module}>
              <FormLabel>Enquiry for which module</FormLabel>
              <RadioGroup name="module" onChange={handleChange} value={formData.module === otherValues.module ? 'Other' : formData.module}>
                <div style={{ display: 'flex' }}>
                  <ul style={{ width: '50%', listStyleType: 'none', padding: 0 }}>
                    {column1.map((item, index) => (
                      <li key={index}>
                        <FormControlLabel
                          value={item}
                          control={<Radio onDoubleClick={handleChange} />}
                          label={item}
                        />
                      </li>
                    ))}
                  </ul>
                  <ul style={{ width: '50%', listStyleType: 'none', padding: 0 }}>
                    {column2.map((item, index) => (
                      <li key={index}>
                        <FormControlLabel
                          value={item}
                          control={<Radio onDoubleClick={handleChange} />}
                          label={item}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </RadioGroup>
              {lastClicked.module === 'Other' && (
                <TextField
                  label="Other (Specify)"
                  variant="standard"
                  value={otherValues.module}
                  onChange={(e) => handleOtherChange('module', e.target.value)}
                  fullWidth
                />
              )}
              <FormHelperText>{errors.module}</FormHelperText>
            </FormControl>
          </div>

          {/* Other radio fields */}
          {[
            { label: 'Preferred Training Mode', name: 'timing', options: ['Offline', 'Online', 'Hybrid'] },
            { label: 'Preferred Training timings ', name: 'trainingTime', options: ['Morning(7 AM Batch)', 'Anytime in Weekdays', 'Evening(6PM Batch)', 'Weekends'] },
            { label: 'How soon will the student able to start? ', name: 'startTime', options: ['Immediate', 'After 15 days', 'After 10 days', 'After 1 Month'] },
            { label: "Student's Professional Situation", name: 'profession', options: ['Fresher', 'Currently Working', 'Willing to Switch from Another Domain', 'Other'] },
            { label: 'Highest Qualification', name: 'qualification', options: ['Diploma', "Bachelor's Degree", "Master's Degree", 'Other'] },
            { label: 'Experience (In Years)', name: 'experience', options: ['Less than 1 Year or Fresher', '1-3 Years', '3-5 Years', '5+ Years'] }
          ].map(({ label, name, options }) => (
            <div className="form-container" key={name}>
              <FormControl required error={!!errors[name]}>
                <FormLabel>{label}</FormLabel>
                <RadioGroup row name={name} value={formData[name] === otherValues[name] ? 'Other' : formData[name]} onChange={handleChange}>
                  {options.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio onDoubleClick={handleChange} />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
                {lastClicked[name] === 'Other' && (
                  <TextField
                    label="Other (Specify)"
                    variant="standard"
                    value={otherValues[name]}
                    onChange={(e) => handleOtherChange(name, e.target.value)}
                    fullWidth
                  />
                )}
                <FormHelperText>{errors[name]}</FormHelperText>
              </FormControl>
            </div>
          ))}

          {/* Referral Source */}
          <div className="form-container">
            <FormControl>
              <FormLabel>How did the student get to know about NammaQA?</FormLabel>
              <RadioGroup name="referral" value={formData.referral === otherValues.referral ? 'Other' : formData.referral} onChange={handleChange}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {['Instagram', 'Whatsapp Channel', 'Facebook', 'Linkedin', 'Youtube', 'Friend Reference', 'College Reference', 'Other Social Network', 'Other'].map(option => (
                    <div style={{ width: '25%' }} key={option}>
                      <FormControlLabel
                        value={option}
                        control={<Radio onDoubleClick={handleChange} />}
                        label={option}
                      />
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {lastClicked.referral === 'Other' && (
                <TextField
                  label="Other (Specify)"
                  variant="standard"
                  value={otherValues.referral}
                  onChange={(e) => handleOtherChange('referral', e.target.value)}
                  fullWidth
                />
              )}
            </FormControl>
          </div>

          {/* Consent */}
          <div className="form-container">
            <FormControl required error={!!errors.consent}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                  />
                }
                label="I agree to be contacted via phone, WhatsApp, email, Newsletters regarding NammaQA Training, Community programs, and offers."
              />
              <FormHelperText>{errors.consent}</FormHelperText>
            </FormControl>
          </div>

          <Stack direction="row" spacing={2} style={{ margin: '20px 0' }}>
            <Button variant="contained" color="secondary" onClick={handleClear}>
              Clear Form
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </Stack>
        </form>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default EnquiryForm;
