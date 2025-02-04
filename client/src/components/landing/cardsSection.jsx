import React from 'react';
import Card from './card.jsx';

const CardsSection = () => {
    const cardData = [
        {
          title: 'Advanced Legal Analysis',
          description: 'Utilize AI to perform in-depth legal analysis and generate comprehensive summaries of legal documents and case laws.',
        },
        {
          title: 'Efficient Case Management',
          description: 'Streamline case management with AI-powered tools for organizing client information, tracking case progress, and managing legal documents.',
        },
        {
          title: 'Instant Legal Insights',
          description: 'Receive real-time legal insights and recommendations tailored to specific queries and legal scenarios through our advanced AI algorithms.',
        },
      ];

  return (
    <section id="cards" className="text-center">
      <div className="container">
        <h2>Our Features</h2>
        <div className="cards-container">
          {cardData.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardsSection;
