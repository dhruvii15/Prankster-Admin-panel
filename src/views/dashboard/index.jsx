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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import StatusChart from 'components/statusChart';

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
  const languageMap = {
    1: 'Hindi',
    2: 'English',
    3: 'Marathi',
    4: 'Gujarati',
    5: 'Tamil',
    6: 'Punjabi'
  };

  const getLanguageName = (id) => languageMap[id];

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
  const trendingCover = data.cover.filter(item => item.trending === true).length;
  const trendingAudio = data.audio.filter(item => item.trending === true).length;
  const trendingVideo = data.video.filter(item => item.trending === true).length;
  const trendingGallery = data.gallery.filter(item => item.trending === true).length;

  // Doughnut Chart Data
  const doughnutData = {
    labels: [],
    datasets: [
      {
        label: "Trending Items",
        data: [trendingCover, trendingAudio, trendingVideo, trendingGallery],
        backgroundColor: [
          "#44a6e9",
          "#ff8548",
          "#fec600",
          "#15cab8"
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

  // Bar Chart Data for user content
  const barChartData = {
    labels: ['User Cover', 'User Audio', 'User Video', 'User Gallery'],
    datasets: [
      {
        label: 'User Content Count',
        data: [
          data.userCover.length || 0,
          data.userAudio.length || 0,
          data.userVideo.length || 0,
          data.userGallery.length || 0
        ], // If the data is empty, set it to 0
        backgroundColor: ['#0bb3ea', '#0bb3ea', '#0bb3ea', '#0bb3ea'],
        borderColor: ['#0bb3ea', '#0bb3ea', '#0bb3ea', '#0bb3ea'],
        borderWidth: 1,
      }
    ],
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      x: {
        grid: { display: false }, // Remove X-axis grid line
      },
      y: {
        grid: { display: false }, // Remove Y-axis grid line
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend (User Content Count)
      },
      tooltip: {
        enabled: false, // Hide tooltips
      },
    },
    elements: {
      bar: {
        borderRadius: 10, // Rounded edges
        barThickness: 30, // Adjust bar width
      },
    },
  };



  const lineChartData = {
    labels: [...new Set([
      ...data.audio.map(item => getLanguageName(item.LanguageId)),
      ...data.video.map(item => getLanguageName(item.LanguageId)),
      ...data.gallery.map(item => getLanguageName(item.LanguageId))
    ])].sort(),
    datasets: [
      {
        label: 'Audio',
        data: [...new Set([
          ...data.audio.map(item => item.LanguageId)
        ])].sort().map(langId =>
          data.audio.filter(item => item.LanguageId === langId).length
        ),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Video',
        data: [...new Set([
          ...data.video.map(item => item.LanguageId)
        ])].sort().map(langId =>
          data.video.filter(item => item.LanguageId === langId).length
        ),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Gallery',
        data: [...new Set([
          ...data.gallery.map(item => item.LanguageId)
        ])].sort().map(langId =>
          data.gallery.filter(item => item.LanguageId === langId).length
        ),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Update the lineChartOptions to reflect language distribution
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Content Distribution by Language'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Number of Items'
        }
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Language'
        }
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
      },
    },
  };



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

      <Row className='py-5 px-4 mt-3 d-flex align-items-start'>
        <Col md={12} lg={6} className='mx-auto mt-3'>
          <h5 className="mb-4">User Upload</h5>
          <div className='bg-white p-4 rounded-4 align-items-center' style={{ border: "1px solid #c1c1c1" }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </Col>
        <Col md={12} lg={6} className='mx-auto'>
          <h5 className="mb-4 pt-3">Trending Prank </h5>
          <div className="p-4 d-flex flex-wrap bg-white rounded-4 align-items-center" style={{ border: "1px solid #c1c1c1" }}>
            <div className='w-50'>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div className='pt-4 w-50 px-3'>
              <div className='d-flex align-items-center gap-3 py-1'>
                <span style={{ background: "#44a6e9", width: "12px", height: "12px" }} className='rounded-circle'></span>
                <span>Cover</span>
                <span className='ms-auto'>{trendingCover}</span>
              </div>

              <div className='d-flex align-items-center gap-3 py-1'>
                <span style={{ background: "#ff8548", width: "12px", height: "12px" }} className='rounded-circle'></span>
                <span>Audio</span>
                <span className='ms-auto'>{trendingAudio}</span>
              </div>

              <div className='d-flex align-items-center gap-3 py-1'>
                <span style={{ background: "#fec600", width: "12px", height: "12px" }} className='rounded-circle'></span>
                <span>Video</span>
                <span className='ms-auto'>{trendingVideo}</span>
              </div>

              <div className='d-flex align-items-center gap-3 py-1'>
                <span style={{ background: "#15cab8", width: "12px", height: "12px" }} className='rounded-circle'></span>
                <span>Gallery</span>
                <span className='ms-auto'>{trendingGallery}</span>
              </div>

            </div>
          </div>
        </Col>
      </Row>










      <Row className="py-5 px-4 d-flex align-items-stretch">
        <Col md={12} lg={4} className="mx-auto d-flex flex-column">
          <h5 className="mb-4">Prank Status</h5>
          <div className="bg-white rounded-4 py-4 px-3" style={{ border: "1px solid #c1c1c1", height: "100%" }}>
            <StatusChart />
          </div>
        </Col>
        <Col md={12} lg={8} className="mx-auto d-flex flex-column">
          <h5 className="mb-4">Language Chart</h5>
          <div className="bg-white rounded-4 p-3" style={{ border: "1px solid #c1c1c1", height: "100%" }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </Col>
      </Row>


    </>
  );
};

export default DashAnalytics;