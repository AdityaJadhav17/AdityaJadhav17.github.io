import './About.css'

const About = () => {
  const technicalSkills = [
    'Python', 'C++', 'Java', 'JavaScript', 'React', 'HTML/CSS',
    'PyTorch', 'TensorFlow', 'NumPy', 'FastAI', 'OpenCV', 'YOLOv8',
    'Node.js', 'SQL', 'Git', 'Cloud Platforms (IBM, AWS)'
  ]

  const softSkills = [
    'Problem Solving', 'Team Collaboration', 'Leadership',
    'Communication', 'Adaptability', 'Critical Thinking', 'Creativity'
  ]

  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        
        <div className="about-content">
          <div className="about-text">
            <h3>Background</h3>
              <p>
                I’ve always been curious about how things work, and that curiosity naturally pulled me
                into tech. Over the last couple of years, I’ve gone from experimenting with small coding
                projects to building full AI pipelines, interactive web apps, and even leading workshops
                for other students.
              </p>
  
              <p>
                A big part of my journey has been learning by doing—whether it was training a bird
                classifier on thousands of rainforest images, creating a responsive portfolio site,
                or running my college AI Club. Each project taught me something new and pushed me
                to take on bigger challenges.
              </p>

              <p>
                What excites me most now is finding ways to use AI/ML and software development to
                solve real problems. I enjoy collaborating with others, sharing ideas, and building
                things that make an impact, while always staying open to learning something new.
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
              <h4>Bachelor of Science in Computer Science at UC San Diego</h4>
              <p>Currently pursuing my degree with focus on software engineering, AI/ML, and cloud systems and security.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
