import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import instance from '../../config/instance';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Form data:', formData); // Debug form data

    try {
      const response = await instance.post('/api/user/contact', formData);
      console.log('Response:', response); // Debug response

      if (response.status === 200) {
        toast.success('Thank you! Your message has been sent.');
        setFormData({ name: '', email: '', message: '' }); // Clear the form
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting form:', error); // Debug error
      toast.error('There was an error sending your message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="text-center">
      <div className="container">
        <h2>Contact Us</h2>
        <p>Have questions? Get in touch with us.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="message"
              className="form-control"
              rows="5"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
        <ToastContainer />
      </div>
    </section>
  );
};

export default Contact;
