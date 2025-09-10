import './Certifications.css'

const Certifications = () => {
  const certifications = [
    {
      id: 1,
      name: "Code Generation and Optimization Using IBM Granite",
      issuer: "IBM SkillsBuild",
      year: "2025",
      badge: "/code-generation-ibm.png",   // Place in /public
      pdf: "/code-generation-ibm.pdf",     // Place in /public
      verify: "https://www.credly.com/badges/b414adea-8ca1-45f2-adbe-7feb64c95470/public_url"
    },
    {
      id: 2,
      name: "Cybersecurity Fundamentals",
      issuer: "IBM SkillsBuild",
      year: "2025",
      badge: "/cybersecurity-fundamentals.png",
      pdf: "/cybersecurity-fundamentals.pdf",
      verify: "https://www.credly.com/badges/507ef381-fd3b-4fd3-ad51-73a4b833382b/public_url"
    },
    {
      id: 3,
      name: "Data Classification and Summarization Using IBM Granite",
      issuer: "IBM SkillsBuild",
      year: "2025",
      badge: "/data-classification-ibm.png",
      pdf: "/data-classification-ibm.pdf",
      verify: "https://www.credly.com/badges/c4c60ccc-efec-4752-8cbf-dee061d4f490/public_url"
    }
  ]

  return (
    <section id="certifications" className="certifications">
      <div className="container">
        <h2 className="section-title">Certifications</h2>
        
        <div className="certifications-grid">
          {certifications.map((cert) => (
            <div key={cert.id} className="certification-card">
              <div className="certification-header">
                {cert.badge ? (
                  <img 
                    src={cert.badge} 
                    alt={`${cert.name} badge`}
                    className="certification-badge"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="certification-placeholder">
                    <span>🏆</span>
                  </div>
                )}
                
                <div className="certification-info">
                  <h3 className="certification-name">{cert.name}</h3>
                  <p className="certification-issuer">{cert.issuer}</p>
                  <p className="certification-year">Issued {cert.year}</p>
                </div>
              </div>
              
              <div className="certification-actions">
                <a 
                  href={cert.pdf} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline"
                >
                  View Certificate
                </a>
                <a 
                  href={cert.verify} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline"
                >
                  Verify
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Certifications
