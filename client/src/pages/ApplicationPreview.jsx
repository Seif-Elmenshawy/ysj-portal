import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react"
import api from "../utils/api.js"

export default function ApplicationPreview() {
  //  const { user } = useAuth();
  const [userData, setUserData] = useState({})
  const [app, setApp] = useState({})

  const token = localStorage.getItem("token")

  const previewApplication = async (token) => {
    const body = {
      token
    }

    const response = await api.get("/users/profile")
    const { user } = response.data
    setUserData(user)
    setApp(user.application)
  }

  useEffect(() => {
    previewApplication(token)
  }, [])

  if (!userData) {
    return (
      <div style={{ padding: 20 }}>
        <h3>Please log in to view your application.</h3>
        <Link to="/login" className="btn">Login</Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 20, maxWidth: 900 }}>
      <h2>Application Preview</h2>
      <p style={{ color: '#666' }}>This view shows the complete application as stored in your profile.</p>

      <section style={{ marginTop: 12 }}>
        <h4>Personal</h4>
        <div><strong>Full name:</strong> {app.fullName || userData.username}</div>
        <div><strong>Phone:</strong> {app.phone || 'Not provided'}</div>
        <div><strong>Email:</strong> {userData.email}</div>
        <div><strong>Country:</strong> {app.country || 'Not provided'}</div>
        <div><strong>Gender:</strong> {app.gender || 'Not provided'}</div>
        <div><strong>Birth date:</strong> {app.birthDate || 'Not provided'}</div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Education</h4>
        <div><strong>School / Institution:</strong> {app.institution || 'Not provided'}</div>
        <div><strong>Grade Year:</strong> {app.gradeYear || 'Not provided'}</div>
        <div><strong>Previous Grades:</strong> {app.gradePrevious || 'Not provided'}</div>
        <div><strong>Extracurricular / Activities:</strong> {app.extracurricular || 'Not provided'}</div>
        <div><strong>Preferred Fields (by priority):</strong> {(app.preferredFields || []).length > 0 ? (app.preferredFields.join(' | ')) : 'Not provided'}</div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Essays</h4>
        <div style={{ marginBottom: 8 }}><strong>Why join:</strong><div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{app.essay1 || 'Not provided'}</div></div>
        <div style={{ marginBottom: 8 }}><strong>Curious learning:</strong><div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{app.essay2 || 'Not provided'}</div></div>
        <div style={{ marginBottom: 8 }}><strong>Reading & grades question:</strong><div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{app.essay3 || 'Not provided'}</div></div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Experience & Commitments</h4>
        <div><strong>Research experience:</strong></div>
        <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{app.researchExperience || 'Not provided'}</div>
        <div style={{ marginTop: 8 }}><strong>Major commitments:</strong> {app.majorCommitments || 'Not provided'}</div>
        <div><strong>Hours available / week:</strong> {app.hoursAvailable || 'Not provided'}</div>
        <div style={{ marginTop: 8 }}><strong>Preferred time blocks:</strong> {app.timeBlocks || 'Not provided'}</div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Files</h4>
        <div><strong>Research files:</strong> {(app.researchFiles || []).length > 0 ? app.researchFiles.join(', ') : 'None'}</div>
        <div><strong>Commented files:</strong> {(app.commentedFiles || []).length > 0 ? app.commentedFiles.join(', ') : 'None'}</div>
        <div><strong>Additional files:</strong> {(app.additionalFiles || []).length > 0 ? app.additionalFiles.join(', ') : 'None'}</div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Meta</h4>
        <div><strong>Status:</strong> {app.status || (userData.applicationSubmitted ? 'submitted' : 'draft')}</div>
        <div><strong>Submitted At:</strong> {app.submittedAt ? new Date(app.submittedAt).toLocaleString() : 'Not submitted'}</div>
      </section>

      <div style={{ marginTop: 16 }}>
        <Link to="/applicant-dashboard" className="btn btn-hero">Back to Dashboard</Link>
      </div>
    </div>
  );
}
