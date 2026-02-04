import './Projects.css'
import { FaGithub, FaYoutube } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

const Projects = () => {
  const projects = [
      {
      id: 'travel-agntcy',
      title: 'AI-Powered Travel Planning Platform',
      description:
        'Multi-Agent AI platform that generates personalized travel itineraries using autonomous agents, microservices, and real-time data integration.',
      image: '',
      tech: ['Python','React', 'TypeScript', 'FastAPI', 'LangGraph', 'Docker', 'NATS', 'ClickHouse', 'Grafana', 'AWS'],
       github: 'https://github.com/AdityaJadhav17/Travel-Agntcy',
      demo: 'https://youtu.be/T0EkJ9J_IQU', 
      featured: true
    },
    {
      id: 'sim2real',
      title: 'Synthetic-to-Real Object Detection',
      description:
        'Kaggle competition: object detection pipeline trained on synthetic cheerio box images to generalize to real-world photos. Final mAP score 0.9175',
      image: '/sim2real.png',
      tech: ['Python', 'PyTorch', 'YOLOv8', 'Albumentations'],
      github: 'https://github.com/AdityaJadhav17/Synthetic-to-Real-Object-Detection',
      demo: 'https://www.kaggle.com/competitions/synthetic-2-real-object-detection-challenge',
      featured: true
    },
    {
      id: 'portfolio',
      title: 'Portfolio Website',
      description:
        'A modern, responsive portfolio built with React and CSS. Smooth scrolling, dark mode, and a contact form.',
      image: '/portfolio.png',
      tech: ['React', 'JavaScript', 'CSS'],
      github: 'https://github.com/AdityaJadhav17/AdityaJadhav17.github.io',
      demo: null, 
      featured: false
    },
    {
      id: 'bird-classifier',
      title: 'Bird Classifier in a Forest',
      description:
        'CNN-based image classifier for bird species from forest imagery. Includes data cleaning, augmentation, and evaluation.',
      image: '/bird-classifier.png',
      tech: ['Python', 'PyTorch', 'OpenCV'],
      github: 'https://github.com/AdityaJadhav17/bird-classifier-forest',
      demo: null, 
      featured: false
    },
    {
      id: 'tictactoe-cpp',
      title: 'Tic Tac Toe (C++)',
      description:
        'CLI game with clean OOP design, board evaluation, and replay support. Includes a demo video.',
      image: '/tictactoe-cpp.png',
      tech: ['C++', 'STL', 'OOP'],
      github: 'https://github.com/AdityaJadhav17/CS1B-SU24/tree/main/assignments/a02-tic-tac-toe',
      demo: 'https://youtu.be/BMScGt6v5dc', 
      featured: false
    },
    {
      id: 'ibm-chat',
      title: 'AI Chat Assistant (IBM Cloud)',
      description:
        'Deployed a conversational AI using IBM Cloud Watson services. Intent design, context handling, and deployment. Demo only.',
      image: '/ibm-chat.png',
      tech: ['IBM Cloud', 'Watson Assistant', 'Node.js'],
      github: null, 
      demo: 'https://youtu.be/9sRefMjn5Es', 
      featured: false
    }
  ]

  return (
    <section id="projects" className="projects">
      <div className="container">
        <h2 className="section-title">My Projects</h2>

        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`project-card ${project.featured ? 'featured' : ''}`}
            >
              <div className="project-image">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={`${project.title} screenshot`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="project-placeholder">
                    <span>📱</span>
                    <p>Project Screenshot</p>
                  </div>
                )}
              </div>

              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>

                <div className="project-tech">
                  {project.tech.map((t) => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>

                <div className="project-links">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link github"
                    >
                      <FaGithub /> GitHub
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link demo"
                    >
                      {project.demo.includes("youtu") ? (
                        <FaYoutube />
                      ) : (
                        <FiExternalLink />
                      )}{" "}
                      Live Demo
                    </a>
                  )}
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
