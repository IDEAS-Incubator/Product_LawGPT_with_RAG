import React from 'react';

const Features = () => {
  return (
    <section id="feature" className="text-center">
      <div className="container">
        <h2>Features</h2>
        <p>Discover the powerful features that make Law GPT the ultimate legal assistant.</p>
        <div className="row">
          <div className="col-md-4">
            <i className="fa fa-gavel"></i>
            <h3>Comprehensive Legal Analysis</h3>
            <p>Access detailed legal analyses and summaries based on vast datasets and case law.</p>
          </div>
          <div className="col-md-4">
            <i className="fa fa-users"></i>
            <h3>Client & Case Management</h3>
            <p>Utilize AI-driven tools to efficiently manage client interactions and case documentation.</p>
          </div>
          <div className="col-md-4">
            <i className="fa fa-comments"></i>
            <h3>AI-Powered Legal Insights</h3>
            <p>Receive instant, actionable legal insights and recommendations from our advanced AI system.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
