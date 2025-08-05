import './Certifications.css'

const Certifications = () => {
  const certifications = [
    {
      id: 1,
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      year: "2024",
      badge: "https://images.credly.com/size/680x680/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png",
      credentialId: "ABC123456",
      validUntil: "2027"
    },
    {
      id: 2,
      name: "Google Cloud Platform Fundamentals",
      issuer: "Google Cloud",
      year: "2024",
      badge: "https://images.credly.com/size/680x680/images/be8fcaeb-c769-4858-b567-ffaaa73ce8d9/image.png",
      credentialId: "GCP789012",
      validUntil: "2026"
    },
    {
      id: 3,
      name: "Microsoft Azure Fundamentals",
      issuer: "Microsoft",
      year: "2023",
      badge: "https://images.credly.com/size/680x680/images/be8fcaeb-c769-4858-b567-ffaaa73ce8d9/image.png",
      credentialId: "AZURE345678",
      validUntil: "2026"
    },
    {
      id: 4,
      name: "React Developer Certification",
      issuer: "Meta",
      year: "2024",
      badge: "https://images.credly.com/size/680x680/images/be8fcaeb-c769-4858-b567-ffaaa73ce8d9/image.png",
      credentialId: "REACT901234",
      validUntil: "2027"
    },
    {
      id: 5,
      name: "Python Programming Certification",
      issuer: "Coursera",
      year: "2023",
      badge: null,
      credentialId: "PYTHON567890",
      validUntil: "2026"
    },
    {
      id: 6,
      name: "Data Science Professional",
      issuer: "IBM",
      year: "2024",
      badge: "https://images.credly.com/size/680x680/images/be8fcaeb-c769-4858-b567-ffaaa73ce8d9/image.png",
      credentialId: "DS123456",
      validUntil: "2027"
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
                  <p className="certification-year">{cert.year}</p>
                </div>
              </div>
              
              <div className="certification-details">
                <p className="credential-id">
                  <strong>Credential ID:</strong> {cert.credentialId}
                </p>
                <p className="valid-until">
                  <strong>Valid Until:</strong> {cert.validUntil}
                </p>
              </div>
              
              <div className="certification-actions">
                <button className="btn btn-outline">
                  View Certificate
                </button>
                <button className="btn btn-outline">
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Certifications 