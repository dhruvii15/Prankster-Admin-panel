import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio, faPhotoFilm, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';

import logo from "../../assets/images/logo.svg";
import { Link } from 'react-router-dom';

// Registering necessary components for Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement);

const DashAnalytics = () => {
  const [data, setData] = useState({
    users: [],
    cover: [],
    audio: [],
    video: [],
    gallery: [],
    category: [],
    userAudio: [],
    userVideo: [],
    userGallery: [],
    userCover: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cover, audio, video, gallery, category, userAudio, userVideo, userGallery, userCover] = await Promise.all([
        axios.post('https://pslink.world/api/cover/read'),
        axios.post('https://pslink.world/api/audio/read'),
        axios.post('https://pslink.world/api/video/read'),
        axios.post('https://pslink.world/api/gallery/read'),
        axios.post('https://pslink.world/api/category/read'),
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
        category: category.data.data,
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

  useEffect(() => {
    fetchData();
  }, []);

  // const processData = useMemo(() => {
  //   const userCountByDate = {};
  //   data.users.forEach(user => {
  //     const date = new Date(user.createdAt);
  //     if (!isNaN(date.getTime())) {
  //       const formattedDate = `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  //       userCountByDate[formattedDate] = (userCountByDate[formattedDate] || 0) + 1;
  //     }
  //   });
  //   return {
  //     labels: Object.keys(userCountByDate),
  //     data: Object.values(userCountByDate),
  //   };
  // }, [data.users]);

  // Data for the line chart (User Creation Trend)
  // const chartData = {
  //   labels: processData.labels,
  //   datasets: [{
  //     label: 'Users Created per Day',
  //     data: processData.data,
  //     borderColor: 'rgba(75, 192, 192, 1)',
  //     backgroundColor: 'rgba(75, 192, 192, 0.2)',
  //     fill: true,
  //     tension: 0.1,
  //   }],
  // };

  // Data for the doughnut chart (Category Distribution)
  // const doughnutData = {
  //   labels: ["Audio", "Video", "Gallery"],
  //   datasets: [
  //     {
  //       label: "# of Items",
  //       data: [
  //         data.category.filter(item => item.Category === "audio").length,
  //         data.category.filter(item => item.Category === "video").length,
  //         data.category.filter(item => item.Category === "gallery").length
  //       ],
  //       backgroundColor: [
  //         "rgba(255, 99, 132, 0.2)",
  //         "rgba(54, 162, 235, 0.2)",
  //         "rgba(1,197,1, 0.2)",
  //       ],
  //       borderColor: [
  //         "rgba(255, 99, 132, 1)",
  //         "rgba(54, 162, 235, 1)",
  //         "rgba(75, 192, 192, 1)",
  //       ],
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  // // Options for the doughnut chart
  // const doughnutOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: "top",
  //     },
  //     tooltip: {
  //       enabled: true,
  //     },
  //   },
  // };

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
    { title: 'Audio Prank', icon: faFileAudio, count: data.audio.length, className: 'bg-c-purple', path: '/type/audio' },
    { title: 'Video Prank', icon: faVideo, count: data.video.length, className: 'bg-c-yellow', path: '/type/video' },
    { title: 'Image Prank', icon: faPhotoFilm, count: data.gallery.length, className: 'bg-c-green', path: '/type/image' },
  ];

  const userData = [
    { title: 'User Cover Image', icon: faImage, count: data.userCover.length, className: 'dash-color-1', path: '/user/cover' },
    { title: 'User Audio Prank', icon: faFileAudio, count: data.userAudio.length, className: 'dash-color-2', path: '/user/audio' },
    { title: 'User Video Prank', icon: faVideo, count: data.userVideo.length, className: 'dash-color-3', path: '/user/video' },
    { title: 'User Image Prank', icon: faPhotoFilm, count: data.userGallery.length, className: 'dash-color-4', path: '/user/image' },
  ];

  return (
    <>
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
        {/* <Col md={4} className='my-4'>
        <div className='bg-white h-100 p-3'>
          <h3>Category</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </Col> */}
        {/* <Col md={8} className='my-4'>
        <div className='bg-white rounded-3 p-3'>
          <h3>User Creation Trend:</h3>
          <Line data={chartData} />
        </div>
      </Col> */}
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