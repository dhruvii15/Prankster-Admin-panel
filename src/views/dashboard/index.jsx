import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio, faPhotoFilm, faVideo } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';


// img
import logo from "../../assets/images/logo.svg";
import { faImage } from '@fortawesome/free-regular-svg-icons';


// Register necessary Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const DashAnalytics = () => {

  const [cover, setData] = useState([]);
  const [audio, setData2] = useState([]);
  const [video, setData3] = useState([]);
  const [gallery, setData4] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(cover);
  
  const getData = () => {
    setLoading(true);
    axios.post('http://localhost:5001/api/cover/read')
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const getData2 = () => {
    setLoading(true);
    axios.post('http://localhost:5001/api/audio/read')
      .then((res) => {
        setData2(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const getData3 = () => {
    axios.post('http://localhost:5001/api/video/read')
      .then((res) => {
        setData3(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const getData4 = () => {
    axios.post('http://localhost:5001/api/gallery/read')
      .then((res) => {
        setData4(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };



  useEffect(() => {
    getData();
    getData2();
    getData3();
    getData4();
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
      <img src={logo} alt='loading....' style={{
        animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px"
      }} />
    </div>
  );

  return (
    <React.Fragment>
      <Row className='p-3'>
        {/* user Card */}
        <Col md={6} xl={3} className='my-3'>
          <Card className="bg-c-blue">
            <Card.Body>
              <h6 className="text-white fs-6">Cover-Image</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon className='fs-3' icon={faImage} />
                <span>{cover.length}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
        {/* Audio Card */}
        <Col md={6} xl={3} className='my-3'>
          <Card className="bg-c-purple">
            <Card.Body>
              <h6 className="text-white fs-6">Audio</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon className='fs-3' icon={faFileAudio} />
                <span>{audio.length}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
        {/* Video Card */}
        <Col md={6} xl={3} className='my-3'>
          <Card className="bg-c-yellow">
            <Card.Body>
              <h6 className="text-white fs-6">Video</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon className='fs-3' icon={faVideo} />
                <span>{video.length}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3} className='my-3'>
          <Card className="bg-c-green">
            <Card.Body>
              <h6 className="text-white fs-6">Gallery-Image</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon className='fs-3' icon={faPhotoFilm} />
                <span>{gallery.length}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
      
        
      </Row>
    </React.Fragment>
  );
};

export default DashAnalytics;
