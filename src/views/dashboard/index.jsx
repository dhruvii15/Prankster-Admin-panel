import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio, faPhotoFilm, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';


import logo from "../../assets/images/logo.svg";
import { Link } from 'react-router-dom';
import StatusChart from 'components/statusChart';

// Registering necessary components for Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement);

const DashAnalytics = () => {
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
  const [notification, setnotification] = useState([]);

  const fetchData = async () => {
    try {
      const [cover, audio, video, gallery, userAudio, userVideo, userGallery, userCover] = await Promise.all([
        axios.post('http://localhost:5001/api/cover/read'),
        axios.post('http://localhost:5001/api/audio/read'),
        axios.post('http://localhost:5001/api/video/read'),
        axios.post('http://localhost:5001/api/gallery/read'),
        axios.post('http://localhost:5001/api/users/read', { TypeId: "1" }),
        axios.post('http://localhost:5001/api/users/read', { TypeId: "2" }),
        axios.post('http://localhost:5001/api/users/read', { TypeId: "3" }),
        axios.post('http://localhost:5001/api/users/read', { TypeId: "4" })
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
  const trendingCover = data.cover.filter(item => item.trending === true).length;
  const trendingAudio = data.audio.filter(item => item.trending === true).length;
  const trendingVideo = data.video.filter(item => item.trending === true).length;
  const trendingGallery = data.gallery.filter(item => item.trending === true).length;

  // Doughnut Chart Data
  const doughnutData = {
    labels: ["Cover", "Audio", "Video", "Gallery"],
    datasets: [
      {
        label: "Trending Items",
        data: [trendingCover, trendingAudio, trendingVideo, trendingGallery],
        backgroundColor: [
          "#C7CEFF",
          "#8593ED",
          "#5A6ACF",
          "rgb(105, 123, 240)"
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "60%", // Adjust the percentage to control the inner circle size
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const getData = () => {
    setLoading(true);
    axios.post('https://pslink.world/api/notification/read', { type: 'push' })
      .then((res) => {
        setnotification(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error("Failed to fetch data.");
      });
  };


  useEffect(() => {
    fetchData();
    getData();
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: "hidden"
      }}>
        <img src={logo} alt='loading....' style={{
          animation: "1.2s ease-out infinite zoom-in-zoom-out2",
          width: "200px"
        }} />
      </div>
    );
  }

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

      <Row className='p-3'>
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

      <Row className='py-5 px-4 mt-3 d-flex align-items-start'>
        <Col md={6} lg={4} className='mx-auto'>
          <h5 className="mb-4 pt-3">Trending Prank </h5>
          <Card className="p-2">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </Card>
        </Col>
        <Col md={12} lg={8} className='mx-auto mt-3'>
          <StatusChart />
        </Col>
      </Row>

      <h5 className="mb-4 pt-3">Push Notification : </h5>

      <Table striped hover bordered responsive className="text-center fs-6">
        <thead>
          <tr>
            <th>Index</th>
            <th>Notification Title</th>
            <th>Notification Description</th>
          </tr>
        </thead>
        <tbody>
          {notification.length > 0 ? (
            notification.slice(-7).map((notification, index) => (
              <tr
                key={notification._id}
                className={index % 2 === 1 ? 'bg-transparnet' : 'bg-transparnet'}
              >
                <td>{index + 1}</td>
                <td>{notification.Title}</td>
                <td>{notification.Description}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No notifications to display.
              </td>
            </tr>
          )}
        </tbody>
      </Table>


    </>
  );
};

export default DashAnalytics;