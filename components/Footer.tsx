import { SocialIcon } from 'react-social-icons';
import { isMobile } from 'react-device-detect';
import classes from 'utils/classes';

import styles from 'styles/Footer.module.scss';

const renderSocials = (socials: string[]) => (
  <div className={styles.footerSocials}>
    {socials.map((link) => (
      <SocialIcon
        key={link}
        url={link} 
        bgColor='black'
        fgColor='white'
        className="icon" />
    ))}
  </div>
);

const renderSource = () => (
  <div className={styles.footerSource}>
    <a href='https://github.com/jaismith/jaismith.dev'>
      Source Code
    </a>
  </div>
);

const renderCredits = () => (
  <div className={styles.footerCredits}>
    <span>Designed and Developed by </span>Jai K. Smith (2020)
  </div>
);

type FooterProps = {
  socialMedia: string[],
}

const Footer = ({
  socialMedia,
}: FooterProps) => (
  <div className={classes(styles.footer, isMobile && styles.mobile)}>
    {isMobile
      ? (
        <>
          <div className={styles.footerRow}>
            {renderCredits()}
            {renderSource()}
          </div>
          <div className={styles.footerRow}>
            {renderSocials(socialMedia)}
          </div>
        </>
      ) : (
        <>
          {renderCredits()}
          {renderSocials(socialMedia)}
          {renderSource()}
        </>
      )}
  </div>
);

export default Footer;
