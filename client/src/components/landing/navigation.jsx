import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Navigation = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <Link className="navbar-brand" to="/home"> {/* Use Link instead of anchor tag */}
        <img src="img.png" alt="LawGPT Logo" className="logo" /> {/* Add logo */}
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <a className="nav-link" href="#about">About</a> {/* External link can remain as <a> */}
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#feature">Features</a> {/* External link can remain as <a> */}
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#testimonials">Testimonials</a> {/* External link can remain as <a> */}
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#contact">Contact</a> {/* External link can remain as <a> */}
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/login">Login</Link> {/* Use Link for internal navigation */}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
