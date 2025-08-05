import './About.css'

const About = () => {
  const technicalSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'HTML/CSS',
    'Git', 'SQL', 'MongoDB', 'REST APIs', 'TypeScript', 'Next.js'
  ]

  const softSkills = [
    'Problem Solving', 'Team Collaboration', 'Communication', 'Time Management',
    'Adaptability', 'Critical Thinking', 'Leadership', 'Project Management'
  ]

  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        
        <div className="about-content">
          <div className="about-text">
            <h3>Background</h3>
            <p>
              I'm a junior Computer Science student with a passion for technology and innovation. 
              My journey in tech began with curiosity about how things work, which led me to pursue 
              a degree in Computer Science. I enjoy tackling complex problems and turning ideas into 
              reality through code.
            </p>
            
            <p>
              Currently, I'm focused on expanding my knowledge in software development, 
              learning new technologies, and building projects that make a difference. 
              I believe in continuous learning and staying updated with the latest industry trends.
            </p>
          </div>

          <div className="skills-section">
            <div className="skills-group">
              <h3>Technical Skills</h3>
              <div className="skills-grid">
                {technicalSkills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="skills-group">
              <h3>Soft Skills</h3>
              <div className="skills-grid">
                {softSkills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="education-section">
            <h3>Education</h3>
            <div className="education-item">
              <h4>Bachelor of Science in Computer Science</h4>
              <p>Currently pursuing my degree with focus on software engineering and web development</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About 