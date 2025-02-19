import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { ListGroup, Collapse } from 'react-bootstrap';
import { faA, faBell,faChartSimple, faChevronDown, faChevronRight, faCircle, faHome, faLayerGroup, faLink, faPhotoFilm, faRectangleAd, faVideo, } from '@fortawesome/free-solid-svg-icons';
import { faFileAudio, faImage } from '@fortawesome/free-regular-svg-icons';
import { faAndroid, faAppStoreIos, faGoogle, faJs, faMeta } from '@fortawesome/free-brands-svg-icons';
const NavigationDropdowns = () => {
    const [openDropdowns, setOpenDropdowns] = useState({
        content: false,
        analytics: false
    });
    const [selectedItem, setSelectedItem] = useState(null); // State for tracking selected item

    const toggleDropdown = (dropdown) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item); // Set the selected item
    };

    const isSelected = (item) => {
        return selectedItem === item ? 'bg-bg text-white' : ''; // Apply red background and white text when selected
    };


    return (
        <div className="navigation-container">
            <ListGroup variant="flush">
                {/* Dashboard Item */}
                <ListGroup.Item className={`p-0 py-2 ${isSelected('dashboard')}`}>
                    <Link to="/dashboard" className="nav-link" onClick={() => handleSelectItem('dashboard')}>
                        <FontAwesomeIcon icon={faHome} className="me-2" />
                        Dashboard
                    </Link>
                </ListGroup.Item>

                {/* Content Management Dropdown */}
                <ListGroup.Item className="nav-item p-0 py-2">
                    <button
                        className="nav-link w-100 p-2 d-flex justify-content-between align-items-center border-0 bg-transparent"
                        onClick={() => toggleDropdown('content')}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="d-flex align-items-center ps-1">
                            <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                            Data Upload
                        </div>
                        <FontAwesomeIcon icon={openDropdowns.content ? faChevronDown : faChevronRight} style={{ fontSize: "12px" }} className='pe-2'/>
                    </button>

                    <Collapse in={openDropdowns.content}>
                        <ListGroup variant="flush">
                            <div className="p-2 pt-4" style={{ fontSize: "13px", color: "#AEACAD" }}>
                                Cover Image
                            </div>
                            <ListGroup.Item className={`${isSelected('cover')} border-0 fw-bold d-flex gap-2 align-items-center`}>
                                
                                <Link to="/cover" className="nav-link" onClick={() => handleSelectItem('cover')}>
                                    <FontAwesomeIcon icon={faImage} className="me-2" />
                                    Cover Image
                                </Link>
                            </ListGroup.Item>
                            <div className="p-2" style={{ fontSize: "13px", color: "#AEACAD" }}>
                                Prank Category
                            </div>
                            <ListGroup.Item className={`nav-link ${isSelected('category')} border-0 fw-bold d-flex gap-2 align-items-center`}>
                                
                                <Link to="/category" className="nav-link" onClick={() => handleSelectItem('category')}>

                                    <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                                    Prank Category
                                </Link>
                            </ListGroup.Item>
                            <ListGroup.Item className='p-0 border-0'>
                                <div className="p-2" style={{ fontSize: "13px", color: "#AEACAD" }}>
                                    Prank Type
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className={`border-0 ${isSelected('audio')} border-0 fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/type/audio" className="nav-link" onClick={() => handleSelectItem('audio')}>
                                        <FontAwesomeIcon icon={faFileAudio} className="me-2" />

                                            Audio Prank
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('video')} border-0 fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/type/video" className="nav-link" onClick={() => handleSelectItem('video')}>
                                        <FontAwesomeIcon icon={faVideo} className="me-2" />

                                            Video Prank
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('image')} border-0 fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/type/image" className="nav-link" onClick={() => handleSelectItem('image')}>
                                        <FontAwesomeIcon icon={faPhotoFilm} className="me-2" />

                                            Image Prank
                                        </Link>
                                    </ListGroup.Item>
                                </ListGroup>
                            </ListGroup.Item>

                            <ListGroup.Item className='p-0 border-0'>
                                <div className="p-2" style={{ fontSize: "13px", color: "#AEACAD" }}>
                                    User-Uploads
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className={`border-0 ${isSelected('usercover')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/user/cover" className="nav-link" onClick={() => handleSelectItem('usercover')}>
                                        <FontAwesomeIcon icon={faImage} className="me-2" />

                                            Cover Image
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('useraudio')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/user/audio" className="nav-link" onClick={() => handleSelectItem('useraudio')}>
                                        <FontAwesomeIcon icon={faFileAudio} className="me-2" />

                                            Audio Prank
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('uservideo')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/user/video" className="nav-link" onClick={() => handleSelectItem('uservideo')}>
                                        <FontAwesomeIcon icon={faVideo} className="me-2" />

                                            Video Prank
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('userprank')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/user/image" className="nav-link" onClick={() => handleSelectItem('userprank')}>
                                        <FontAwesomeIcon icon={faPhotoFilm} className="me-2" />

                                            Image Prank
                                        </Link>
                                    </ListGroup.Item>
                                </ListGroup>
                            </ListGroup.Item>
                            <ListGroup.Item className='p-0'>
                                <div className="p-2" style={{ fontSize: "13px", color: "#AEACAD" }}>
                                    More
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className={`border-0 ${isSelected('auto')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/auto-notification" className="nav-link" onClick={() => handleSelectItem('auto')}>
                                        <FontAwesomeIcon icon={faBell} className="me-2" />

                                            Auto Notification
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('push')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/push-notification" className="nav-link" onClick={() => handleSelectItem('push')}>
                                        <FontAwesomeIcon icon={faBell} className="me-2" />

                                            Push Notification
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('ads')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/ads" className="nav-link" onClick={() => handleSelectItem('ads')}>
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
                <ListGroup.Item className="nav-item p-0 py-2">
                    <button
                        className="nav-link"
                        onClick={() => toggleDropdown('analytics')}
                        style={{ cursor: "pointer", background: "none", border: "none", width: "100%" }}
                    >
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className='d-flex align-items-center'>
                                <FontAwesomeIcon icon={faChartSimple} className="me-2" />
                                Analytics
                            </div>
                            <FontAwesomeIcon icon={openDropdowns.analytics ? faChevronDown : faChevronRight} style={{ fontSize: "12px" }} />
                        </div>
                    </button>

                    <Collapse in={openDropdowns.analytics}>
                        <ListGroup variant="flush">
                            {/* Before App Analytics */}
                            <ListGroup.Item className='p-0 border-0'>
                                <div className="p-2 pt-4" style={{ fontSize: "13px", color: "#AEACAD" }}>
                                    Before App Analytics
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className={`border-0 ${isSelected('deeplink')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/deeplink" className="nav-link" onClick={() => handleSelectItem('deeplink')}>
                                        <FontAwesomeIcon icon={faLink} className="me-2" />

                                            DeepLink
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('analytics')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/analytics" className="nav-link" onClick={() => handleSelectItem('analytics')}>
                                        <FontAwesomeIcon icon={faChartSimple} className="me-2" />

                                            DeepLink Analytics
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('meta')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/meta" className="nav-link" onClick={() => handleSelectItem('meta')}>
                                        <FontAwesomeIcon icon={faMeta} className="me-2" />

                                            Meta
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('google')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/google" className="nav-link" onClick={() => handleSelectItem('google')}>
                                        <FontAwesomeIcon icon={faGoogle} className="me-2" />

                                            Google
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('appsflyer')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/appsflyer" className="nav-link" onClick={() => handleSelectItem('appsflyer')}>
                                        <FontAwesomeIcon icon={faA} className="me-2" />

                                            Appsflyer
                                        </Link>
                                    </ListGroup.Item>
                                </ListGroup>
                            </ListGroup.Item>
                            {/* After App Analytics */}
                            <ListGroup.Item className='p-0'>
                                <div className="p-2" style={{ fontSize: "13px", color: "#AEACAD" }}>
                                    After App Analytics
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className={`border-0 ${isSelected('Android')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/android" className="nav-link" onClick={() => handleSelectItem('Android')}>
                                        <FontAwesomeIcon icon={faAndroid} className="me-2" />

                                            Android
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('iOS')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/ios" className="nav-link" onClick={() => handleSelectItem('iOS')}>
                                        <FontAwesomeIcon icon={faAppStoreIos} className="me-2" />

                                            iOS
                                        </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item className={`border-0 ${isSelected('Web')} fw-bold d-flex gap-2 align-items-center`}>
                                        
                                        <Link to="/web" className="nav-link" onClick={() => handleSelectItem('Web')}>
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
