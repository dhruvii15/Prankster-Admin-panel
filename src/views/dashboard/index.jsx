import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio, faPhotoFilm, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import axios from 'axios';
import { Link } from 'react-router-dom';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
);

const DashAnalytics = () => {
  // Language mapping
  // const languageMap = {
  //   1: 'Hindi',
  //   2: 'English',
  //   3: 'Marathi',
  //   4: 'Gujarati',
  //   5: 'Tamil',
  //   6: 'Punjabi'
  // };


  const [data, setData] = useState({
    users: [],
    cover: [],
    audio: [],
    video: [],
    gallery: [],
    userAudio: [],
    userVideo: [],
    userGallery: [],
    userCover: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cover, audio, video, gallery, userAudio, userVideo, userGallery, userCover] = await Promise.all([
        axios.post('https://pslink.world/api/cover/read'),
        axios.post('https://pslink.world/api/audio/read'),
        axios.post('https://pslink.world/api/video/read'),
        axios.post('https://pslink.world/api/gallery/read'),
        axios.post('https://pslink.world/api/users/read', { TypeId: "1" }),
        axios.post('https://pslink.world/api/users/read', { TypeId: "2" }),
        axios.post('https://pslink.world/api/users/read', { TypeId: "3" }),
        axios.post('https://pslink.world/api/users/read', { TypeId: "4" })
      ]);

      setData({
        cover: cover.data.data,
        audio: audio.data.data,
        video: video.data.data,
        gallery: gallery.data.data,
        userAudio: userAudio.data.data,
        userVideo: userVideo.data.data,
        userGallery: userGallery.data.data,
        userCover: userCover.data.data
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  // Filtering trending items
  // const trendingCover = data.cover.filter(item => item.trending === true).length;
  // const trendingAudio = data.audio.filter(item => item.trending === true).length;
  // const trendingVideo = data.video.filter(item => item.trending === true).length;
  // const trendingGallery = data.gallery.filter(item => item.trending === true).length;


  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: "hidden"
      }}
    >
      <div className="dots-loader">
        <span></span><span></span><span></span>
      </div>
    </div>
  );
  // Card data for displaying count of items in each category
  const cardData = [
    { title: 'Cover-Image', icon: faImage, count: data.cover.length, className: 'dash-color-5', path: '/cover' },
    { title: 'Audio Prank', icon: faFileAudio, count: data.audio.length, className: 'bg-c-green', path: '/type/audio' },
    { title: 'Video Prank', icon: faVideo, count: data.video.length, className: 'dash-color-1', path: '/type/video' },
    { title: 'Image Prank', icon: faPhotoFilm, count: data.gallery.length, className: 'bg-c-purple', path: '/type/image' },
  ];

  const userData = [
    { title: 'User Cover Image', icon: faImage, count: data.userCover.length, className: 'dash-color-1', path: '/user/cover' },
    { title: 'User Audio Prank', icon: faFileAudio, count: data.userAudio.length, className: 'dash-color-2', path: '/user/audio' },
    { title: 'User Video Prank', icon: faVideo, count: data.userVideo.length, className: 'dash-color-3', path: '/user/video' },
    { title: 'User Image Prank', icon: faPhotoFilm, count: data.userGallery.length, className: 'dash-color-4', path: '/user/image' },
  ];

  
  

  return (
    <>
      <div>
        <h4>Dashboard</h4>
      </div>

      <Row className='p-3 pt-5'>
        <h4>Prank :</h4>
        {cardData.map((card, index) => (
          <Col key={index} md={6} xl={3} className='my-3'>
            <Link to={card.path}>
              <Card className={card.className}>
                <Card.Body>
                  <h6 className="text-white fs-6">{card.title}</h6>
                  <h2 className="text-end text-white d-flex justify-content-between">
                    <FontAwesomeIcon className='fs-3' icon={card.icon} />
                    <span>{card.count}</span>
                  </h2>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Row className='p-3'>
        <h4>User Upload Prank :</h4>
        {userData.map((card, index) => (
          <Col key={index} md={6} xl={3} className='my-3'>
            <Link to={card.path}>
              <Card className={card.className}>
                <Card.Body>
                  <h6 className="text-white fs-6">{card.title}</h6>
                  <h2 className="text-end text-white d-flex justify-content-between">
                    <FontAwesomeIcon className='fs-3' icon={card.icon} />
                    <span>{card.count}</span>
                  </h2>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      









      
    </>
  );
};

export default DashAnalytics;