import React from 'react';
import Navigation from '../components/landing/navigation';
import Hero from '../components/landing/hero';
import Features from '../components/landing/features';
import About from '../components/landing/about';
import CardsSection from '../components/landing/cardsSection'; 
import Contact from '../components/landing/contact';
import Testimonials from '../components/landing/testimonials';
import Footer from '../components/landing/footer';
import '../App.css';

const Home = () => {
  return (
    <div>
      <Navigation />
      <Hero/>
      <About />

      <CardsSection /> 
      <Testimonials/>
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
