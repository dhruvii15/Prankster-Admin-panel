import React from 'react';

// react-bootstrap
import { Card} from 'react-bootstrap';

// project import
import Breadcrumb from '../../layouts/AdminLayout/Breadcrumb';
import AuthLogin from './JWTLogin';

// assets
import logoDark from '../../assets/images/logo.png';

// ==============================|| SIGN IN 1 ||============================== //

const Signin1 = () => {
  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless text-center">
            <Card.Body>
              <img src={logoDark} alt="" className="img-fluid mb-4" />
              <AuthLogin />
            
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;
