import './Footer.css'
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { MdEmail } from "react-icons/md"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/AdityaJadhav17',
      icon: <FaGithub />,
      label: 'GitHub Profile'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/aditya-jadhav-06484123a/',
      icon: <FaLinkedin />,
      label: 'LinkedIn Profile'
    },
    {
      name: 'Email',
      url: 'mailto:aditya.jadhav7910@gmail.com',
      icon: <MdEmail />,
      label: 'Send Email'
    }
    /*{
      name: 'Twitter',
      url: 'https://twitter.com/yourusername',
      icon: <FaTwitter />,
      label: 'Twitter Profile'
    }*/
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Aditya Jadhav</h3>
            <p>Junior Computer Science Student & Developer</p>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={link.label}
                >
                  <span className="social-icon">{link.icon}</span>
                  <span className="social-name">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#projects">Projects</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-info">
            <p>&copy; {currentYear} Aditya Jadhav. All rights reserved.</p>
            <p>Built with React</p>
          </div>
          
          <div className="footer-actions">
            <button 
              className="back-to-top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              ↑ Back to Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
