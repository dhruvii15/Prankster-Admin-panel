import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio, faPhotoFilm, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';

import logo from "../../assets/images/logo.svg";

// Registering necessary components for Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement);

const DashAnalytics = () => {
  const [data, setData] = useState({
    users: [],
    cover: [],
    audio: [],
    video: [],
    gallery: [],
    category: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cover, audio, video, gallery, category] = await Promise.all([
        axios.post('https://pslink.world/api/cover/read'),
        axios.post('https://pslink.world/api/audio/read'),
        axios.post('https://pslink.world/api/video/read'),
        axios.post('https://pslink.world/api/gallery/read'),
        axios.post('https://pslink.world/api/category/read')
      ]);

      setData({
        cover: cover.data.data,
        audio: audio.data.data,
        video: video.data.data,
        gallery: gallery.data.data,
        category: category.data.data
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
    { title: 'Cover-Image', icon: faImage, count: data.cover.length, className: 'bg-c-blue' },
    { title: 'Audio', icon: faFileAudio, count: data.audio.length, className: 'bg-c-purple' },
    { title: 'Video', icon: faVideo, count: data.video.length, className: 'bg-c-yellow' },
    { title: 'Gallery-Image', icon: faPhotoFilm, count: data.gallery.length, className: 'bg-c-green' },
  ];

  return (
    <Row className='p-3'>
      {cardData.map((card, index) => (
        <Col key={index} md={6} xl={3} className='my-3'>
          <Card className={card.className}>
            <Card.Body>
              <h6 className="text-white fs-6">{card.title}</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon className='fs-3' icon={card.icon} />
                <span>{card.count}</span>
              </h2>
            </Card.Body>
          </Card>
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
  );
};

export default DashAnalytics;