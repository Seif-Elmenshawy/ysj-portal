import facebook from '../assets/facebook.png'
import insta from '../assets/instagram.png'
import linkedin from '../assets/linkedin.png'
import whatsapp from '../assets/whatsapp.png'
import email from '../assets/email.png'


export default function Footer() {
  return (
    <>
      <section className="contact-band">
        <div className="container text-center">
          <h3>If you encounter any problem please contact us</h3>
          <div className="dots">
            <span><a href=""><img src={facebook} alt="" /></a></span><span><a href=""><img src={insta} alt="" /></a></span><span><a href=""><img src={linkedin} alt="" /></a></span><span><a href=""><img src={whatsapp} alt="" /></a></span><span><a href="mailto:ysciencejournal@gmail.com"><img src={email} alt="" /></a></span>
          </div>
        </div>
      </section>
    </>
  );
}
