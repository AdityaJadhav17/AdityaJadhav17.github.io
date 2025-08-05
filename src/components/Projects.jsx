import './Projects.css'

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "Portfolio Website",
      description: "A modern, responsive portfolio website built with React and CSS. Features smooth scrolling navigation, dark mode toggle, and contact form functionality.",
      image: "/project-placeholder.jpg", // Replace with actual project image
      tech: ["React", "JavaScript", "CSS", "HTML"],
      github: "https://github.com/yourusername/portfolio",
      demo: "https://your-portfolio-demo.com",
      featured: true
    },
    {
      id: 2,
      title: "Task Management App",
      description: "A full-stack task management application with user authentication, CRUD operations, and real-time updates.",
      image: "/project-placeholder.jpg", // Replace with actual project image
      tech: ["React", "Node.js", "MongoDB", "Express"],
      github: "https://github.com/yourusername/task-app",
      demo: "https://task-app-demo.com",
      featured: true
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "A weather application that displays current weather conditions and forecasts using external APIs.",
      image: "/project-placeholder.jpg", // Replace with actual project image
      tech: ["JavaScript", "HTML", "CSS", "Weather API"],
      github: "https://github.com/yourusername/weather-app",
      demo: "https://weather-app-demo.com",
      featured: false
    },
    {
      id: 4,
      title: "E-commerce Platform",
      description: "A complete e-commerce solution with product catalog, shopping cart, and payment integration.",
      image: "/project-placeholder.jpg", // Replace with actual project image
      tech: ["React", "Node.js", "Stripe", "PostgreSQL"],
      github: "https://github.com/yourusername/ecommerce",
      demo: "https://ecommerce-demo.com",
      featured: true
    },
    {
      id: 5,
      title: "Chat Application",
      description: "Real-time chat application with user authentication, message history, and file sharing capabilities.",
      image: "/project-placeholder.jpg", // Replace with actual project image
      tech: ["React", "Socket.io", "Node.js", "MongoDB"],
      github: "https://github.com/yourusername/chat-app",
      demo: "https://chat-app-demo.com",
      featured: false
    },
    {
      id: 6,
      title: "Data Visualization Tool",
      description: "Interactive data visualization dashboard for analyzing and presenting complex datasets.",
      image: "/project-placeholder.jpg", // Replace with actual project image
      tech: ["React", "D3.js", "Python", "Pandas"],
      github: "https://github.com/yourusername/data-viz",
      demo: "https://data-viz-demo.com",
      featured: false
    }
  ]

  return (
    <section id="projects" className="projects">
      <div className="container">
        <h2 className="section-title">My Projects</h2>
        
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className={`project-card ${project.featured ? 'featured' : ''}`}>
              <div className="project-image">
                {/* Replace with actual project images */}
                <div className="project-placeholder">
                  <span>📱</span>
                  <p>Project Screenshot</p>
                </div>
              </div>
              
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                
                <div className="project-tech">
                  {project.tech.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="project-links">
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link github"
                  >
                    <span>📂</span> GitHub
                  </a>
                  <a 
                    href={project.demo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link demo"
                  >
                    <span>🌐</span> Live Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects 