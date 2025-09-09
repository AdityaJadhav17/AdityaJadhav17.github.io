import './Home.css'

const Home = () => {
  // CHANGED: Use a public-file path for your photo (put the image in /public)
  const profileSrc = "/aditya-profile.jpeg" // e.g., /public/aditya-profile.jpg

  return (
    <section id="home" className="home">
      <div className="home-container">
        <div className="home-content">
          <div className="profile-section">
            <div className="profile-image">
              {/* CHANGED: replaced placeholder with your real profile picture */}
              <img
                src={profileSrc}
                alt="Aditya Jadhav headshot"
                className="profile-photo" // CHANGED
                loading="eager"
                width={200}
                height={200}
              />
            </div>
            
            <div className="hero-text">
              <h1 className="hero-title">
                Hi, I'm <span className="highlight">Aditya Jadhav</span>
              </h1>

              {/* CHANGED: new subtitle with anticipated graduation */}
              <h2 className="hero-subtitle">
                B.S. Computer Science @ UC San Diego (Anticipated June 2027)
              </h2>

              {/* CHANGED: sharper positioning — AI/ML + Cloud/Security + experience */}
              <p className="hero-description">
                Aspiring <strong>AI/ML</strong> engineer with interests in <strong>Cloud</strong> and <strong>Security</strong>. 
                Experience in modern <strong>web development</strong>, <strong>AI-powered</strong> applications, and <strong>cybersecurity</strong> projects.
              </p>
              
              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  View My Work
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Contact Me {/* CHANGED: clearer CTA text */}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </div>
    </section>
  )
}

export default Home
