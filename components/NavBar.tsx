import Link from 'next/link';
import { useRouter } from 'next/router';
import classes from 'utils/classes';

import styles from 'styles/NavBar.module.scss';

const NavBar = () => {
  const { pathname } = useRouter();

  return (
    <div className={styles.nav}>
      <Link 
        href="/"
        className={classes(styles.navItem, pathname === '/' && styles.active)}
      >
        Projects
      </Link>
      <Link
        href='/resume'
        className={classes(styles.navItem, pathname === '/resume' && styles.active)}
      >
        Resume
      </Link>
    </div>
  );
}

export default NavBar;
