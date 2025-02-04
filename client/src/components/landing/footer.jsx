import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
        <div className="footer-section about">
            <h2>About Law GPT</h2>
            <p>Law GPT enhances your legal research and case management by providing advanced AI-driven insights and analyses. Our platform simplifies complex legal information, helping professionals and individuals alike access crucial legal knowledge efficiently.</p>
          </div>

          <div className="footer-section links">
            <h2>Quick Links</h2>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* <div className="footer-section social">
            <h2>Follow Us</h2>
            <div className="social-links">
              <a href="#a"><i className="fa fa-facebook"></i></a>
              <a href="#a"><i className="fa fa-twitter"></i></a>
              <a href="#a"><i className="fa fa-instagram"></i></a>
              <a href="#a"><i className="fa fa-linkedin"></i></a>
            </div>
          </div> */}
        </div>

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Law GPT | All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
