import React from 'react';

const Testimonials = () => {
  const testimonialsData = [
    {
      quote: "LawGPT has completely transformed the way I conduct legal research. It's fast, efficient, and incredibly accurate.",
      name: "John Doe",
      position: "Senior Lawyer",
    },
    {
      quote: "The AI-powered insights provided by LawGPT are second to none. It has saved me countless hours.",
      name: "Jane Smith",
      position: "Legal Consultant",
    },
    {
      quote: "I highly recommend LawGPT to any legal professional. It’s a game changer for the industry.",
      name: "Robert Brown",
      position: "Attorney at Law",
    }
  ];

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="testimonials-container">
          {testimonialsData.map((testimonial, index) => (
            <div className="testimonial" key={index}>
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <h4 className="testimonial-name">{testimonial.name}</h4>
              <p className="testimonial-position">{testimonial.position}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
