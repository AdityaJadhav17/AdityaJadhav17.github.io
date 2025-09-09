import { useState } from 'react'
import './Contact.css'
import { MdEmail, MdLocationOn } from 'react-icons/md'
import { FaBriefcase } from 'react-icons/fa'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false) // CHANGED: error state

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowError(false)

    try {
      // CHANGED: send form data to Formspree
      const res = await fetch("https://formspree.io/f/xblawgak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error("Form submission failed")

      setShowSuccess(true)
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setShowSuccess(false), 5000)

    } catch (err) {
      console.error(err)
      setShowError(true) // CHANGED: show error
    }

    setIsSubmitting(false)
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        
        <div className="contact-content">
          <div className="contact-info">
            <h3>Let's Connect</h3>
            <p>
              I'm always interested in new opportunities, collaborations, or just 
              having a conversation about technology and development. Feel free to 
              reach out!
            </p>
            
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon"><MdEmail /></span>
                <div>
                  <h4>Email</h4>
                  <p>
                    <a href="mailto:aditya.jadhav7910@gmail.com">
                      aditya.jadhav7910@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon"><MdLocationOn /></span>
                <div>
                  <h4>Location</h4>
                  <p>San Diego, CA</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon"><FaBriefcase /></span>
                <div>
                  <h4>Available For</h4>
                  <p>Internships, Projects, Collaborations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Your message..."
                  rows="5"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {showSuccess && (
              <div className="success-message">
                <span>✅</span>
                <p>Thank you for your message! I'll get back to you soon.</p>
              </div>
            )}

            {showError && ( // CHANGED: error feedback
              <div className="error-message">
                <span>❌</span>
                <p>Oops! Something went wrong. Please try again later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
