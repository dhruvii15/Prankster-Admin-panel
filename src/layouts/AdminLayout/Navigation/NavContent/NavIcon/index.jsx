import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

// ==============================|| NAV ICON ||============================== //

const NavIcon = ({ items }) => {
  let navIcons = false;
  if (items.icon) {
    navIcons = (
      <span className="pcoded-micon">
        <FontAwesomeIcon icon={items.icon} />
      </span>
    );
  }

  return <React.Fragment>{navIcons}</React.Fragment>;
};

export default NavIcon;
