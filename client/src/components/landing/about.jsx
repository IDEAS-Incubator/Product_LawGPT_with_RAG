import React from 'react';

const About = () => {
  return (
    <section id="about" className="bg-light text-center">
      <div className="container">
        <h2>About Law GPT</h2>
        <p>Learn more about the mission and expertise behind the Law GPT project.</p>
        <div className="row">
          <div className="col-md-6">
            <h3>Our Mission</h3>
            <p>The Law GPT project is dedicated to providing advanced legal insights and assistance through cutting-edge AI technology. Our mission is to enhance the accessibility of legal information and streamline legal research processes for both professionals and individuals seeking reliable legal guidance.</p>
          </div>
          <div className="col-md-6">
            <h3>Our Team</h3>
            <p>The Law GPT project is driven by a team of legal experts, AI developers, and data scientists. We are committed to leveraging artificial intelligence to support legal professionals and improve the efficiency of legal research and analysis, ultimately making legal services more accessible and efficient for everyone.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
