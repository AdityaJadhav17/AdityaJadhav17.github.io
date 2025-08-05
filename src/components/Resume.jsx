import { useState } from 'react'
import './Resume.css'

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
              <button 
                className="btn btn-primary"
                onClick={() => window.open(resumeUrl, '_blank')}
              >
                <span>📄</span> View Resume
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={downloadResume}
              >
                <span>⬇️</span> Download PDF
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={() => setShowEmbedded(!showEmbedded)}
              >
                <span>👁️</span> {showEmbedded ? 'Hide' : 'Show'} Embedded Viewer
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
              <div className="highlight-item">
                <span className="highlight-icon">🎓</span>
                <h4>Education</h4>
                <p>Bachelor of Science in Computer Science</p>
              </div>
              
              <div className="highlight-item">
                <span className="highlight-icon">💼</span>
                <h4>Experience</h4>
                <p>Software Development & Web Technologies</p>
              </div>
              
              <div className="highlight-item">
                <span className="highlight-icon">🛠️</span>
                <h4>Skills</h4>
                <p>React, JavaScript, Python, Node.js, and more</p>
              </div>
              
              <div className="highlight-item">
                <span className="highlight-icon">📁</span>
                <h4>Projects</h4>
                <p>Full-stack applications and web development</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Resume 