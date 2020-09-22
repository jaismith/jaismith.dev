import React from 'react';
import PropTypes from 'prop-types';
import { SocialIcon } from 'react-social-icons';
import { isMobile } from 'react-device-detect';
import './stylesheets/Footer.scss';

const renderSocials = (socials) => (
  <div className="footer-socials">
    {socials.map((link) => (
      <SocialIcon
        key={link}
        url={link} 
        bgColor='black'
        fgColor='white'
        style={{ height: 40, width: 40 }}
        className="icon" />
    ))}
  </div>
);

const renderSource = () => (
  <div className="footer-source">
    <a href='https://github.com/jaismith/jaismith.dev'>
      Source Code
    </a>
  </div>
);

const renderCredits = () => (
  <div className="footer-credits">
    <span>Designed and Developed by </span>Jai K. Smith (2020)
  </div>
);

const Footer = (props) => (
  <div className={`footer ${isMobile ? 'mobile' : ''}`}>
    {isMobile
      ? (
        <>
          <div className="footer-row">
            {renderCredits()}
            {renderSource()}
          </div>
          <div className="footer-row">
            {renderSocials(props.socialMedia)}
          </div>
        </>
      ) : (
        <>
          {renderCredits()}
          {renderSocials(props.socialMedia)}
          {renderSource()}
        </>
      )}
  </div>
);

Footer.propTypes = {
  socialMedia: PropTypes.array,
};

Footer.defaultProps = {
  socialMedia: []
};

export default Footer;
