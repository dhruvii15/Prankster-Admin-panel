import React from 'react';
import { useNavigate } from 'react-router-dom';

// react-bootstrap
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket} from '@fortawesome/free-solid-svg-icons';


// ==============================|| NAV RIGHT ||============================== //

const NavRight = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };
  return (
    <div className='mx-5 my-2'>
      <Button  className="bg-transparent d-flex gap-3 align-items-center" onClick={handleLogout}>
       <div className='logout-icon'><FontAwesomeIcon icon={faArrowRightFromBracket}/></div>
        Logout
      </Button>
    </div>

  );
};

export default NavRight;
