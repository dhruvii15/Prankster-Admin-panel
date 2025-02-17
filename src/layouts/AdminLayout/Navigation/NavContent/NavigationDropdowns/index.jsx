import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { ListGroup, Collapse } from 'react-bootstrap';
import { faA, faBell, faChartSimple, faChevronDown, faChevronUp, faHome, faLayerGroup, faLink, faPhotoFilm, faRectangleAd, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faFileAudio, faImage } from '@fortawesome/free-regular-svg-icons';
import { faAndroid, faAppStoreIos, faGoogle, faJs, faMeta } from '@fortawesome/free-brands-svg-icons';

const NavigationDropdowns = () => {
    const [openDropdowns, setOpenDropdowns] = useState({
        content: false,
        analytics: false
    });

    const toggleDropdown = (dropdown) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

    return (
        <div className="navigation-container">
            <ListGroup variant="flush">
                {/* Dashboard Item */}
                <ListGroup.Item className="nav-item p-0 py-3">
                    <Link to="/dashboard" className="nav-link fw-bold">
                        <FontAwesomeIcon icon={faHome} className="me-2" />
                        Dashboard
                    </Link>
                </ListGroup.Item>

                {/* Content Management Dropdown */}
                <ListGroup.Item className="nav-item p-0 py-3">
                    <div
                        className="nav-link"
                        onClick={() => toggleDropdown('content')}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' , cursor:"pointer" }}
                    >
                        <div className='fw-bold'>
                            <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                            Content Management
                        </div>
                        <FontAwesomeIcon icon={openDropdowns.content ? faChevronUp : faChevronDown} />
                    </div>
                    <Collapse in={openDropdowns.content}>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <Link to="/cover" className="nav-link">
                                    <FontAwesomeIcon icon={faImage} className="me-2" />
                                    Cover Image
                                </Link>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Link to="/category" className="nav-link">
                                    <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                                    Prank Category
                                </Link>
                            </ListGroup.Item>
                            <ListGroup.Item className='p-0'>
                                <div className="p-2 fw-bold">
                                    Prank Type
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/type/audio" className="nav-link">
                                            <FontAwesomeIcon icon={faFileAudio} className="me-2" />
                                            Audio Prank
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/type/video" className="nav-link">
                                            <FontAwesomeIcon icon={faVideo} className="me-2" />
                                            Video Prank
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/type/image" className="nav-link">
                                            <FontAwesomeIcon icon={faPhotoFilm} className="me-2" />
                                            Image Prank
                                        </Link>
                                    </ListGroup.Item>
                                </ListGroup>
                            </ListGroup.Item>
                            <ListGroup.Item className='p-0'>
                                <div className="p-2 fw-bold">
                                    User-Uploads
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/user/cover" className="nav-link">
                                            <FontAwesomeIcon icon={faImage} className="me-2" />
                                            Cover Image
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/user/audio" className="nav-link">
                                            <FontAwesomeIcon icon={faFileAudio} className="me-2" />
                                            Audio Prank
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/user/video" className="nav-link">
                                            <FontAwesomeIcon icon={faVideo} className="me-2" />
                                            Video Prank
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/user/image" className="nav-link">
                                            <FontAwesomeIcon icon={faPhotoFilm} className="me-2" />
                                            Image Prank
                                        </Link>
                                    </ListGroup.Item>
                                </ListGroup>
                            </ListGroup.Item><ListGroup.Item className='p-0'>
                                <div className="p-2 fw-bold">
                                    More
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/auto-notification" className="nav-link">
                                            <FontAwesomeIcon icon={faBell} className="me-2" />
                                            Auto Notification
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/push-notification" className="nav-link">
                                            <FontAwesomeIcon icon={faBell} className="me-2" />
                                            Push Notification
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className='border-0'>
                                        <Link to="/ads" className="nav-link">
                                            <FontAwesomeIcon icon={faRectangleAd} className="me-2" />
                                            Ads
                                        </Link>
                                    </ListGroup.Item>
                                </ListGroup>
                            </ListGroup.Item>
                        </ListGroup>
                    </Collapse>
                </ListGroup.Item>

                {/* Analytics Dropdown */}
                <ListGroup.Item className="nav-item p-0 py-3">
                    <div
                        className="nav-link"
                        onClick={() => toggleDropdown('analytics')}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' , cursor:"pointer" }}
                    >
                        <div  className='fw-bold'>
                            <FontAwesomeIcon icon={faChartSimple} className="me-2" />
                            Analytics
                        </div>
                        <FontAwesomeIcon icon={openDropdowns.analytics ? faChevronUp : faChevronDown} />
                    </div>
                    <Collapse in={openDropdowns.analytics}>
                        <ListGroup variant="flush">
                            {/* Before App Analytics */}
                            <ListGroup.Item className='p-0'>
                                <div className="p-2 fw-bold">
                                    Before App Analytics
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <Link to="/deeplink" className="nav-link">
                                            <FontAwesomeIcon icon={faLink} className="me-2" />
                                            DeepLink
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Link to="/analytics" className="nav-link">
                                            <FontAwesomeIcon icon={faChartSimple} className="me-2" />
                                            DeepLink Analytics
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Link to="/meta" className="nav-link">
                                            <FontAwesomeIcon icon={faMeta} className="me-2" />
                                            Meta
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Link to="/google" className="nav-link">
                                            <FontAwesomeIcon icon={faGoogle} className="me-2" />
                                            Google
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Link to="/appsflyer" className="nav-link">
                                            <FontAwesomeIcon icon={faA} className="me-2" />
                                            Appsflyer
                                        </Link>
                                    </ListGroup.Item>
                                </ListGroup>
                            </ListGroup.Item>
                            {/* After App Analytics */}
                            <ListGroup.Item className='p-0'>
                                <div className="p-2 fw-bold">
                                    After App Analytics
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <Link to="/android" className="nav-link">
                                            <FontAwesomeIcon icon={faAndroid} className="me-2" />
                                            Android
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Link to="/ios" className="nav-link">
                                            <FontAwesomeIcon icon={faAppStoreIos} className="me-2" />
                                            iOS
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Link to="/web" className="nav-link">
                                            <FontAwesomeIcon icon={faJs} className="me-2" />
                                            Web
                                        </Link>
                                    </ListGroup.Item>
                                </ListGroup>
                            </ListGroup.Item>
                        </ListGroup>
                    </Collapse>
                </ListGroup.Item>
            </ListGroup>
        </div>
    );
};

export default NavigationDropdowns;
