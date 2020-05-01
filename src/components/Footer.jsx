import React from 'react';
import PropTypes from 'prop-types';
import { SocialIcon } from 'react-social-icons';
import './Footer.scss';

const Footer = (props) => (
  <div className="footer">
    <div className="footer-credits">
      Designed and Developed by Jai K. Smith (2020)
    </div>
    <div className="footer-socials">
      {props.socialMedia.map((link) => (
        <SocialIcon 
          url={link} 
          bgColor='black'
          fgColor='white'
          style={{ height: 40, width: 40 }}
          className="icon" />
      ))}
    </div>
    <div className="footer-source">
      <a href='https://github.com/jaismith/jaismith.dev'>
        Source Code
      </a>
    </div>
  </div>
);

Footer.propTypes = {
  socialMedia: PropTypes.array,
};

Footer.defaultProps = {
  socialMedia: []
};

export default Footer;
