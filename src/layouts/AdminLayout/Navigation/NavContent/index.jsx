import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { ConfigContext } from '../../../../contexts/ConfigContext';
import * as actionType from '../../../../store/actions';
import NavigationDropdowns from './NavigationDropdowns';

const NavContent = () => {
  const [scrollWidth, setScrollWidth] = useState(0);
  const [prevDisable, setPrevDisable] = useState(true);
  const [nextDisable, setNextDisable] = useState(false);

  const configContext = useContext(ConfigContext);
  const { dispatch } = configContext;
  const { layout, rtlLayout } = configContext.state;

  const scrollPrevHandler = () => {
    const wrapperWidth = document.getElementById('sidenav-wrapper').clientWidth;

    let scrollWidthPrev = scrollWidth - wrapperWidth;
    if (scrollWidthPrev < 0) {
      setScrollWidth(0);
      setPrevDisable(true);
      setNextDisable(false);
    } else {
      setScrollWidth(scrollWidthPrev);
      setPrevDisable(false);
    }
  };

  const scrollNextHandler = () => {
    const wrapperWidth = document.getElementById('sidenav-wrapper').clientWidth;
    const contentWidth = document.getElementById('sidenav-horizontal').clientWidth;

    let scrollWidthNext = scrollWidth + (wrapperWidth - 80);
    if (scrollWidthNext > contentWidth - wrapperWidth) {
      scrollWidthNext = contentWidth - wrapperWidth + 80;
      setScrollWidth(scrollWidthNext);
      setPrevDisable(false);
      setNextDisable(true);
    } else {
      setScrollWidth(scrollWidthNext);
      setPrevDisable(false);
    }
  };

  let scrollStyle = {
    marginLeft: '-' + scrollWidth + 'px'
  };

  if (layout === 'horizontal' && rtlLayout) {
    scrollStyle = {
      marginRight: '-' + scrollWidth + 'px'
    };
  }

  // Render different layouts based on the layout prop
  const renderContent = () => {
    if (layout === 'horizontal') {
      let prevClass = ['sidenav-horizontal-prev'];
      if (prevDisable) {
        prevClass = [...prevClass, 'disabled'];
      }
      let nextClass = ['sidenav-horizontal-next'];
      if (nextDisable) {
        nextClass = [...nextClass, 'disabled'];
      }

      return (
        <div className="navbar-content sidenav-horizontal" id="layout-sidenav">
          <Link to="#" className={prevClass.join(' ')} onClick={scrollPrevHandler}>
            <span />
          </Link>
          <div id="sidenav-wrapper" className="sidenav-horizontal-wrapper">
            <ListGroup
              variant="flush"
              bsPrefix=" "
              as="ul"
              id="sidenav-horizontal"
              className="nav pcoded-inner-navbar sidenav-inner"
              onMouseLeave={() => dispatch({ type: actionType.NAV_CONTENT_LEAVE })}
              style={scrollStyle}
            >
              <NavigationDropdowns />
            </ListGroup>
          </div>
          <Link to="#" className={nextClass.join(' ')} onClick={scrollNextHandler}>
            <span />
          </Link>
        </div>
      );
    } else {
      // Vertical layout
      return (
        <div className="navbar-content next-scroll">
          <PerfectScrollbar className="pb-4">
            <ListGroup 
              variant="flush" 
              as="ul" 
              bsPrefix=" " 
              className="nav pcoded-inner-navbar" 
              id="nav-ps-next"
            >
              <NavigationDropdowns />
            </ListGroup>
          </PerfectScrollbar>
        </div>
      );
    }
  };

  return <React.Fragment>{renderContent()}</React.Fragment>;
};

export default NavContent;