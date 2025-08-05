import './Home.css'

const Home = () => {
  return (
    <section id="home" className="home">
      <div className="home-container">
        <div className="home-content">
          <div className="profile-section">
            <div className="profile-image">
              {/* Replace with actual profile photo */}
              <div className="profile-placeholder">
                <span>👤</span>
                <p>Add your photo here</p>
              </div>
            </div>
            
            <div className="hero-text">
              <h1 className="hero-title">
                Hi, I'm <span className="highlight">Aditya Jadhav</span>
              </h1>
              <h2 className="hero-subtitle">
                Junior Computer Science Student
              </h2>
              <p className="hero-description">
                Passionate about technology, problem-solving, and creating innovative solutions. 
                Currently pursuing my degree in Computer Science while building projects and 
                expanding my skills in software development.
              </p>
              
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}>
                  View My Work
                </button>
                <button className="btn btn-secondary" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
                  Get In Touch
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