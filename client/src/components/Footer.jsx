import facebook from '../assets/facebook.png'
import insta from '../assets/instagram.png'
import linkedin from '../assets/linkedin.png'
import whatsapp from '../assets/whatsapp.png'
import email from '../assets/email.png'


export default function Footer() {
  return (
    <footer>


      <div className="footer-main">
        <div className="container footer-content">
          <div className="footer-section">
            <h3>About YSJ</h3>
            <p>YSJ Junior is a student research program supporting high-school researchers through mentorship and publication.</p>
          </div>

          <div className="footer-section">
            <h3>Contact</h3>
            <div className="social-links">
              <a href="https://www.facebook.com/YouthScienceJournall" aria-label="facebook">Facebook</a>
              <a href="https://www.instagram.com/ysciencejournal/" aria-label="instagram">Instagram</a>
              <a href="https://www.linkedin.com/company/ysj/" aria-label="linkedin">LinkedIn</a>
              <a href="mailto:ysciencejournal@gmail.com" aria-label="mail">Mail us</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Location</h3>
            <p>STEM High School for Boys - 6th of October</p>
          </div>
        </div>

        <div className="footer-bottom container text-center">
          © 2026 YSJ — All rights reserved
        </div>
      </div>
    </footer>
  );
}
