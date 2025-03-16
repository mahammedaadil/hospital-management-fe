import React from "react";
import { Link } from "react-router-dom";
import { FaLocationArrow, FaPhone, FaHome, FaUserMd, FaInfoCircle } from "react-icons/fa"; // Import icons for Quick Links
import { MdEmail } from "react-icons/md";
import { FaFacebook, FaInstagram, FaWhatsapp, FaTwitter } from "react-icons/fa"; // Import social media icons

const Footer = () => {
  const hours = [
    { id: 1, day: "Mon", time: "10:00 AM - 11:00 PM" },
    { id: 2, day: "Tue", time: "10:00 AM - 11:00 PM" },
    { id: 3, day: "Wed", time: "10:00 AM - 11:00 PM" },
    { id: 4, day: "Thu", time: "10:00 AM - 11:00 PM" },
    { id: 5, day: "Fri", time: "10:00 AM - 11:00 PM" },
    { id: 6, day: "Sat", time: "10:00 AM - 11:00 PM" },
  ];

  return (
    <footer className="footer">
      <hr className="footer-divider" />
      <div className="footer-content">
        {/* Logo Section */}
        <div className="footer-logo">
          <img src="/logo.png" alt="logo" className="footer-logo-img" />
          {/* Social Media Icons */}
          <div className="footer-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="social-icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="social-icon" />
            </a>
            <a href="https://wa.me/9106624120" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="social-icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="social-icon" />
            </a>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/" className="footer-link">
                <FaHome className="footer-link-icon" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/doctors" className="footer-link">
                <FaUserMd className="footer-link-icon" />
                <span>Doctors</span>
              </Link>
            </li>
            <li>
              <Link to="/about" className="footer-link">
                <FaInfoCircle className="footer-link-icon" />
                <span>About</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Hours Section */}
        <div className="footer-section">
          <h4 className="footer-heading">Hours</h4>
          <ul className="footer-hours">
            {hours.map((element) => (
              <li key={element.id} className="footer-hour-item">
                <span className="footer-day">{element.day}</span>
                <span className="footer-time">{element.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section">
          <h4 className="footer-heading">Contact</h4>
          <div className="footer-contact-info">
            <div className="footer-contact-item">
              <FaPhone className="footer-icon" />
              <span>9106624120</span>
            </div>
            <div className="footer-contact-item">
              <MdEmail className="footer-icon" />
              <span>aadicare30@gmail.com</span>
            </div>
            <div className="footer-contact-item">
              <FaLocationArrow className="footer-icon" />
              <span>Gujarat, India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;