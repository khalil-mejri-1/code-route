import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import Navbar from '../comp/navbar';

export default function Contact() {
  return (
    <>
        <Navbar/>
    <div className="contact-container">
      <div className="contact-content-wrapper">
        {/* Section de gauche: Coordonnées et Horaires */}
        <section className="contact-info-section-left">
          <h2 className="section-title">Nos Coordonnées</h2>
          <div className="info-item">
            <FaMapMarkerAlt className="icon" />
            <div>
              <h3>Adresse</h3>
              <p>Nassen cité Ibassma, ben arous, Tunisie</p>
            </div>
          </div>
          <div className="info-item">
            <FaPhone className="icon" />
            <div>
              <h3>Téléphone</h3>
              <p>+216 25 172 626</p>
            </div>
          </div>
          <div className="info-item">
            <FaEnvelope className="icon" />
            <div>
              <h3>Email</h3>
              <p>contact@Hellanails.com</p>
            </div>
          </div>

          <h2 className="section-title social-title">Suivez-nous</h2>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook className="social-icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter className="social-icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="social-icon" />
            </a>
          </div>

          <h2 className="section-title hours-title">Horaires d'ouverture</h2>
          <ul className="opening-hours">
            <li>Lundi - Vendredi <span>9h00 - 19h00</span></li>
            <li>Samedi <span>10h00 - 18h00</span></li>
            <li>Dimanche <span>Fermé</span></li>
          </ul>
        </section>

        {/* Section de droite: Formulaire de contact */}
        <section className="contact-form-section-right">
          <h2 className="section-title">Envoyez-nous un message</h2>
          <form className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Téléphone</label>
                <input type="tel" id="phone" name="phone" />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Sujet *</label>
                <input type="text" id="subject" name="subject" required />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="message">Message *</label>
              <textarea id="message" name="message" rows="7" required></textarea>
            </div>
            
            <div className="privacy-checkbox">
              <input type="checkbox" id="privacy" name="privacy" required />
              <label htmlFor="privacy">J'accepte que mes données soient traitées conformément à la <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>.</label>
            </div>
            
            <button type="submit" className="submit-btn">
              Envoyer le message
            </button>
          </form>
        </section>
      </div>
    </div>
    </>

  );
}