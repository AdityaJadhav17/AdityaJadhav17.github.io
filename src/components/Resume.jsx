import { useState } from 'react'
import './Resume.css'

// CHANGED: import icons from react-icons
import { FaGraduationCap, FaBriefcase, FaTools, FaProjectDiagram, FaDownload, FaEye } from 'react-icons/fa'

const Resume = () => {
  const [showEmbedded, setShowEmbedded] = useState(false)

  const resumeUrl = "/Aditya_Jadhav_Resume.pdf" // Replace with actual resume path
  const downloadResume = () => {
    const link = document.createElement('a')
    link.href = resumeUrl
    link.download = 'Aditya_Jadhav_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section id="resume" className="resume">
      <div className="container">
        <h2 className="section-title">Resume</h2>
        
        <div className="resume-content">
          <div className="resume-info">
            <h3>Download My Resume</h3>
            <p>
              View or download my current resume in PDF format. It includes my 
              education, work experience, skills, and projects.
            </p>
            
            <div className="resume-actions">
              {/* CHANGED: Download = primary CTA */}
              <button 
                className="btn btn-primary"
                onClick={downloadResume}
              >
                <FaDownload /> Download PDF
              </button>

              <button 
                className="btn btn-secondary"
                onClick={() => window.open(resumeUrl, '_blank')}
              >
                <FaEye /> View Resume
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={() => setShowEmbedded(!showEmbedded)}
              >
                {showEmbedded ? 'Hide' : 'Show'} Embedded Viewer
              </button>
            </div>
          </div>

          {showEmbedded && (
            <div className="resume-embed">
              <div className="embed-header">
                <h4>Resume Preview</h4>
                <button 
                  className="close-embed"
                  onClick={() => setShowEmbedded(false)}
                >
                  ✕
                </button>
              </div>
              <iframe
                src={resumeUrl}
                title="Resume Preview"
                className="resume-iframe"
                width="100%"
                height="600"
              />
            </div>
          )}

          <div className="resume-highlights">
            <h3>Key Highlights</h3>
            <div className="highlights-grid">
              {/* CHANGED: Updated Education */}
              <div className="highlight-item">
                <span className="highlight-icon"><FaGraduationCap /></span>
                <h4>Education</h4>
                <p>B.S. in Computer Science – UC San Diego (Expected June 2027)</p>
              </div>
              
              {/* CHANGED: Updated Experience */}
              <div className="highlight-item">
                <span className="highlight-icon"><FaBriefcase /></span>
                <h4>Experience</h4>
                <p>Web Development Intern – NutrifitWorld</p>
              </div>
              
              {/* CHANGED: Updated Skills */}
              <div className="highlight-item">
                <span className="highlight-icon"><FaTools /></span>
                <h4>Skills</h4>
                <p>Python · React · Node.js · C++ · Java</p>
              </div>
              
              {/* CHANGED: Updated Projects */}
              <div className="highlight-item">
                <span className="highlight-icon"><FaProjectDiagram /></span>
                <h4>Projects</h4>
                <p>Synthetic-to-Real Object Detection, Live AI Chat Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Resume
